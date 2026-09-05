"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ---------------------------------------------------------------------------
// CREATE GOAL (personal, user-owned)
// ---------------------------------------------------------------------------

const createGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required").max(100, "Title is too long"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export async function createGoal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const data = {
    title: formData.get("title") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
  };

  const result = createGoalSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" };
  }

  const { title, startDate, endDate } = result.data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return { error: "End date must be after start date" };
  }

  // Enforce one active goal per user
  const existing = await prisma.goal.findFirst({ where: { userId: session.user.id } });
  if (existing) {
    return { error: "You already have an active goal. Complete or delete it first." };
  }

  await prisma.goal.create({
    data: {
      userId: session.user.id,
      title,
      startDate: start,
      endDate: end,
    },
  });

  revalidatePath("/");
  revalidatePath("/roadmap");
  return { success: true };
}

// ---------------------------------------------------------------------------
// ROADMAP MONTHS
// ---------------------------------------------------------------------------

const addMonthSchema = z.object({
  goalId: z.string().min(1),
  title: z.string().min(1, "Month title is required").max(100),
});

export async function addRoadmapMonth(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const data = {
    goalId: formData.get("goalId") as string,
    title: formData.get("title") as string,
  };

  const result = addMonthSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" };
  }

  // Verify the goal belongs to this user
  const goal = await prisma.goal.findFirst({
    where: { id: result.data.goalId, userId: session.user.id },
    include: { months: true },
  });

  if (!goal) return { error: "Goal not found" };

  const nextOrder = goal.months.length + 1;

  await prisma.roadmapMonth.create({
    data: {
      goalId: goal.id,
      title: result.data.title,
      order: nextOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/roadmap");
  return { success: true };
}

// ---------------------------------------------------------------------------
// MONTHLY COMMITMENTS
// ---------------------------------------------------------------------------

const addCommitmentSchema = z.object({
  monthId: z.string().min(1),
  title: z.string().min(1, "Commitment title is required").max(200),
});

export async function addMonthlyCommitment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const data = {
    monthId: formData.get("monthId") as string,
    title: formData.get("title") as string,
  };

  const result = addCommitmentSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" };
  }

  // Verify ownership through goal -> month chain
  const month = await prisma.roadmapMonth.findFirst({
    where: { id: result.data.monthId },
    include: { goal: true, commitments: true },
  });

  if (!month || month.goal.userId !== session.user.id) {
    return { error: "Month not found" };
  }

  if (month.isLocked) {
    return { error: "This month is locked and cannot be modified" };
  }

  const nextOrder = month.commitments.length + 1;

  await prisma.monthlyCommitment.create({
    data: {
      roadmapMonthId: month.id,
      title: result.data.title,
      order: nextOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/roadmap");
  return { success: true };
}
