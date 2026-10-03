"use client";

import { useState, useTransition } from "react";
import { adjustScore } from "@/app/actions/adminOverrides";

type Member = {
  userId: string;
  userName: string;
  totalScore: number;
};

type Props = {
  groupId: string;
  groupName: string;
  members: Member[];
};

export function ScoreAdjustmentForm({ groupId, groupName, members }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await adjustScore(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Reset form after short delay
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-foreground)]">Score Adjustment</h3>
          <p className="text-xs text-[var(--color-muted)]">{groupName}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Score adjusted successfully
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="groupId" value={groupId} />

        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Member
          </label>
          <select
            name="targetUserId"
            required
            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
          >
            <option value="">Select a member...</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.userName} (Score: {Math.round(m.totalScore)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Points
          </label>
          <input
            name="points"
            type="number"
            step="0.5"
            required
            placeholder="e.g. 5 or -3"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Use negative values to deduct points
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Reason
          </label>
          <textarea
            name="reason"
            required
            rows={2}
            placeholder="Why is this adjustment being made?"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-[var(--color-destructive)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {isPending ? "Applying..." : "Apply Adjustment"}
        </button>
      </form>
    </div>
  );
}
