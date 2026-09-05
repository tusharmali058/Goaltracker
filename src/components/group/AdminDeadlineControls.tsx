"use client";

import { useState, useTransition } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { setMonthlyDeadline, setWeeklyDeadline, extendDeadline } from "@/app/actions/admin";

type Props = {
  groupId: string;
  monthlyDeadline: string | null; // ISO string
  weeklyDeadline: string | null;  // ISO string
};

export function AdminDeadlineControls({ groupId, monthlyDeadline, weeklyDeadline }: Props) {
  const [showModal, setShowModal] = useState<"monthly" | "weekly" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSetDeadline(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = showModal === "monthly" ? setMonthlyDeadline : setWeeklyDeadline;
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(null);
        setError(null);
      }
    });
  }

  function handleExtend(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await extendDeadline(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(null);
        setError(null);
      }
    });
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return "Not set";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const isExpired = (iso: string | null) => {
    if (!iso) return false;
    return new Date() > new Date(iso);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider">
        Admin Controls
      </h3>

      {/* Monthly Deadline */}
      <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[var(--color-accent)]" />
          <div>
            <p className="text-xs font-medium text-[var(--color-foreground)]">Monthly Deadline</p>
            <p className={`text-xs ${isExpired(monthlyDeadline) ? "text-red-500" : "text-[var(--color-muted)]"}`}>
              {formatDate(monthlyDeadline)} {isExpired(monthlyDeadline) && "(expired)"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal("monthly")}
          className="text-xs px-2.5 py-1 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 cursor-pointer"
        >
          {monthlyDeadline ? "Extend" : "Set"}
        </button>
      </div>

      {/* Weekly Deadline */}
      <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--color-warning)]" />
          <div>
            <p className="text-xs font-medium text-[var(--color-foreground)]">Weekly Deadline</p>
            <p className={`text-xs ${isExpired(weeklyDeadline) ? "text-red-500" : "text-[var(--color-muted)]"}`}>
              {formatDate(weeklyDeadline)} {isExpired(weeklyDeadline) && "(expired)"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal("weekly")}
          className="text-xs px-2.5 py-1 bg-[var(--color-warning)] text-white rounded-md hover:opacity-90 cursor-pointer"
        >
          {weeklyDeadline ? "Extend" : "Set"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowModal(null); setError(null); }} />
          <div className="relative bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] w-full max-w-sm p-6">
            <button
              onClick={() => { setShowModal(null); setError(null); }}
              className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-1">
              {showModal === "monthly" ? "Monthly" : "Weekly"} Deadline
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Set when members must submit their {showModal === "monthly" ? "monthly commitments" : "weekly targets"}.
            </p>

            {error && (
              <div className="mb-3 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form
              action={
                (showModal === "monthly" && monthlyDeadline) || (showModal === "weekly" && weeklyDeadline)
                  ? handleExtend
                  : handleSetDeadline
              }
              className="space-y-3"
            >
              <input type="hidden" name="groupId" value={groupId} />
              {((showModal === "monthly" && monthlyDeadline) || (showModal === "weekly" && weeklyDeadline)) && (
                <input type="hidden" name="type" value={showModal} />
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  Deadline Date & Time
                </label>
                <input
                  name="deadline"
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Saving..." : "Save Deadline"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
