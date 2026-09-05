import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { RoadmapBuilder } from "@/components/RoadmapBuilder";

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

  const serializedMonths = goal?.months.map(m => ({
    id: m.id,
    title: m.title,
    order: m.order,
    isLocked: m.isLocked,
    commitments: m.commitments.map(c => ({
      id: c.id,
      title: c.title,
      order: c.order,
    })),
  })) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">My Roadmap</h1>
        <p className="text-[var(--color-muted)] mt-1">Your long-term goal and monthly commitments</p>
      </div>

      {!goal ? (
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] text-center">
          <h2 className="text-xl font-semibold mb-2">No Goal Yet</h2>
          <p className="text-[var(--color-muted)] mb-4">Head to the dashboard to create your goal first.</p>
          <a href="/" className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 font-medium inline-block">
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Goal Header */}
          <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-1">{goal.title}</h2>
            <p className="text-sm text-[var(--color-muted)]">
              {goal.startDate.toLocaleDateString()} – {goal.endDate.toLocaleDateString()}
            </p>
          </div>

          {/* Roadmap Builder */}
          <RoadmapBuilder goalId={goal.id} months={serializedMonths} />
        </div>
      )}
    </div>
  );
}
