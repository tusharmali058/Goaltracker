"use client";

import { useState, useTransition } from "react";
import { Target, X } from "lucide-react";
import { createGoal } from "@/app/actions/goal";

export function GroupGoalForm({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createGoal(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setError(null);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium cursor-pointer"
      >
        <Target size={14} />
        Create Goal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setIsOpen(false); setError(null); }}
          />

          <div className="relative bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] w-full max-w-md p-6">
            <button
              onClick={() => { setIsOpen(false); setError(null); }}
              className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                Create Group Goal
              </h2>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                This goal will be shared with all group members
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="groupId" value={groupId} />

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                  Goal Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Master Full-Stack Development"
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    required
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? "Creating..." : "Create Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
