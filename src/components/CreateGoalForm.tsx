"use client";

import { useState, useTransition } from "react";
import { Target, X } from "lucide-react";
import { createGoal } from "@/app/actions/goal";

export function CreateGoalForm() {
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 font-medium transition-all cursor-pointer"
      >
        <Target size={18} />
        Create Your Goal
      </button>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-lg">
      <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Create Your Goal</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
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

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2.5 px-4 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 font-medium text-sm disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Creating..." : "Create Goal"}
          </button>
          <button
            type="button"
            onClick={() => { setIsOpen(false); setError(null); }}
            className="px-4 py-2.5 bg-[var(--color-secondary)] text-[var(--color-foreground)] rounded-lg hover:bg-gray-200 font-medium text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
