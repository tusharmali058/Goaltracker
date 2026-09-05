import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { GroupActions, GroupCode } from "@/components/group/GroupActions";
import { AdminDeadlineControls } from "@/components/group/AdminDeadlineControls";

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

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  goals: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: {
                      months: {
                        orderBy: { order: "asc" },
                        include: { commitments: true },
                      },
                    },
                  },
                  streak: true,
                  scoreTransactions: {
                    select: { earnedPoints: true },
                  },
                },
              },
            },
          },
          weeklyPlans: {
            where: {
              startDate: { gte: weekStart },
              endDate: { lte: weekEnd },
            },
            select: {
              userId: true,
              id: true,
              targets: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Groups</h1>
          <p className="text-[var(--color-muted)] mt-1">Track progress together with your team</p>
        </div>
        <GroupActions />
      </div>

      {memberships.length === 0 ? (
        <div className="bg-[var(--color-surface)] p-12 rounded-lg border border-[var(--color-border)] text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Groups Yet</h2>
          <p className="text-[var(--color-muted)] max-w-sm mx-auto">
            Create your own group to start tracking goals together, or join an existing group with an invite code.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {memberships.map(m => {
            const isAdmin = m.role === "ADMIN";
            // Build a map of userId -> weekly plan status for this group
            const weeklyPlanMap = new Map(
              m.group.weeklyPlans.map(wp => [wp.userId, { id: wp.id, targetCount: wp.targets.length }])
            );

            return (
              <div key={m.id} className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
                {/* Group Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-primary)]">{m.group.name}</h2>
                    {m.group.description && (
                      <p className="text-sm text-[var(--color-muted)] mt-1">{m.group.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && <GroupCode code={m.group.code} />}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {m.role}
                    </span>
                  </div>
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="mb-5 p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                    <AdminDeadlineControls
                      groupId={m.group.id}
                      monthlyDeadline={m.group.monthlyDeadline?.toISOString() ?? null}
                      weeklyDeadline={m.group.weeklyDeadline?.toISOString() ?? null}
                    />
                  </div>
                )}

                {/* Members Progress */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                    Members Progress ({m.group.members.length})
                  </h3>
                  <div className="space-y-3">
                    {m.group.members.map(member => {
                      const goal = member.user.goals[0];
                      const totalScore = member.user.scoreTransactions.reduce(
                        (sum, t) => sum + t.earnedPoints, 0
                      );
                      const streakCount = member.user.streak?.currentCount ?? 0;
                      const totalCommitments = goal?.months.reduce(
                        (sum, mo) => sum + mo.commitments.length, 0
                      ) ?? 0;
                      const weeklyPlanStatus = weeklyPlanMap.get(member.userId);

                      // Calculate current month for this member
                      let currentMonthLabel: string | null = null;
                      if (goal && goal.months.length > 0) {
                        const goalDuration = goal.endDate.getTime() - goal.startDate.getTime();
                        const monthDuration = goalDuration / goal.months.length;
                        const elapsed = today.getTime() - goal.startDate.getTime();
                        const idx = Math.min(
                          Math.max(0, Math.floor(elapsed / monthDuration)),
                          goal.months.length - 1
                        );
                        currentMonthLabel = goal.months[idx].title;
                      }

                      // Goal progress
                      let progressPercent = 0;
                      if (goal) {
                        const totalDuration = goal.endDate.getTime() - goal.startDate.getTime();
                        const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24)));
                        const elapsed = today.getTime() - goal.startDate.getTime();
                        const elapsedDays = Math.max(0, Math.ceil(elapsed / (1000 * 60 * 60 * 24)));
                        progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
                      }

                      return (
                        <div key={member.id} className="p-4 bg-[var(--color-secondary)] rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--color-foreground)] truncate">
                                  {member.user.name || member.user.email}
                                </span>
                                {member.role === "ADMIN" && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600 shrink-0">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--color-muted)] truncate">
                                {goal ? goal.title : "No goal set"}
                              </p>
                            </div>
                            {/* Weekly plan status badge */}
                            <div className="shrink-0">
                              {weeklyPlanStatus ? (
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                                  Plan: {weeklyPlanStatus.targetCount} targets
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                  No plan yet
                                </span>
                              )}
                            </div>
                          </div>

                          {goal && (
                            <>
                              {/* Goal progress bar */}
                              <div className="mb-3">
                                <div className="w-full bg-[var(--color-surface)] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[var(--color-accent)] h-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-[10px] text-[var(--color-muted)]">{progressPercent}% elapsed</span>
                                  {currentMonthLabel && (
                                    <span className="text-[10px] text-[var(--color-accent)] font-medium">
                                      Current: {currentMonthLabel}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Roadmap summary */}
                              <div className="mb-3 flex flex-wrap gap-1.5">
                                {goal.months.map((mo, idx) => {
                                  const isCurrent = currentMonthLabel === mo.title;
                                  return (
                                    <span
                                      key={mo.id}
                                      className={`text-[10px] px-2 py-0.5 rounded ${
                                        isCurrent
                                          ? "bg-[var(--color-accent)] text-white font-medium"
                                          : "bg-[var(--color-surface)] text-[var(--color-muted)]"
                                      }`}
                                      title={`${mo.commitments.length} commitments`}
                                    >
                                      M{idx + 1}: {mo.title} ({mo.commitments.length})
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-[var(--color-surface)] p-2 rounded">
                                  <div className="text-lg font-bold text-[var(--color-primary)]">{totalCommitments}</div>
                                  <div className="text-[10px] text-[var(--color-muted)]">Commitments</div>
                                </div>
                                <div className="bg-[var(--color-surface)] p-2 rounded">
                                  <div className="text-lg font-bold text-[var(--color-primary)]">{streakCount}</div>
                                  <div className="text-[10px] text-[var(--color-muted)]">Streak</div>
                                </div>
                                <div className="bg-[var(--color-surface)] p-2 rounded">
                                  <div className="text-lg font-bold text-[var(--color-primary)]">{Math.round(totalScore)}</div>
                                  <div className="text-[10px] text-[var(--color-muted)]">Score</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
