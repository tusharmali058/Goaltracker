"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createWeeklyPlan, addWeeklyTarget, addDailyAssignment } from "@/app/actions/week";

type Commitment = { id: string; title: string };

type Assignment = {
  id: string;
  title: string;
  date: string;
  isCompleted: boolean;
};

type Target = {
  id: string;
  title: string;
  weight: number;
  assignments: Assignment[];
};

type Plan = {
  id: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  targets: Target[];
};

// ---------------------------------------------------------------------------
// Create Weekly Plan Button
// ---------------------------------------------------------------------------
export function CreateWeeklyPlanButton({
  groupId,
  weeklyDeadline,
}: {
  groupId: string;
  weeklyDeadline: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isExpired = weeklyDeadline && new Date() > new Date(weeklyDeadline);

  function handleCreate() {
    setError(null);
    const formData = new FormData();
    formData.set("groupId", groupId);
    startTransition(async () => {
      const result = await createWeeklyPlan(formData);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="text-center space-y-3">
      {weeklyDeadline && (
        <p className={`text-xs ${isExpired ? "text-red-500" : "text-[var(--color-muted)]"}`}>
          Weekly deadline: {new Date(weeklyDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          {isExpired && " (expired)"}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <button
        onClick={handleCreate}
        disabled={isPending || !!isExpired}
        className="px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 font-medium transition-all disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Creating..." : "Create This Week's Plan"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weekly Plan View with inline add forms
// ---------------------------------------------------------------------------
export function WeeklyPlanView({
  plan,
  commitments,
  weekDates,
  currentMonthTitle,
}: {
  plan: Plan;
  commitments: Commitment[];
  weekDates: string[]; // array of ISO date strings for the week
  currentMonthTitle?: string | null;
}) {
  return (
    <div className="space-y-4">
      {currentMonthTitle && (
        <div className="px-4 py-2.5 bg-[var(--color-secondary)] rounded-lg border border-[var(--color-border)]">
          <p className="text-xs font-medium text-[var(--color-muted)]">
            Setting targets for: <span className="text-[var(--color-accent)] font-semibold">{currentMonthTitle}</span>
          </p>
        </div>
      )}
      {plan.targets.map(target => (
        <TargetCard key={target.id} target={target} weekDates={weekDates} />
      ))}
      {!plan.isLocked && (
        <AddTargetForm planId={plan.id} commitments={commitments} />
      )}
    </div>
  );
}

function TargetCard({ target, weekDates }: { target: Target; weekDates: string[] }) {
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  return (
    <div className="bg-[var(--color-surface)] p-5 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[var(--color-primary)]">{target.title}</h3>
        <span className="text-xs bg-[var(--color-secondary)] text-[var(--color-muted)] px-2 py-1 rounded">
          Weight: {target.weight}
        </span>
      </div>

      {target.assignments.length > 0 && (
        <div className="space-y-2 mb-3">
          {target.assignments.map(a => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-2 rounded text-sm ${
                a.isCompleted
                  ? "bg-green-50 text-green-700"
                  : "bg-[var(--color-secondary)] text-[var(--color-foreground)]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${a.isCompleted ? "bg-green-500" : "bg-[var(--color-muted)]"}`} />
              <span className="flex-1">{a.title}</span>
              <span className="text-xs text-[var(--color-muted)]">
                {new Date(a.date).toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {!showAddAssignment ? (
        <button
          onClick={() => setShowAddAssignment(true)}
          className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          <Plus size={12} />
          Add daily assignment
        </button>
      ) : (
        <AddAssignmentForm
          targetId={target.id}
          weekDates={weekDates}
          onClose={() => setShowAddAssignment(false)}
        />
      )}
    </div>
  );
}

function AddTargetForm({ planId, commitments }: { planId: string; commitments: Commitment[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addWeeklyTarget(formData);
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
        Add Weekly Target
      </button>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <form action={handleSubmit} className="space-y-3">
        <input type="hidden" name="weeklyPlanId" value={planId} />
        <div>
          <input
            name="title"
            type="text"
            required
            placeholder="What do you want to achieve this week?"
            autoFocus
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="flex gap-3">
          {commitments.length > 0 && (
            <select
              name="monthlyCommitmentId"
              className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">Link to commitment (optional)</option>
              {commitments.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
          <input
            name="weight"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            className="w-20 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Wt"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "..." : "Add Target"}
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(false); setError(null); }}
            className="px-3 py-2 text-[var(--color-muted)] text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AddAssignmentForm({
  targetId,
  weekDates,
  onClose,
}: {
  targetId: string;
  weekDates: string[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addDailyAssignment(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex gap-2 mt-2 items-end">
      <input type="hidden" name="weeklyTargetId" value={targetId} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        name="title"
        type="text"
        required
        placeholder="Assignment title"
        autoFocus
        className="flex-1 px-3 py-1.5 border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
      <select
        name="date"
        required
        className="px-2 py-1.5 border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      >
        {weekDates.map(d => (
          <option key={d} value={d}>
            {new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 bg-[var(--color-accent)] text-white rounded text-xs font-medium disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "..." : "Add"}
      </button>
      <button type="button" onClick={onClose} className="px-2 py-1.5 text-[var(--color-muted)] text-xs cursor-pointer">
        ✕
      </button>
    </form>
  );
}
