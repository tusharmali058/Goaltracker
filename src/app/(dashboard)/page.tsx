import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  // Basic dashboard fetch logic
  const goal = await prisma.goal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Dashboard</h1>
        <p className="text-[var(--color-muted)] mt-1">Welcome back, {session.user.name || 'Student'}</p>
      </div>

      {!goal ? (
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] text-center">
          <h2 className="text-xl font-semibold mb-2">No Goal Found</h2>
          <p className="text-[var(--color-muted)] mb-4">Create your first goal to get started.</p>
          <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-blue-600 font-medium">
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            
            {/* Goal Overview */}
            <section className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2">GOAL</h2>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{goal.title}</h3>
              
              <div className="w-full bg-[var(--color-secondary)] h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-[var(--color-accent)] h-full w-[64%]"></div>
              </div>
              <div className="flex justify-between text-sm text-[var(--color-muted)]">
                <span>64% complete</span>
                <span>124 days remaining</span>
              </div>
            </section>

            {/* Today's Assignments */}
            <section>
              <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">TODAY</h2>
              <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm space-y-4">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded border border-[var(--color-border)] opacity-60">
                    <input type="checkbox" checked readOnly className="w-5 h-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                    <span className="line-through text-[var(--color-muted)]">Solve 3 DSA problems</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                    <span className="text-[var(--color-foreground)]">Complete React lesson</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-muted)]">1 / 2 completed</span>
                  <button className="px-6 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-slate-800 font-medium transition-colors">
                    FINISH DAY
                  </button>
                </div>
              </div>
            </section>
            
          </div>

          <div className="md:col-span-4 space-y-6">
             {/* Stats */}
             <section className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">STATS</h2>
              
              <div>
                <div className="text-3xl font-bold text-[var(--color-primary)]">18 <span className="text-lg text-[var(--color-muted)] font-normal">days</span></div>
                <div className="text-sm text-[var(--color-muted)]">Current streak</div>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-[var(--color-primary)]">842</div>
                <div className="text-sm text-[var(--color-muted)]">Weekly score</div>
              </div>
            </section>

            {/* Backlog */}
            <section className="bg-amber-50 p-6 rounded-lg border border-amber-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800">BACKLOG</h2>
              <p className="text-xs text-amber-700 mb-2">Backlog does not affect today's planned-task score.</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-white rounded border border-amber-200">
                  <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm text-amber-900">Build login form</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
