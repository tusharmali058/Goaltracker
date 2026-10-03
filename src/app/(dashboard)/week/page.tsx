import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { CreateWeeklyPlanButton, WeeklyPlanView } from "@/components/WeeklyPlanBuilder";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, CalendarDays } from "lucide-react";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Weekly Plan</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Weekly targets and daily assignments</p>
        </div>
        <Card>
          <EmptyState
            icon={<Users className="w-7 h-7 text-violet-500" />}
            title="Join a Group First"
            description="Weekly planning requires a group. Join or create one to unlock weekly targets and daily assignments."
            actionLabel="Go to Groups"
            actionHref="/group"
          />
        </Card>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Generate week dates
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  // Fetch weekly plan and goal in parallel
  const [weeklyPlan, goal] = await Promise.all([
    prisma.weeklyPlan.findFirst({
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
    }),
    prisma.goal.findFirst({
      where: { userId },
      include: {
        months: {
          orderBy: { order: "asc" },
          include: { commitments: { orderBy: { order: "asc" } } },
        },
      },
    }),
  ]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Weekly Plan</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="text-right space-y-1">
          {currentMonthTitle && (
            <p className="text-xs font-medium text-[var(--color-accent)]">{currentMonthTitle}</p>
          )}
          {membership.group.weeklyDeadline && (
            <p className={`text-xs ${new Date() > membership.group.weeklyDeadline ? "text-red-500 font-medium" : "text-[var(--color-muted)]"}`}>
              Deadline: {membership.group.weeklyDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              {new Date() > membership.group.weeklyDeadline && " (expired)"}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {!serializedPlan ? (
        <Card>
          <EmptyState
            icon={<CalendarDays className="w-7 h-7 text-violet-500" />}
            title="No Weekly Plan"
            description="Create your plan for this week to start setting targets and daily assignments."
          />
          <div className="flex justify-center pb-4">
            <CreateWeeklyPlanButton
              groupId={membership.groupId}
              weeklyDeadline={membership.group.weeklyDeadline?.toISOString() ?? null}
            />
          </div>
        </Card>
      ) : (
        <WeeklyPlanView
          plan={serializedPlan}
          commitments={currentMonthCommitments}
          weekDates={weekDates}
          currentMonthTitle={currentMonthTitle}
        />
      )}
    </div>
  );
}
