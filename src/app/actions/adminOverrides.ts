"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helper: get admin's groups
// ---------------------------------------------------------------------------

export async function getAdminGroups() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id, role: "ADMIN" },
    include: { group: true },
  });

  return memberships.map((m) => m.group);
}

// ---------------------------------------------------------------------------
// ADJUST SCORE (admin only)
// ---------------------------------------------------------------------------

export async function adjustScore(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const groupId = formData.get("groupId") as string;
  const targetUserId = formData.get("targetUserId") as string;
  const points = parseFloat(formData.get("points") as string);
  const reason = formData.get("reason") as string;

  if (!groupId || !targetUserId || isNaN(points) || !reason) {
    return { error: "Missing required fields" };
  }

  // Verify admin
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only admins can adjust scores" };
  }

  // Verify target user is in the group
  const targetMembership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });

  if (!targetMembership) {
    return { error: "Target user is not a member of this group" };
  }

  // Create score transaction
  const txn = await prisma.scoreTransaction.create({
    data: {
      userId: targetUserId,
      groupId,
      sourceType: "ADMIN_ADJUSTMENT",
      sourceId: session.user.id,
      points,
      multiplier: 1.0,
      earnedPoints: points,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      groupId,
      affectedUser: targetUserId,
      actionType: "ADJUST_SCORE",
      entityType: "ScoreTransaction",
      entityId: txn.id,
      previousVal: null,
      newVal: JSON.stringify({ points, earnedPoints: points }),
      reason,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/overrides");
  revalidatePath("/admin/audit");
  revalidatePath("/group");
  return { success: true };
}

// ---------------------------------------------------------------------------
// EDIT WEEKLY TARGET (admin only)
// ---------------------------------------------------------------------------

export async function editWeeklyTarget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in" };

  const groupId = formData.get("groupId") as string;
  const targetId = formData.get("targetId") as string;
  const newTitle = formData.get("title") as string;
  const newWeight = parseInt(formData.get("weight") as string, 10);

  if (!groupId || !targetId || !newTitle || isNaN(newWeight)) {
    return { error: "Missing required fields" };
  }

  // Verify admin
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only admins can edit weekly targets" };
  }

  // Get the existing target
  const existing = await prisma.weeklyTarget.findUnique({
    where: { id: targetId },
    include: { weeklyPlan: true },
  });

  if (!existing || existing.weeklyPlan.groupId !== groupId) {
    return { error: "Target not found in this group" };
  }

  const previousVal = JSON.stringify({
    title: existing.title,
    weight: existing.weight,
  });

  // Update the target
  await prisma.weeklyTarget.update({
    where: { id: targetId },
    data: { title: newTitle, weight: newWeight },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      groupId,
      affectedUser: existing.weeklyPlan.userId,
      actionType: "EDIT_WEEKLY_TARGET",
      entityType: "WeeklyTarget",
      entityId: targetId,
      previousVal,
      newVal: JSON.stringify({ title: newTitle, weight: newWeight }),
      reason: `Admin edited weekly target`,
    },
  });

  revalidatePath("/admin/overrides");
  revalidatePath("/admin/audit");
  revalidatePath("/week");
  return { success: true };
}
