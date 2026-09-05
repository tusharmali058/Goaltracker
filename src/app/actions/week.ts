"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ---------------------------------------------------------------------------
// CREATE WEEKLY PLAN (requires group membership)
// ---------------------------------------------------------------------------

export async function createWeeklyPlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const groupId = formData.get("groupId") as string;
  if (!groupId) return { error: "Group is required" };

  // Verify group membership
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });
  if (!membership) return { error: "You are not a member of this group" };

  // Check if there's already a plan for this week
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const existing = await prisma.weeklyPlan.findFirst({
    where: {
      userId: session.user.id,
      groupId,
      startDate: { gte: weekStart },
      endDate: { lte: weekEnd },
    },
  });

  if (existing) return { error: "You already have a weekly plan for this week" };

  // Check admin's weekly deadline
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (group?.weeklyDeadline && new Date() > group.weeklyDeadline) {
    return { error: "The weekly submission deadline has passed. Ask your admin to extend it." };
  }

  await prisma.weeklyPlan.create({
    data: {
      userId: session.user.id,
      groupId,
      startDate: weekStart,
      endDate: weekEnd,
    },
  });

  revalidatePath("/week");
  return { success: true };
}

// ---------------------------------------------------------------------------
// ADD WEEKLY TARGET (linked to monthly commitment)
// ---------------------------------------------------------------------------

const addTargetSchema = z.object({
  weeklyPlanId: z.string().min(1),
  title: z.string().min(1, "Target title is required").max(200),
  monthlyCommitmentId: z.string().optional(),
  weight: z.coerce.number().min(1).max(10).default(1),
});

export async function addWeeklyTarget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const data = {
    weeklyPlanId: formData.get("weeklyPlanId") as string,
    title: formData.get("title") as string,
    monthlyCommitmentId: (formData.get("monthlyCommitmentId") as string) || undefined,
    weight: formData.get("weight") as string,
  };

  const result = addTargetSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" };
  }

  // Verify the plan belongs to this user
  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: result.data.weeklyPlanId, userId: session.user.id },
  });
  if (!plan) return { error: "Weekly plan not found" };
  if (plan.isLocked) return { error: "This weekly plan is locked" };

  await prisma.weeklyTarget.create({
    data: {
      weeklyPlanId: plan.id,
      title: result.data.title,
      monthlyCommitmentId: result.data.monthlyCommitmentId || null,
      weight: result.data.weight,
    },
  });

  revalidatePath("/week");
  return { success: true };
}

// ---------------------------------------------------------------------------
// ADD DAILY ASSIGNMENT (within a weekly target)
// ---------------------------------------------------------------------------

const addAssignmentSchema = z.object({
  weeklyTargetId: z.string().min(1),
  title: z.string().min(1, "Assignment title is required").max(200),
  date: z.string().min(1, "Date is required"),
});

export async function addDailyAssignment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const data = {
    weeklyTargetId: formData.get("weeklyTargetId") as string,
    title: formData.get("title") as string,
    date: formData.get("date") as string,
  };

  const result = addAssignmentSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" };
  }

  // Verify ownership through target -> plan chain
  const target = await prisma.weeklyTarget.findFirst({
    where: { id: result.data.weeklyTargetId },
    include: { weeklyPlan: true },
  });

  if (!target || target.weeklyPlan.userId !== session.user.id) {
    return { error: "Target not found" };
  }

  await prisma.dailyAssignment.create({
    data: {
      userId: session.user.id,
      weeklyTargetId: target.id,
      title: result.data.title,
      date: new Date(result.data.date),
    },
  });

  revalidatePath("/week");
  revalidatePath("/");
  return { success: true };
}
