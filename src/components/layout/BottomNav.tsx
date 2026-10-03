'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CalendarDays, Map, Users, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Today', icon: LayoutDashboard },
  { href: '/week', label: 'Week', icon: CalendarDays },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/group', label: 'Group', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--color-border)]">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-md)] transition-all duration-150 min-w-0',
                active
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              )}
            >
              <tab.icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(124,58,237,0.4)]')} />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
