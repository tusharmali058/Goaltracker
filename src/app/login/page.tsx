"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await loginUser(formData);
    } catch (err: unknown) {
      // If it's a redirect, it will be handled by Next.js automatically
      // If it reaches here, something went wrong
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (!message.includes("NEXT_REDIRECT")) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] p-8 rounded-lg shadow-sm border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">GoalTracker</h1>
          <p className="text-[var(--color-muted)] mt-2">Sign in to your account</p>
        </div>

        {/* Success message */}
        {urlMessage === "RegisteredSuccessfully" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            Account created successfully! Please sign in.
          </div>
        )}
        {urlMessage === "AccountExists" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
            Account already exists. Please sign in.
          </div>
        )}

        {/* Error messages */}
        {(urlError || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {urlError === "InvalidCredentials"
              ? "Invalid email or password. Please try again."
              : error || "An error occurred. Please try again."}
          </div>
        )}

        <form className="space-y-4" action={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
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
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
