"use server"

import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export async function registerUser(formData: FormData) {
  const data = Object.fromEntries(formData);
  console.log("[registerUser] Form data keys:", Object.keys(data));
  const result = registerSchema.safeParse(data);
  
  if (!result.success) {
    console.error("[registerUser] Validation errors:", JSON.stringify(result.error.flatten()));
    const firstError = result.error.issues[0]?.message || "InvalidData";
    redirect(`/register?error=${encodeURIComponent(firstError)}`);
  }
  
  const { name, email, password } = result.data;
  
  // check duplicate email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    redirect("/login?message=AccountExists");
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });
  
  redirect("/login?message=RegisteredSuccessfully");
}

export async function loginUser(formData: FormData) {
  const { signIn } = await import("@/auth");
  const { AuthError } = await import("next-auth");

  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/",
    });
  } catch (error) {
    // NextAuth v5 throws a NEXT_REDIRECT on successful sign-in.
    // We MUST re-throw it so Next.js can perform the redirect.
    if (error instanceof Error && error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof AuthError) {
      redirect("/login?error=InvalidCredentials");
    }
    throw error;
  }
}
