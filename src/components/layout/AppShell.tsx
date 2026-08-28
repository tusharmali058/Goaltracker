'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppShell({ children, isAdmin }: { children: React.ReactNode, isAdmin?: boolean }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-[var(--color-primary)]">
            <Link href="/">GoalTracker</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-muted)] relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
            </button>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-primary)]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      {/* Right-Side Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-50 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Right-Side Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-[var(--color-surface)] shadow-xl transform transition-transform duration-300 ease-in-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <span className="font-semibold text-[var(--color-primary)]">Menu</span>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-muted)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Workspace</h3>
              <nav className="flex flex-col gap-1">
                <Link href="/" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Dashboard</Link>
                <Link href="/roadmap" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">My Roadmap</Link>
                <Link href="/week" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">This Week</Link>
              </nav>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Group</h3>
              <nav className="flex flex-col gap-1">
                <Link href="/group" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Group</Link>
                <Link href="/group/leaderboard" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Leaderboard</Link>
              </nav>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Account</h3>
              <nav className="flex flex-col gap-1">
                <Link href="/profile" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Profile</Link>
                <Link href="/settings" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Settings</Link>
              </nav>
            </div>

            {isAdmin && (
              <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
                <h3 className="text-xs font-semibold text-[var(--color-destructive)] uppercase tracking-wider">Admin</h3>
                <nav className="flex flex-col gap-1">
                  <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Admin Dashboard</Link>
                  <Link href="/admin/overrides" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Overrides</Link>
                  <Link href="/admin/audit" className="px-3 py-2 rounded-md hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]">Audit Log</Link>
                </nav>
                <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
                  <p className="text-sm text-red-800 font-medium">Admin Mode</p>
                  <button className="mt-2 w-full px-3 py-1.5 bg-white border border-red-200 rounded text-red-700 text-sm font-medium hover:bg-red-50">
                    Switch to Admin Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
