import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { CreateGoalForm } from "@/components/CreateGoalForm";
import { RoadmapBuilder } from "@/components/RoadmapBuilder";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Fetch user's personal goal
  const goal = await prisma.goal.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      months: {
        orderBy: { order: "asc" },
        include: {
          commitments: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  // Check if user is in a group
  const membership = await prisma.groupMember.findFirst({
    where: { userId },
    include: { group: true },
  });

  const streak = await prisma.streak.findUnique({ where: { userId } });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weeklyScoreTxns = await prisma.scoreTransaction.aggregate({
    where: { userId, createdAt: { gte: weekStart } },
    _sum: { earnedPoints: true },
  });
  const weeklyScore = Math.round(weeklyScoreTxns._sum.earnedPoints ?? 0);

  let progressPercent = 0;
  let daysRemaining = 0;
  if (goal) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDuration = goal.endDate.getTime() - goal.startDate.getTime();
    const totalCheckIns = await prisma.dailyCheckIn.count({ where: { userId } });
    const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24)));
    progressPercent = Math.min(100, Math.round((totalCheckIns / totalDays) * 100));
    daysRemaining = Math.max(0, Math.ceil((goal.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const serializedMonths = goal?.months.map(m => ({
    id: m.id,
    title: m.title,
    order: m.order,
    isLocked: m.isLocked,
    commitments: m.commitments.map(c => ({
      id: c.id,
      title: c.title,
      order: c.order,
    })),
  })) ?? [];

  // Check if roadmap has at least one month with commitments
  const hasCommitments = serializedMonths.some(m => m.commitments.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Dashboard</h1>
        <p className="text-[var(--color-muted)] mt-1">Welcome back, {session.user.name || "Student"}</p>
      </div>

      {/* Step 1: No goal yet */}
      {!goal ? (
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] text-center">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <StepBadge step={1} label="Set Goal" active />
            <StepConnector />
            <StepBadge step={2} label="Build Roadmap" />
            <StepConnector />
            <StepBadge step={3} label="Join Group" />
          </div>

          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Set Your Goal</h2>
          <p className="text-[var(--color-muted)] mb-6 max-w-sm mx-auto">
            Start by defining your long-term goal. Then build your roadmap with monthly milestones.
          </p>
          <CreateGoalForm />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Column */}
          <div className="md:col-span-8 space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <StepBadge step={1} label="Set Goal" completed />
              <StepConnector completed />
              <StepBadge step={2} label="Build Roadmap" active={!hasCommitments} completed={hasCommitments} />
              <StepConnector completed={hasCommitments} />
              <StepBadge step={3} label="Join Group" active={hasCommitments && !membership} completed={!!membership} />
            </div>

            {/* Goal Overview */}
            <section className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2">MY GOAL</h2>
              <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{goal.title}</h3>
              <div className="w-full bg-[var(--color-secondary)] h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-[var(--color-accent)] h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between text-sm text-[var(--color-muted)]">
                <span>{progressPercent}% complete</span>
                <span>{daysRemaining} days remaining</span>
              </div>
            </section>

            {/* Step 2: Build Roadmap */}
            <section className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">ROADMAP & MONTHLY COMMITMENTS</h2>
              </div>
              {serializedMonths.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)] mb-4">
                  Break your goal into monthly milestones. Add months and commitments for each.
                </p>
              ) : null}
              <RoadmapBuilder goalId={goal.id} months={serializedMonths} />
            </section>

            {/* Step 3: Group gate — shown once roadmap has commitments */}
            {hasCommitments && !membership && (
              <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-800 mb-1">Your Roadmap is Ready!</h2>
                    <p className="text-sm text-blue-700 mb-3">
                      Join or create a group to unlock weekly targets and daily assignments.
                      Your group admin will set submission deadlines for weekly planning.
                    </p>
                    <Link
                      href="/group"
                      className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Go to Groups
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Already in a group — show link to weekly planning */}
            {membership && (
              <section className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-800 mb-1">You&apos;re in a Group!</h2>
                    <p className="text-sm text-green-700 mb-1">
                      Group: <span className="font-semibold">{membership.group.name}</span>
                    </p>
                    <p className="text-sm text-green-700 mb-3">
                      Head to your Weekly Plan to set targets and manage daily assignments.
                    </p>
                    <Link
                      href="/week"
                      className="inline-block px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Go to Weekly Plan
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <section className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">STATS</h2>
              <div>
                <div className="text-3xl font-bold text-[var(--color-primary)]">
                  {streak?.currentCount ?? 0} <span className="text-lg text-[var(--color-muted)] font-normal">days</span>
                </div>
                <div className="text-sm text-[var(--color-muted)]">Current streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--color-primary)]">{weeklyScore}</div>
                <div className="text-sm text-[var(--color-muted)]">Weekly score</div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stepper sub-components ── */

function StepBadge({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  const base = "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors";
  if (completed) {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {label}
      </span>
    );
  }
  if (active) {
    return (
      <span className={`${base} bg-[var(--color-accent)] text-white`}>
        <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-white/20 rounded-full">{step}</span>
        {label}
      </span>
    );
  }
  return (
    <span className={`${base} bg-[var(--color-secondary)] text-[var(--color-muted)]`}>
      <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-[var(--color-border)] rounded-full">{step}</span>
      {label}
    </span>
  );
}

function StepConnector({ completed }: { completed?: boolean }) {
  return (
    <div className={`w-6 h-0.5 ${completed ? "bg-green-300" : "bg-[var(--color-border)]"}`} />
  );
}
