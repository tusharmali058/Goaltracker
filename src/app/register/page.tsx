"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%)' }}>
      {/* Decorative blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-72 h-72 bg-violet-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md slide-up">
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[var(--radius-xl)] shadow-xl border border-white/50">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-[var(--radius-md)] bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-white text-xl font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">Create your account</h1>
            <p className="text-[var(--color-muted)] mt-1 text-sm">Start tracking your goals today</p>
          </div>

          <Suspense fallback={<div className="text-center text-[var(--color-muted)]">Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm font-medium slide-up">
          {error}
        </div>
      )}

      <form className="space-y-4" action={registerUser}>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-white text-sm transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-white text-sm transition-all"
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
              className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-white text-sm transition-all pr-11"
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
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent focus:bg-white text-sm transition-all pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] focus:outline-none transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] hover:shadow-lg hover:shadow-violet-500/25 font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          Create account
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-accent)] hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </>
  );
}
