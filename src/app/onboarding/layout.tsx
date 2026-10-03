import { AppShell } from "@/components/layout/AppShell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Minimal header for onboarding */}
      <header className="h-16 px-6 flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <span className="font-bold text-lg text-[var(--color-primary)] tracking-tight">GoalTracker</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
