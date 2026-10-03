'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Map,
  Users,
  User,
  Shield,
  FileEdit,
  ScrollText,
} from 'lucide-react';

const mainNav = [
  { href: '/', label: 'Today', icon: LayoutDashboard },
  { href: '/week', label: 'Week', icon: CalendarDays },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/group', label: 'Group', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/overrides', label: 'Overrides', icon: FileEdit },
  { href: '/admin/audit', label: 'Audit Log', icon: ScrollText },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-screen fixed left-0 top-0 z-30 bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)]">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">GoalTracker</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-2">
          Workspace
        </p>
        {mainNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[var(--color-sidebar-active)] text-white shadow-lg shadow-violet-600/20'
                  : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-white'
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-2">
                Admin
              </p>
            </div>
            {adminNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-red-500/20 text-red-300'
                      : 'text-[var(--color-sidebar-text)] hover:bg-red-500/10 hover:text-red-300'
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 text-[10px] text-white/20">
          © {new Date().getFullYear()} GoalTracker
        </div>
      </div>
    </aside>
  );
}
