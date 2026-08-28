"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { calculateDailyScore } from "@/lib/scoring";
import { revalidatePath } from "next/cache";

export async function finishDay(dateStr: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const targetDate = new Date(dateStr);
  
  // 1. Validate if day is already finalized
  const existingCheckIn = await prisma.dailyCheckIn.findUnique({
    where: {
      userId_date: {
        userId,
        date: targetDate
      }
    }
  });

  if (existingCheckIn) {
    throw new Error("Day is already finalized");
  }

  await prisma.$transaction(async (tx) => {
    // 2. Get today's assignments
    const assignments = await tx.dailyAssignment.findMany({
      where: {
        userId,
        date: targetDate,
        isLocked: false
      }
    });

    const totalTasks = assignments.length;
    const completedTasks = assignments.filter(a => a.isCompleted);
    
    let totalWeights = 0;
    let completedWeights = 0;

    for (const a of assignments) {
      totalWeights += a.weight;
      if (a.isCompleted) completedWeights += a.weight;
    }

    const dailyScore = calculateDailyScore(completedWeights, totalWeights);

    // 3. Create backlog records for incomplete assignments
    const incompleteAssignments = assignments.filter(a => !a.isCompleted);
    for (const a of incompleteAssignments) {
      await tx.backlogItem.create({
        data: {
          userId,
          dailyAssignmentId: a.id,
          originalDate: a.date
        }
      });
    }

    // 4. Create Daily Check-in
    await tx.dailyCheckIn.create({
      data: {
        userId,
        date: targetDate,
        totalTasks,
        completedTasks: completedTasks.length,
        scoreEarned: dailyScore
      }
    });

    // 5. Update Streak
    const streak = await tx.streak.findUnique({ where: { userId } });
    if (streak) {
      const newCount = streak.currentCount + 1;
      const newLongest = Math.max(newCount, streak.longestCount);
      await tx.streak.update({
        where: { userId },
        data: {
          currentCount: newCount,
          longestCount: newLongest,
          lastCheckIn: targetDate
        }
      });
    } else {
      await tx.streak.create({
        data: {
          userId,
          currentCount: 1,
          longestCount: 1,
          lastCheckIn: targetDate
        }
      });
    }

    // 6. Create Score Transaction
    await tx.scoreTransaction.create({
      data: {
        userId,
        sourceType: "DAILY_CHECKIN",
        sourceId: targetDate.toISOString(),
        points: dailyScore,
        earnedPoints: dailyScore
      }
    });

    // 7. Lock the assignments so they cannot be rewritten
    await tx.dailyAssignment.updateMany({
      where: {
        userId,
        date: targetDate
      },
      data: {
        isLocked: true
      }
    });
  });

  revalidatePath("/");
  return { success: true };
}

export async function toggleAssignment(id: string, isCompleted: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const assignment = await prisma.dailyAssignment.findUnique({
    where: { id }
  });

  if (!assignment || assignment.userId !== session.user.id) {
    throw new Error("Not found");
  }

  if (assignment.isLocked) {
    throw new Error("Cannot edit locked assignment");
  }

  await prisma.dailyAssignment.update({
    where: { id },
    data: { isCompleted }
  });

  revalidatePath("/");
  return { success: true };
}
