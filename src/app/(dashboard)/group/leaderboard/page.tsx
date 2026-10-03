import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy, Flame, Medal, Users, ArrowLeft } from "lucide-react";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Get user's groups
  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: { group: true },
  });

  if (memberships.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Leaderboard</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Join a group to see the leaderboard</p>
        </div>
        <Card>
          <EmptyState
            icon={<Users className="w-7 h-7 text-violet-500" />}
            title="No Group Found"
            description="You need to be in a group to see the leaderboard. Join or create a group first."
            actionLabel="Go to Groups"
            actionHref="/group"
          />
        </Card>
      </div>
    );
  }

  // Get all members of user's first group with their scores
  const groupId = memberships[0].groupId;
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        include: {
          streak: true,
          scoreTransactions: {
            select: { earnedPoints: true },
          },
        },
      },
    },
  });

  const leaderboard = members
    .map((m) => ({
      id: m.user.id,
      name: m.user.name || m.user.email,
      totalScore: m.user.scoreTransactions.reduce((sum, t) => sum + t.earnedPoints, 0),
      streak: m.user.streak?.currentCount ?? 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const rankColors = [
    "from-amber-400 to-yellow-500", // Gold
    "from-slate-300 to-slate-400",  // Silver
    "from-amber-600 to-orange-700", // Bronze
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/group"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Groups
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Leaderboard</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{memberships[0].group.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-[var(--color-muted)]">
            {leaderboard.length} competitors
          </span>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 0, 2].map((rankIdx) => {
            const entry = leaderboard[rankIdx];
            const isMe = entry.id === session.user!.id;
            const rank = rankIdx + 1;

            return (
              <Card
                key={entry.id}
                className={`text-center ${rankIdx === 0 ? "sm:-mt-2" : ""} ${
                  isMe ? "ring-2 ring-violet-400/50" : ""
                }`}
              >
                <div className="relative inline-flex mb-3 mx-auto">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${
                      rankColors[rankIdx] || "from-slate-300 to-slate-400"
                    } flex items-center justify-center text-white text-xl font-bold shadow-lg mx-auto`}
                  >
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[var(--color-foreground)]">#{rank}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                  {entry.name}
                </p>
                {isMe && <Badge variant="accent" className="mt-1">You</Badge>}
                <div className="text-xl font-bold text-[var(--color-foreground)] mt-2">
                  {Math.round(entry.totalScore)}
                </div>
                <div className="text-[10px] text-[var(--color-muted)]">points</div>
                <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-orange-500">
                  <Flame className="w-3.5 h-3.5" />
                  {entry.streak}d streak
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Rankings */}
      <Card padding="sm">
        <div className="divide-y divide-[var(--color-border)]">
          {leaderboard.map((entry, i) => {
            const isMe = entry.id === session.user!.id;
            const rank = i + 1;

            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isMe ? "bg-violet-50/50" : "hover:bg-[var(--color-secondary)]/50"
                }`}
              >
                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  {rank <= 3 ? (
                    <Medal
                      className={`w-5 h-5 mx-auto ${
                        rank === 1
                          ? "text-amber-500"
                          : rank === 2
                          ? "text-slate-400"
                          : "text-amber-700"
                      }`}
                    />
                  ) : (
                    <span className="text-sm font-bold text-[var(--color-muted)]">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                    isMe
                      ? "bg-gradient-to-br from-violet-400 to-indigo-500"
                      : "bg-gradient-to-br from-slate-400 to-slate-500"
                  }`}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[var(--color-foreground)] truncate block">
                    {entry.name}
                  </span>
                  {isMe && (
                    <span className="text-[10px] text-[var(--color-accent)] font-medium">That&apos;s you!</span>
                  )}
                </div>

                {/* Streak */}
                <div className="text-xs text-orange-500 flex items-center gap-1 shrink-0">
                  <Flame className="w-3.5 h-3.5" />
                  {entry.streak}d
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[var(--color-foreground)]">
                    {Math.round(entry.totalScore)}
                  </div>
                  <div className="text-[10px] text-[var(--color-muted)]">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
