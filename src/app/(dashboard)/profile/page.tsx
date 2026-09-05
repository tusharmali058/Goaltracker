import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      streak: true,
      memberships: {
        include: {
          group: true,
        }
      },
      goals: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          dailyCheckIns: true,
          scoreTransactions: true,
        }
      }
    }
  });

  if (!user) return null;

  const totalScore = await prisma.scoreTransaction.aggregate({
    where: { userId: user.id },
    _sum: { earnedPoints: true }
  });

  const activeGoals = user.goals.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Profile</h1>
        <p className="text-[var(--color-muted)] mt-1">Your account information</p>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-2xl font-bold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-primary)]">{user.name || 'Unnamed'}</h2>
            <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-secondary)] p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">{user._count.dailyCheckIns}</div>
            <div className="text-xs text-[var(--color-muted)]">Check-ins</div>
          </div>
          <div className="bg-[var(--color-secondary)] p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">{user.streak?.currentCount ?? 0}</div>
            <div className="text-xs text-[var(--color-muted)]">Current Streak</div>
          </div>
          <div className="bg-[var(--color-secondary)] p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">{user.streak?.longestCount ?? 0}</div>
            <div className="text-xs text-[var(--color-muted)]">Best Streak</div>
          </div>
          <div className="bg-[var(--color-secondary)] p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">{Math.round(totalScore._sum.earnedPoints ?? 0)}</div>
            <div className="text-xs text-[var(--color-muted)]">Total Score</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)] mb-4">Details</h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-[var(--color-muted)]">Timezone</dt>
            <dd className="text-sm text-[var(--color-foreground)]">{user.timezone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-[var(--color-muted)]">Member Since</dt>
            <dd className="text-sm text-[var(--color-foreground)]">{user.createdAt.toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-[var(--color-muted)]">Groups</dt>
            <dd className="text-sm text-[var(--color-foreground)]">{user.memberships.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-[var(--color-muted)]">Active Goals</dt>
            <dd className="text-sm text-[var(--color-foreground)]">{activeGoals}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
