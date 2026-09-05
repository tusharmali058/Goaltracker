"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] p-8 rounded-lg shadow-sm border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">GoalTracker</h1>
          <p className="text-[var(--color-muted)] mt-2">Create a new account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" action={registerUser}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Name</label>
            <input 
              name="name"
              type="text" 
              required
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Password</label>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                required
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"} 
                required
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] font-medium"
          >
            Sign up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
