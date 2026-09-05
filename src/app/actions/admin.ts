"use server"

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// SET MONTHLY DEADLINE (admin only)
// ---------------------------------------------------------------------------

export async function setMonthlyDeadline(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const groupId = formData.get("groupId") as string;
  const deadline = formData.get("deadline") as string;

  if (!groupId || !deadline) return { error: "Missing required fields" };

  // Verify admin
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only admins can set deadlines" };
  }

  await prisma.group.update({
    where: { id: groupId },
    data: { monthlyDeadline: new Date(deadline) },
  });

  revalidatePath("/group");
  return { success: true };
}

// ---------------------------------------------------------------------------
// SET WEEKLY DEADLINE (admin only)
// ---------------------------------------------------------------------------

export async function setWeeklyDeadline(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const groupId = formData.get("groupId") as string;
  const deadline = formData.get("deadline") as string;

  if (!groupId || !deadline) return { error: "Missing required fields" };

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only admins can set deadlines" };
  }

  await prisma.group.update({
    where: { id: groupId },
    data: { weeklyDeadline: new Date(deadline) },
  });

  revalidatePath("/group");
  return { success: true };
}

// ---------------------------------------------------------------------------
// EXTEND DEADLINE (admin only)
// ---------------------------------------------------------------------------

export async function extendDeadline(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const groupId = formData.get("groupId") as string;
  const type = formData.get("type") as string; // "monthly" or "weekly"
  const newDeadline = formData.get("deadline") as string;

  if (!groupId || !type || !newDeadline) return { error: "Missing required fields" };

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only admins can extend deadlines" };
  }

  const updateData = type === "monthly"
    ? { monthlyDeadline: new Date(newDeadline) }
    : { weeklyDeadline: new Date(newDeadline) };

  await prisma.group.update({
    where: { id: groupId },
    data: updateData,
  });

  revalidatePath("/group");
  return { success: true };
}
