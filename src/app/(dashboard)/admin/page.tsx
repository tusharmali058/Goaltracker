import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Users, ClipboardList, Building2, Shield, FileEdit, ScrollText, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get all groups where user is admin — lightweight query with _count for plans
  const adminMemberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id, role: "ADMIN" },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: {
              weeklyPlans: {
                where: {
                  startDate: { gte: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; })() },
                },
              },
            },
          },
          auditLogs: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              admin: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (adminMemberships.length === 0) {
    redirect("/");
  }

  // Aggregate member scores via groupBy instead of fetching all scoreTransactions
  const allMemberIds = [...new Set(
    adminMemberships.flatMap((m) => m.group.members.map((member) => member.user.id))
  )];
  const scoreAggregates = await prisma.scoreTransaction.groupBy({
    by: ["userId"],
    where: { userId: { in: allMemberIds } },
    _sum: { earnedPoints: true },
  });
  const scoreMap = new Map(scoreAggregates.map((s) => [s.userId, s._sum.earnedPoints ?? 0]));

  // Aggregate stats using _count
  const totalMembers = adminMemberships.reduce((sum, m) => sum + m.group.members.length, 0);
  const totalActivePlans = adminMemberships.reduce((sum, m) => sum + m.group._count.weeklyPlans, 0);

  // Flatten recent audit logs across all groups, sort by date
  const recentLogs = adminMemberships
    .flatMap((m) =>
      m.group.auditLogs.map((log) => ({
        ...log,
        groupName: m.group.name,
        adminName: log.admin.name || log.admin.email,
        createdAtStr: log.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  const ACTION_LABELS: Record<string, { label: string; variant: "danger" | "warning" | "accent" }> = {
    ADJUST_SCORE: { label: "Score Adjustment", variant: "danger" },
    EDIT_WEEKLY_TARGET: { label: "Edit Target", variant: "warning" },
    CORRECT_SCORE: { label: "Score Correction", variant: "accent" },
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="admin">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Manage your groups, members, and scores</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/overrides"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            <FileEdit className="w-4 h-4" />
            Overrides
          </Link>
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors"
          >
            <ScrollText className="w-4 h-4" />
            Audit Log
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total Members"
          value={totalMembers}
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          label="Active Plans (this week)"
          value={totalActivePlans}
          icon={<ClipboardList className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          label="Groups Managed"
          value={adminMemberships.length}
          icon={<Building2 className="w-5 h-5 text-violet-500" />}
        />
      </div>

      {/* Groups Overview */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">Your Groups</h2>
        <div className="grid gap-4 stagger-in">
          {adminMemberships.map((m) => {
            const totalGroupScore = m.group.members.reduce(
              (sum, member) => sum + (scoreMap.get(member.user.id) ?? 0),
              0
            );

            return (
              <Card key={m.id} hover>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {m.group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-foreground)]">{m.group.name}</h3>
                      <p className="text-xs text-[var(--color-muted)]">
                        {m.group.members.length} members · Code: <span className="font-mono">{m.group.code}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gradient">{Math.round(totalGroupScore)}</div>
                    <div className="text-[10px] text-[var(--color-muted)]">Total Score</div>
                  </div>
                </div>

                {/* Member breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {m.group.members.map((member) => {
                    const score = scoreMap.get(member.user.id) ?? 0;
                    return (
                      <div key={member.id} className="p-2.5 bg-[var(--color-secondary)] rounded-[var(--radius-md)] text-center">
                        <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                          {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="text-xs font-medium text-[var(--color-foreground)] truncate">
                          {member.user.name || member.user.email}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)]">{Math.round(score)} pts</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
          </h2>
          <Link href="/admin/audit" className="text-xs text-[var(--color-accent)] hover:underline">
            View All →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-[var(--color-muted)]">No admin actions recorded yet</p>
          </Card>
        ) : (
          <Card padding="sm">
            <div className="divide-y divide-[var(--color-border)]">
              {recentLogs.map((log) => {
                const style = ACTION_LABELS[log.actionType] ?? { label: log.actionType, variant: "default" as const };
                return (
                  <div key={log.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-secondary)]/50 transition-colors">
                    <Badge variant={style.variant}>{style.label}</Badge>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[var(--color-foreground)] font-medium">
                        {log.adminName}
                      </span>
                      {log.reason && (
                        <span className="text-sm text-[var(--color-muted)]"> — {log.reason}</span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--color-muted)] shrink-0">{log.createdAtStr}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
