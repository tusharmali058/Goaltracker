"use server";

import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Group name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
});

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  // Verify user exists in DB (guards against stale JWT after DB reset)
  const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!userExists) {
    return { error: "Session expired. Please sign out and sign back in." };
  }

  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const result = createGroupSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" };
  }

  const { name, description } = result.data;

  // Generate a unique 8-char invite code
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();

  const group = await prisma.group.create({
    data: {
      name,
      description: description || null,
      code,
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/group");
  return { success: true, groupId: group.id };
}

export async function joinGroup(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) {
    return { error: "Please enter a group code" };
  }

  const group = await prisma.group.findUnique({ where: { code } });
  if (!group) {
    return { error: "Invalid group code. Please check and try again." };
  }

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: group.id } },
  });
  if (existing) {
    return { error: "You are already a member of this group" };
  }

  await prisma.groupMember.create({
    data: {
      userId: session.user.id,
      groupId: group.id,
      role: "STUDENT",
    },
  });

  revalidatePath("/group");
  return { success: true };
}
