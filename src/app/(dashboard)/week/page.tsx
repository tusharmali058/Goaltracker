import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { CreateWeeklyPlanButton, WeeklyPlanView } from "@/components/WeeklyPlanBuilder";
import { TodaySection, BacklogSection } from "@/components/DailyDashboard";

export default async function WeekPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Check group membership
  const membership = await prisma.groupMember.findFirst({
    where: { userId },
    include: { group: true },
  });

  if (!membership) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Weekly Plan</h1>
          <p className="text-[var(--color-muted)] mt-1">Weekly targets and daily assignments</p>
        </div>
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Join a Group First</h2>
          <p className="text-[var(--color-muted)] mb-4 max-w-sm mx-auto">
            Weekly planning requires a group. Join or create one to unlock weekly targets and daily assignments.
          </p>
          <Link href="/group" className="inline-block px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 font-medium transition-all">
            Go to Groups
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Generate week dates for the assignment date picker
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  // Fetch weekly plan
  const weeklyPlan = await prisma.weeklyPlan.findFirst({
    where: {
      userId,
      groupId: membership.groupId,
      startDate: { gte: weekStart },
      endDate: { lte: weekEnd },
    },
    include: {
      targets: {
        orderBy: { createdAt: "asc" },
        include: {
          assignments: { orderBy: { date: "asc" } },
        },
      },
    },
  });

  // Fetch user's goal with roadmap to determine current month
  const goal = await prisma.goal.findFirst({
    where: { userId },
    include: {
      months: {
        orderBy: { order: "asc" },
        include: {
          commitments: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  // Determine current month based on goal start date + month order
  let currentMonthTitle: string | null = null;
  let currentMonthCommitments: { id: string; title: string }[] = [];

  if (goal && goal.months.length > 0) {
    const goalDuration = goal.endDate.getTime() - goal.startDate.getTime();
    const monthDuration = goalDuration / goal.months.length;
    const elapsed = today.getTime() - goal.startDate.getTime();
    const currentMonthIndex = Math.min(
      Math.max(0, Math.floor(elapsed / monthDuration)),
      goal.months.length - 1
    );
    const currentMonth = goal.months[currentMonthIndex];
    currentMonthTitle = `Month ${currentMonth.order}: ${currentMonth.title}`;
    currentMonthCommitments = currentMonth.commitments.map(c => ({
      id: c.id,
      title: c.title,
    }));
  }

  // Fetch today's assignments
  const assignments = await prisma.dailyAssignment.findMany({
    where: { userId, date: { gte: today, lt: tomorrow } },
    orderBy: { createdAt: "asc" },
  });

  const dailyCheckIn = await prisma.dailyCheckIn.findFirst({
    where: { userId, date: { gte: today, lt: tomorrow } },
  });

  // Fetch backlog items
  const backlogItems = await prisma.backlogItem.findMany({
    where: { userId, isCompleted: false },
    include: { assignment: true },
    orderBy: { originalDate: "asc" },
  });

  const serializedPlan = weeklyPlan ? {
    id: weeklyPlan.id,
    startDate: weeklyPlan.startDate.toISOString(),
    endDate: weeklyPlan.endDate.toISOString(),
    isLocked: weeklyPlan.isLocked,
    targets: weeklyPlan.targets.map(t => ({
      id: t.id,
      title: t.title,
      weight: t.weight,
      assignments: t.assignments.map(a => ({
        id: a.id,
        title: a.title,
        date: a.date.toISOString(),
        isCompleted: a.isCompleted,
      })),
    })),
  } : null;

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Weekly Plan</h1>
          <p className="text-[var(--color-muted)] mt-1">
            {weekStart.toLocaleDateString()} – {weekEnd.toLocaleDateString()}
          </p>
        </div>
        <div className="text-right space-y-1">
          {currentMonthTitle && (
            <p className="text-xs font-medium text-[var(--color-accent)]">{currentMonthTitle}</p>
          )}
          {membership.group.weeklyDeadline && (
            <div>
              <p className="text-xs text-[var(--color-muted)]">Deadline</p>
              <p className={`text-sm font-medium ${new Date() > membership.group.weeklyDeadline ? "text-red-500" : "text-[var(--color-foreground)]"}`}>
                {membership.group.weeklyDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          )}
        </div>
      </div>

      {!serializedPlan ? (
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] text-center">
          <h2 className="text-xl font-semibold mb-2">No Weekly Plan</h2>
          <p className="text-[var(--color-muted)] mb-4">Create your plan for this week to start setting targets.</p>
          <CreateWeeklyPlanButton
            groupId={membership.groupId}
            weeklyDeadline={membership.group.weeklyDeadline?.toISOString() ?? null}
          />
        </div>
      ) : (
        <WeeklyPlanView
          plan={serializedPlan}
          commitments={currentMonthCommitments}
          weekDates={weekDates}
          currentMonthTitle={currentMonthTitle}
        />
      )}

      {/* Today's Assignments */}
      <TodaySection assignments={serializedAssignments} isFinalized={!!dailyCheckIn} />

      {/* Backlog */}
      <BacklogSection items={serializedBacklog} />
    </div>
  );
}
