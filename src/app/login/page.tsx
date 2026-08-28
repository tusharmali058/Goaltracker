import Link from "next/link";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] p-8 rounded-lg shadow-sm border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">GoalTracker</h1>
          <p className="text-[var(--color-muted)] mt-2">Sign in to your account</p>
        </div>

        <form className="space-y-4" action={async (formData) => {
          "use server"
          await signIn("credentials", formData)
        }}>
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
            <input 
              name="password"
              type="password" 
              required
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] font-medium"
          >
            Sign in
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
