import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { RoadmapBuilder } from "@/components/RoadmapBuilder";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Map } from "lucide-react";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const goal = await prisma.goal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      months: {
        orderBy: { order: "asc" },
        include: {
          commitments: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!goal) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Roadmap</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Your long-term goal and monthly commitments</p>
        </div>
        <Card>
          <EmptyState
            icon={<Map className="w-7 h-7 text-violet-500" />}
            title="No Goal Yet"
            description="Set up your goal through the onboarding wizard to start building your roadmap."
            actionLabel="Get Started"
            actionHref="/onboarding"
          />
        </Card>
      </div>
    );
  }

  const serializedMonths = goal.months.map(m => ({
    id: m.id,
    title: m.title,
    order: m.order,
    isLocked: m.isLocked,
    commitments: m.commitments.map(c => ({
      id: c.id,
      title: c.title,
      order: c.order,
    })),
  }));

  // Calculate progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDuration = goal.endDate.getTime() - goal.startDate.getTime();
  const elapsed = today.getTime() - goal.startDate.getTime();
  const progressPercent = Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
  const daysRemaining = Math.max(0, Math.ceil((goal.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Current month
  let currentMonthIndex = 0;
  if (goal.months.length > 0) {
    const monthDuration = totalDuration / goal.months.length;
    currentMonthIndex = Math.min(
      Math.max(0, Math.floor(elapsed / monthDuration)),
      goal.months.length - 1
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Roadmap</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Your long-term goal and monthly commitments</p>
      </div>

      {/* Goal Header */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-1">MY GOAL</p>
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">{goal.title}</h2>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {goal.startDate.toLocaleDateString()} – {goal.endDate.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-accent)]">{daysRemaining}</p>
            <p className="text-[10px] text-[var(--color-muted)]">days left</p>
          </div>
        </div>
        <ProgressBar value={progressPercent} showLabel />
      </Card>

      {/* Current Month Indicator */}
      {goal.months.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {goal.months.map((m, idx) => (
            <span
              key={m.id}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                idx === currentMonthIndex
                  ? 'bg-[var(--color-accent)] text-white shadow-md shadow-violet-500/20'
                  : idx < currentMonthIndex
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-[var(--color-secondary)] text-[var(--color-muted)]'
              }`}
            >
              M{m.order}: {m.title}
            </span>
          ))}
        </div>
      )}

      {/* Roadmap Builder */}
      <RoadmapBuilder goalId={goal.id} months={serializedMonths} />
    </div>
  );
}
