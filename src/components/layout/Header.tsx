'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';
import { logoutUser } from '@/app/actions/logout';

export function Header({ userName }: { userName?: string | null }) {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await logoutUser();
    });
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <span className="font-bold text-lg text-[var(--color-primary)] tracking-tight">GoalTracker</span>
        </div>

        {/* Desktop greeting */}
        <div className="hidden lg:block">
          <p className="text-sm text-[var(--color-muted)]">
            Welcome back, <span className="font-semibold text-[var(--color-foreground)]">{userName || 'Student'}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-secondary)] text-[var(--color-muted)] transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent)] rounded-full ring-2 ring-[var(--color-surface)]" />
          </button>

          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="p-2 rounded-[var(--radius-md)] hover:bg-red-50 text-[var(--color-muted)] hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
