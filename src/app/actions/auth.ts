"use server"

import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export async function registerUser(formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = registerSchema.safeParse(data);
  
  if (!result.success) {
    redirect("/register?error=InvalidData");
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
  
  const credentials = Object.fromEntries(formData);
  
  try {
    await signIn("credentials", { ...credentials, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      // If it's an AuthError (wrong password, missing secret), redirect back to login
      redirect("/login?error=InvalidCredentials");
    }
    // We MUST throw the error so Next.js can handle the redirect!
    throw error;
  }
}
