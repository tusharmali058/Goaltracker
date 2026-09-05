"use client";

import { useState, useTransition } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { addRoadmapMonth, addMonthlyCommitment } from "@/app/actions/goal";

type Commitment = {
  id: string;
  title: string;
  order: number;
};

type Month = {
  id: string;
  title: string;
  order: number;
  isLocked: boolean;
  commitments: Commitment[];
};

export function RoadmapBuilder({ goalId, months }: { goalId: string; months: Month[] }) {
  return (
    <div className="space-y-4">
      {months.map(month => (
        <MonthCard key={month.id} month={month} />
      ))}
      <AddMonthForm goalId={goalId} />
    </div>
  );
}

function MonthCard({ month }: { month: Month }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <h3 className="font-semibold text-[var(--color-primary)]">
            Month {month.order}: {month.title}
          </h3>
          {month.isLocked && <span className="text-xs text-[var(--color-muted)]">🔒</span>}
        </div>
        <span className="text-xs text-[var(--color-muted)]">
          {month.commitments.length} commitment{month.commitments.length !== 1 ? "s" : ""}
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-2">
          {month.commitments.length > 0 && (
            <ul className="space-y-1.5 mt-3">
              {month.commitments.map(c => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-[var(--color-foreground)] p-2 bg-[var(--color-secondary)] rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                  {c.title}
                </li>
              ))}
            </ul>
          )}
          {!month.isLocked && <AddCommitmentForm monthId={month.id} />}
        </div>
      )}
    </div>
  );
}

function AddMonthForm({ goalId }: { goalId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addRoadmapMonth(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsAdding(false);
        setError(null);
      }
    });
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-accent)] transition-colors cursor-pointer text-sm"
      >
        <Plus size={16} />
        Add Month
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex gap-2 items-end">
      <input type="hidden" name="goalId" value={goalId} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex-1">
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. JavaScript Fundamentals"
          autoFocus
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "..." : "Add"}
      </button>
      <button
        type="button"
        onClick={() => { setIsAdding(false); setError(null); }}
        className="px-3 py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] text-sm cursor-pointer"
      >
        Cancel
      </button>
    </form>
  );
}

function AddCommitmentForm({ monthId }: { monthId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addMonthlyCommitment(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsAdding(false);
        setError(null);
      }
    });
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline mt-2 cursor-pointer"
      >
        <Plus size={12} />
        Add commitment
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex gap-2 mt-2">
      <input type="hidden" name="monthId" value={monthId} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        name="title"
        type="text"
        required
        placeholder="e.g. Build 3 projects with React"
        autoFocus
        className="flex-1 px-3 py-1.5 border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 bg-[var(--color-accent)] text-white rounded text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "..." : "Add"}
      </button>
      <button
        type="button"
        onClick={() => { setIsAdding(false); setError(null); }}
        className="px-2 py-1.5 text-[var(--color-muted)] text-xs cursor-pointer"
      >
        ✕
      </button>
    </form>
  );
}
