import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ScoreAdjustmentForm } from "@/components/admin/ScoreAdjustmentForm";
import { WeeklyTargetEditor } from "@/components/admin/WeeklyTargetEditor";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Shield, ArrowLeft, FileEdit } from "lucide-react";

export default async function AdminOverridesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get admin groups with members and current weekly targets
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const adminMemberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id, role: "ADMIN" },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          weeklyPlans: {
            where: {
              startDate: { gte: weekStart },
              endDate: { lte: weekEnd },
            },
            include: {
              targets: true,
            },
          },
        },
      },
    },
  });

  if (adminMemberships.length === 0) {
    redirect("/");
  }

  // Aggregate member scores via groupBy instead of fetching all scoreTransaction rows
  const allMemberIds = [...new Set(
    adminMemberships.flatMap((m) => m.group.members.map((member) => member.user.id))
  )];
  const scoreAggregates = await prisma.scoreTransaction.groupBy({
    by: ["userId"],
    where: { userId: { in: allMemberIds } },
    _sum: { earnedPoints: true },
  });
  const scoreMap = new Map(scoreAggregates.map((s) => [s.userId, s._sum.earnedPoints ?? 0]));

  // Build data for each group
  const groupsData = adminMemberships.map((m) => {
    const members = m.group.members.map((member) => ({
      userId: member.user.id,
      userName: member.user.name || member.user.email,
      totalScore: scoreMap.get(member.user.id) ?? 0,
    }));

    // Build user map for looking up names
    const userMap = new Map(m.group.members.map((member) => [member.user.id, member.user.name || member.user.email]));

    const targets = m.group.weeklyPlans.flatMap((wp) =>
      wp.targets.map((t) => ({
        id: t.id,
        title: t.title,
        weight: t.weight,
        userName: userMap.get(wp.userId) || "Unknown",
        userId: wp.userId,
      }))
    );

    return {
      id: m.group.id,
      name: m.group.name,
      members,
      targets,
    };
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin
            </Link>
            <Badge variant="admin">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <FileEdit className="w-6 h-6 text-[var(--color-accent)]" />
            Overrides
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Adjust scores and edit weekly targets for group members</p>
        </div>
      </div>

      {/* Per-group sections */}
      <div className="space-y-8 stagger-in">
        {groupsData.map((group) => (
          <div key={group.id} className="space-y-5">
            {groupsData.length > 1 && (
              <h2 className="text-lg font-bold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                {group.name}
              </h2>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScoreAdjustmentForm
                groupId={group.id}
                groupName={group.name}
                members={group.members}
              />
              <WeeklyTargetEditor
                groupId={group.id}
                groupName={group.name}
                targets={group.targets}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
