import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Flame, Trophy, CheckCircle2, Star } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, totalScore] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        streak: true,
        memberships: {
          include: {
            group: { select: { name: true } },
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
    }),
    prisma.scoreTransaction.aggregate({
      where: { userId: session.user.id },
      _sum: { earnedPoints: true }
    }),
  ]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Profile & Settings</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Your account information and preferences</p>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200/50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/20">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">{user.name || 'Unnamed'}</h2>
            <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
            <div className="flex gap-2 mt-2">
              {user.memberships.map(m => (
                <Badge key={m.id} variant={m.role === "ADMIN" ? "admin" : "accent"}>
                  {m.group.name} · {m.role}
                </Badge>
              ))}
              {user.memberships.length === 0 && (
                <Badge variant="warning">No group</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-in">
        <StatCard
          label="Check-ins"
          value={user._count.dailyCheckIns}
          icon={<CheckCircle2 className="w-5 h-5 text-violet-500" />}
        />
        <StatCard
          label="Current Streak"
          value={user.streak?.currentCount ?? 0}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
        <StatCard
          label="Best Streak"
          value={user.streak?.longestCount ?? 0}
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          label="Total Score"
          value={Math.round(totalScore._sum.earnedPoints ?? 0)}
          icon={<Star className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Details */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">Details</h3>
        <dl className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <dt className="text-sm text-[var(--color-muted)]">Timezone</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">{user.timezone}</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <dt className="text-sm text-[var(--color-muted)]">Member Since</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">{user.createdAt.toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <dt className="text-sm text-[var(--color-muted)]">Groups</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">{user.memberships.length}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-sm text-[var(--color-muted)]">Active Goals</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">{user.goals.length}</dd>
          </div>
        </dl>
      </Card>

      {/* Settings placeholder */}
      <Card>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">Preferences</h3>
        <p className="text-sm text-[var(--color-muted)]">
          Settings for timezone, notification preferences, and more are coming soon.
        </p>
      </Card>
    </div>
  );
}
