'use client';

import { useTransition } from 'react';
import { toggleAssignment, finishDay } from '@/app/actions/daily';

type Assignment = {
  id: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  weight: number;
  date: string; // ISO string
};

type BacklogItem = {
  id: string;
  originalDate: string;
  isCompleted: boolean;
  assignment: {
    id: string;
    title: string;
  };
};

export function AssignmentCheckbox({ assignment }: { assignment: Assignment }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (assignment.isLocked) return;
    startTransition(async () => {
      await toggleAssignment(assignment.id, !assignment.isCompleted);
    });
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded border transition-colors ${
        assignment.isCompleted
          ? 'bg-[var(--color-secondary)] border-[var(--color-border)] opacity-60'
          : 'bg-[var(--color-surface)] border-[var(--color-border)]'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        checked={assignment.isCompleted}
        onChange={handleToggle}
        disabled={assignment.isLocked || isPending}
        className="w-5 h-5 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
      />
      <span
        className={
          assignment.isCompleted
            ? 'line-through text-[var(--color-muted)]'
            : 'text-[var(--color-foreground)]'
        }
      >
        {assignment.title}
      </span>
    </div>
  );
}

export function FinishDayButton({ dateStr, disabled }: { dateStr: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleFinishDay() {
    startTransition(async () => {
      try {
        await finishDay(dateStr);
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : 'Failed to finish day');
      }
    });
  }

  return (
    <button
      onClick={handleFinishDay}
      disabled={disabled || isPending}
      className="px-6 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 cursor-pointer"
    >
      {isPending ? 'Finishing...' : 'FINISH DAY'}
    </button>
  );
}

export function BacklogCheckbox({ item }: { item: BacklogItem }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleAssignment(item.assignment.id, !item.isCompleted);
    });
  }

  return (
    <div className={`flex items-center gap-3 p-2 bg-white rounded border border-amber-200 ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={item.isCompleted}
        onChange={handleToggle}
        disabled={isPending}
        className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
      />
      <span className={`text-sm ${item.isCompleted ? 'line-through text-amber-400' : 'text-amber-900'}`}>
        {item.assignment.title}
      </span>
    </div>
  );
}

export function TodaySection({
  assignments,
  isFinalized,
}: {
  assignments: Assignment[];
  isFinalized: boolean;
}) {
  const completedCount = assignments.filter(a => a.isCompleted).length;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section>
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">TODAY</h2>
      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm space-y-4">
        {assignments.length === 0 ? (
          <p className="text-[var(--color-muted)] text-center py-4">
            No assignments for today. Set up your weekly plan to get started.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {assignments.map(a => (
                <AssignmentCheckbox key={a.id} assignment={a} />
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-muted)]">
                {completedCount} / {assignments.length} completed
              </span>
              {isFinalized ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded font-medium text-sm">
                  ✓ Day Finalized
                </span>
              ) : (
                <FinishDayButton dateStr={todayStr} />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function BacklogSection({ items }: { items: BacklogItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-amber-50 p-6 rounded-lg border border-amber-200 shadow-sm space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800">BACKLOG</h2>
      <p className="text-xs text-amber-700 mb-2">Backlog does not affect today&apos;s planned-task score.</p>
      <div className="space-y-2">
        {items.map(item => (
          <BacklogCheckbox key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
