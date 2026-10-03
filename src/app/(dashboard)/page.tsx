import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TodaySection, BacklogSection } from "@/components/DailyDashboard";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Flame, Target, TrendingUp, CheckCircle2, CalendarDays, Map } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Check if user needs onboarding
  const goal = await prisma.goal.findFirst({ where: { userId } });
  if (!goal) {
    redirect("/onboarding");
  }

  const membership = await prisma.groupMember.findFirst({
    where: { userId },
    select: { groupId: true },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Run all queries in parallel
  const [assignments, dailyCheckIn, backlogItems, streak, todayScoreTxns, weeklyScoreTxns] = await Promise.all([
    prisma.dailyAssignment.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dailyCheckIn.findFirst({
      where: { userId, date: { gte: today, lt: tomorrow } },
    }),
    prisma.backlogItem.findMany({
      where: { userId, isCompleted: false },
      include: { assignment: true },
      orderBy: { originalDate: "asc" },
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.scoreTransaction.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { earnedPoints: true },
    }),
    (() => {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return prisma.scoreTransaction.aggregate({
        where: { userId, createdAt: { gte: weekStart } },
        _sum: { earnedPoints: true },
      });
    })(),
  ]);

  const todayScore = Math.round(todayScoreTxns._sum.earnedPoints ?? 0);
  const weeklyScore = Math.round(weeklyScoreTxns._sum.earnedPoints ?? 0);
  const completedCount = assignments.filter(a => a.isCompleted).length;
  const totalCount = assignments.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const serializedAssignments = assignments.map(a => ({
    id: a.id,
    title: a.title,
    isCompleted: a.isCompleted,
    isLocked: a.isLocked,
    weight: a.weight,
    date: a.date.toISOString(),
  }));

  const serializedBacklog = backlogItems.map(b => ({
    id: b.id,
    originalDate: b.originalDate.toISOString(),
    isCompleted: b.isCompleted,
    assignment: { id: b.assignment.id, title: b.assignment.title },
  }));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Today
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-in">
        <StatCard
          label="Tasks Done"
          value={`${completedCount}/${totalCount}`}
          icon={<CheckCircle2 className="w-5 h-5 text-violet-500" />}
        />
        <StatCard
          label="Day Streak"
          value={streak?.currentCount ?? 0}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
        <StatCard
          label="Today's Score"
          value={todayScore}
          icon={<Target className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          label="Weekly Score"
          value={weeklyScore}
          icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
        />
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <Card padding="sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">Daily Progress</span>
            <span className="text-xs text-[var(--color-muted)]">
              {completedCount} of {totalCount} tasks
            </span>
          </div>
          <ProgressBar value={progressPercent} size="md" />
        </Card>
      )}

      {/* Today's Assignments */}
      <TodaySection assignments={serializedAssignments} isFinalized={!!dailyCheckIn} />

      {/* No assignments — link to weekly plan */}
      {totalCount === 0 && !dailyCheckIn && (
        <Card>
          <EmptyState
            icon={<CalendarDays className="w-7 h-7 text-violet-500" />}
            title="No tasks for today"
            description="Head to your Weekly Plan to add daily assignments."
            actionLabel="Open Weekly Plan"
            actionHref="/week"
          />
        </Card>
      )}

      {/* Backlog */}
      <BacklogSection items={serializedBacklog} />

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/week"
          className="flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all group"
        >
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">Weekly Plan</p>
            <p className="text-xs text-[var(--color-muted)]">Manage targets</p>
          </div>
        </Link>
        <Link
          href="/roadmap"
          className="flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all group"
        >
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            <Map className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">Roadmap</p>
            <p className="text-xs text-[var(--color-muted)]">View goal progress</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
