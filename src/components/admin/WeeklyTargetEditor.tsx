"use client";

import { useState, useTransition } from "react";
import { editWeeklyTarget } from "@/app/actions/adminOverrides";

type Target = {
  id: string;
  title: string;
  weight: number;
  userName: string;
  userId: string;
};

type Props = {
  groupId: string;
  groupName: string;
  targets: Target[];
};

export function WeeklyTargetEditor({ groupId, groupName, targets }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  function handleSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await editWeeklyTarget(formData);
      if (result.error) {
        setError(result.error);
      } else {
        const targetId = formData.get("targetId") as string;
        setEditingId(null);
        setSuccessId(targetId);
        setTimeout(() => setSuccessId(null), 2000);
      }
    });
  }

  if (targets.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-foreground)]">Weekly Target Editor</h3>
            <p className="text-xs text-[var(--color-muted)]">{groupName}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)] text-center py-6">
          No weekly targets found for this week. Members need to create weekly plans first.
        </p>
      </div>
    );
  }

  // Group targets by user
  const byUser = targets.reduce<Record<string, { userName: string; targets: Target[] }>>((acc, t) => {
    if (!acc[t.userId]) {
      acc[t.userId] = { userName: t.userName, targets: [] };
    }
    acc[t.userId].targets.push(t);
    return acc;
  }, {});

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-foreground)]">Weekly Target Editor</h3>
          <p className="text-xs text-[var(--color-muted)]">{groupName}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(byUser).map(([userId, { userName, targets: userTargets }]) => (
          <div key={userId}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[var(--color-foreground)]">{userName}</span>
            </div>
            <div className="space-y-2 ml-9">
              {userTargets.map((target) => (
                <div
                  key={target.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    successId === target.id
                      ? "border-green-300 bg-green-50"
                      : "border-[var(--color-border)] bg-[var(--color-background)]"
                  }`}
                >
                  {editingId === target.id ? (
                    <form action={handleSave} className="space-y-3">
                      <input type="hidden" name="groupId" value={groupId} />
                      <input type="hidden" name="targetId" value={target.id} />
                      <div className="flex gap-2">
                        <input
                          name="title"
                          defaultValue={target.title}
                          required
                          className="flex-1 px-3 py-1.5 border border-[var(--color-border)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                        <input
                          name="weight"
                          type="number"
                          defaultValue={target.weight}
                          required
                          min={1}
                          className="w-20 px-3 py-1.5 border border-[var(--color-border)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => { setEditingId(null); setError(null); }}
                          className="px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-3 py-1 bg-[var(--color-accent)] text-white rounded text-xs font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          {isPending ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--color-foreground)]">{target.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-muted)]">
                          Weight: {target.weight}
                        </span>
                      </div>
                      <button
                        onClick={() => { setEditingId(target.id); setError(null); }}
                        className="text-xs px-2.5 py-1 text-[var(--color-accent)] hover:bg-[var(--color-secondary)] rounded transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
