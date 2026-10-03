import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';

export function AppShell({
  children,
  isAdmin,
  userName,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  userName?: string | null;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main area — offset for sidebar on desktop */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        {/* Top Header */}
        <Header userName={userName} />

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto pb-24 lg:pb-6">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
