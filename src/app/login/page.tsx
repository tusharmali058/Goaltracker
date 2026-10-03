"use client";

import { useState, Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [state, formAction, isPending] = useActionState(loginUser, { error: null });

  const displayError = state?.error
    ? (state.error === "InvalidCredentials"
        ? "Invalid email or password. Please try again."
        : state.error)
    : (urlError === "InvalidCredentials"
        ? "Invalid email or password. Please try again."
        : null);

  return (
    <>
      {/* Success message */}
      {urlMessage === "RegisteredSuccessfully" && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-[var(--radius-md)] text-emerald-700 text-sm font-medium slide-up">
          ✓ Account created successfully! Please sign in.
        </div>
      )}
      {urlMessage === "AccountExists" && (
        <div className="mb-5 p-3.5 bg-violet-50 border border-violet-200 rounded-[var(--radius-md)] text-violet-700 text-sm font-medium slide-up">
          Account already exists. Please sign in.
        </div>
      )}

      {/* Error messages */}
      {displayError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm font-medium slide-up">
          {displayError}
        </div>
      )}

      <form className="space-y-5" action={formAction}>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            required
            disabled={isPending}
            className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-white disabled:opacity-50 text-sm transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-white disabled:opacity-50 text-sm transition-all pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] focus:outline-none transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] hover:shadow-lg hover:shadow-violet-500/25 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[var(--color-accent)] hover:underline font-semibold">
          Sign up
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%)' }}>
      {/* Decorative blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-72 h-72 bg-violet-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md slide-up">
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[var(--radius-xl)] shadow-xl border border-white/50">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-[var(--radius-md)] bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-white text-xl font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">Welcome back</h1>
            <p className="text-[var(--color-muted)] mt-1 text-sm">Sign in to your GoalTracker account</p>
          </div>

          <Suspense fallback={<div className="text-center text-[var(--color-muted)]">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
