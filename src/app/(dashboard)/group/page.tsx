import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { GroupActions, GroupCode } from "@/components/group/GroupActions";
import { AdminDeadlineControls } from "@/components/group/AdminDeadlineControls";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Users, Trophy, Flame, Target, BarChart3, Crown } from "lucide-react";

export default async function GroupPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Step 1: Lightweight query — just get user's group memberships
  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      role: true,
      groupId: true,
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          monthlyDeadline: true,
          weeklyDeadline: true,
        },
      },
    },
  });

  if (memberships.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Groups</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">Track progress together with your team</p>
          </div>
          <GroupActions />
        </div>
        <Card>
          <EmptyState
            icon={<Users className="w-7 h-7 text-violet-500" />}
            title="No Groups Yet"
            description="Create your own group to start tracking goals together, or join an existing group with an invite code."
          />
        </Card>
      </div>
    );
  }

  const groupIds = memberships.map(m => m.groupId);

  // Step 2: Parallel queries for group details (much faster than a single nested monster)
  const [allMembers, allWeeklyPlans] = await Promise.all([
    // Members with only the fields we display
    prisma.groupMember.findMany({
      where: { groupId: { in: groupIds } },
      select: {
        id: true,
        groupId: true,
        userId: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            streak: { select: { currentCount: true } },
            goals: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: {
                title: true,
                startDate: true,
                endDate: true,
                months: {
                  orderBy: { order: "asc" },
                  select: { title: true, id: true },
                },
              },
            },
          },
        },
      },
    }),
    // Weekly plans — just counts
    prisma.weeklyPlan.findMany({
      where: {
        groupId: { in: groupIds },
        startDate: { gte: weekStart },
        endDate: { lte: weekEnd },
      },
      select: {
        groupId: true,
        userId: true,
        _count: { select: { targets: true } },
      },
    }),
  ]);

  // Step 3: Aggregate scores in a single query instead of per-member
  const memberUserIds = [...new Set(allMembers.map(m => m.userId))];
  const scoreAggregates = await prisma.scoreTransaction.groupBy({
    by: ["userId"],
    where: { userId: { in: memberUserIds } },
    _sum: { earnedPoints: true },
  });
  const scoreMap = new Map(scoreAggregates.map(s => [s.userId, s._sum.earnedPoints ?? 0]));

  // Index data by groupId for fast lookup
  const membersByGroup = new Map<string, typeof allMembers>();
  for (const m of allMembers) {
    if (!membersByGroup.has(m.groupId)) membersByGroup.set(m.groupId, []);
    membersByGroup.get(m.groupId)!.push(m);
  }

  const weeklyPlansByGroup = new Map<string, Map<string, number>>();
  for (const wp of allWeeklyPlans) {
    if (!weeklyPlansByGroup.has(wp.groupId)) weeklyPlansByGroup.set(wp.groupId, new Map());
    weeklyPlansByGroup.get(wp.groupId)!.set(wp.userId, wp._count.targets);
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Groups</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Track progress together with your team</p>
        </div>
        <GroupActions />
      </div>

      <div className="space-y-6 stagger-in">
        {memberships.map((m) => {
          const isAdmin = m.role === "ADMIN";
          const groupMembers = membersByGroup.get(m.groupId) || [];
          const weeklyPlanMap = weeklyPlansByGroup.get(m.groupId) || new Map();

          // Group-level stats
          const totalGroupScore = groupMembers.reduce(
            (sum, member) => sum + (scoreMap.get(member.userId) ?? 0),
            0
          );
          const avgStreak = Math.round(
            groupMembers.reduce((sum, member) => sum + (member.user.streak?.currentCount ?? 0), 0) /
              Math.max(1, groupMembers.length)
          );
          const plansThisWeek = weeklyPlanMap.size;

          return (
            <Card key={m.id} padding="lg">
              {/* Group Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-500/20">
                    {m.group.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-foreground)]">{m.group.name}</h2>
                    {m.group.description && (
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">{m.group.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && <GroupCode code={m.group.code} />}
                  <Badge variant={isAdmin ? "admin" : "accent"}>{m.role}</Badge>
                </div>
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard
                  label="Members"
                  value={groupMembers.length}
                  icon={<Users className="w-5 h-5 text-violet-500" />}
                />
                <StatCard
                  label="Group Score"
                  value={Math.round(totalGroupScore)}
                  icon={<Trophy className="w-5 h-5 text-amber-500" />}
                />
                <StatCard
                  label="Avg Streak"
                  value={`${avgStreak}d`}
                  icon={<Flame className="w-5 h-5 text-orange-500" />}
                />
                <StatCard
                  label="Plans This Week"
                  value={plansThisWeek}
                  icon={<Target className="w-5 h-5 text-emerald-500" />}
                />
              </div>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50/50 to-rose-50/50 rounded-[var(--radius-md)] border border-red-200/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Admin Controls</span>
                  </div>
                  <AdminDeadlineControls
                    groupId={m.group.id}
                    monthlyDeadline={m.group.monthlyDeadline?.toISOString() ?? null}
                    weeklyDeadline={m.group.weeklyDeadline?.toISOString() ?? null}
                  />
                </div>
              )}

              {/* Leaderboard Link */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                  Members ({groupMembers.length})
                </h3>
                <Link
                  href="/group/leaderboard"
                  className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Leaderboard
                </Link>
              </div>

              {/* Members List */}
              <div className="space-y-2.5 stagger-in">
                {groupMembers.map((member) => {
                  const goal = member.user.goals[0];
                  const totalScore = scoreMap.get(member.userId) ?? 0;
                  const streakCount = member.user.streak?.currentCount ?? 0;
                  const targetCount = weeklyPlanMap.get(member.userId);

                  // Goal progress
                  let progressPercent = 0;
                  let currentMonthLabel: string | null = null;
                  if (goal) {
                    const totalDuration = goal.endDate.getTime() - goal.startDate.getTime();
                    const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24)));
                    const elapsed = today.getTime() - goal.startDate.getTime();
                    const elapsedDays = Math.max(0, Math.ceil(elapsed / (1000 * 60 * 60 * 24)));
                    progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

                    if (goal.months.length > 0) {
                      const monthDuration = totalDuration / goal.months.length;
                      const idx = Math.min(
                        Math.max(0, Math.floor(elapsed / monthDuration)),
                        goal.months.length - 1
                      );
                      currentMonthLabel = goal.months[idx].title;
                    }
                  }

                  const isMe = member.userId === session.user!.id;

                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-[var(--radius-md)] border transition-all duration-200 ${
                        isMe
                          ? "bg-violet-50/50 border-violet-200/60"
                          : "bg-[var(--color-secondary)]/50 border-[var(--color-border)] hover:border-[var(--color-accent)]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm ${
                            isMe
                              ? "bg-gradient-to-br from-violet-400 to-indigo-500"
                              : "bg-gradient-to-br from-slate-400 to-slate-500"
                          }`}
                        >
                          {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[var(--color-foreground)] truncate">
                              {member.user.name || member.user.email}
                            </span>
                            {isMe && <Badge variant="accent">You</Badge>}
                            {member.role === "ADMIN" && <Badge variant="admin">Admin</Badge>}
                          </div>
                          <p className="text-xs text-[var(--color-muted)] truncate mt-0.5">
                            {goal ? goal.title : "No goal set"}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-4 shrink-0">
                          <div className="text-center">
                            <div className="text-sm font-bold text-[var(--color-foreground)]">
                              {Math.round(totalScore)}
                            </div>
                            <div className="text-[10px] text-[var(--color-muted)]">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-orange-500 flex items-center justify-center gap-0.5">
                              <Flame className="w-3.5 h-3.5" />
                              {streakCount}
                            </div>
                            <div className="text-[10px] text-[var(--color-muted)]">Streak</div>
                          </div>
                          {targetCount !== undefined ? (
                            <Badge variant="success">
                              {targetCount} targets
                            </Badge>
                          ) : (
                            <Badge variant="warning">No plan</Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (if goal exists) */}
                      {goal && (
                        <div className="mt-3 pl-[52px]">
                          <ProgressBar value={progressPercent} size="sm" />
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-[var(--color-muted)]">
                              {progressPercent}% elapsed
                            </span>
                            {currentMonthLabel && (
                              <span className="text-[10px] text-[var(--color-accent)] font-medium">
                                {currentMonthLabel}
                              </span>
                            )}
                          </div>

                          {/* Mobile stats */}
                          <div className="flex sm:hidden items-center gap-3 mt-2">
                            <span className="text-xs text-[var(--color-muted)]">
                              <span className="font-semibold text-[var(--color-foreground)]">{Math.round(totalScore)}</span> pts
                            </span>
                            <span className="text-xs text-orange-500 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" />{streakCount}d
                            </span>
                            {targetCount !== undefined ? (
                              <Badge variant="success">{targetCount} targets</Badge>
                            ) : (
                              <Badge variant="warning">No plan</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
