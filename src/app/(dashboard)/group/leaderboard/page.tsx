import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Get user's groups
  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: { group: true }
  });

  if (memberships.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Leaderboard</h1>
          <p className="text-[var(--color-muted)] mt-1">Join a group to see the leaderboard</p>
        </div>
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)]">You need to be in a group to see the leaderboard.</p>
        </div>
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
            select: { earnedPoints: true }
          }
        }
      }
    }
  });

  const leaderboard = members
    .map(m => ({
      id: m.user.id,
      name: m.user.name || m.user.email,
      totalScore: m.user.scoreTransactions.reduce((sum, t) => sum + t.earnedPoints, 0),
      streak: m.user.streak?.currentCount ?? 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Leaderboard</h1>
        <p className="text-[var(--color-muted)] mt-1">{memberships[0].group.name}</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-secondary)]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Student</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Score</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr key={entry.id} className={`border-b border-[var(--color-border)] ${entry.id === session.user!.id ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-3 text-sm font-bold text-[var(--color-primary)]">#{i + 1}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                  {entry.name}
                  {entry.id === session.user!.id && <span className="ml-2 text-xs text-[var(--color-accent)]">(You)</span>}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--color-primary)]">{Math.round(entry.totalScore)}</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--color-muted)]">{entry.streak} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
