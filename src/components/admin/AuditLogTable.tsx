"use client";

import { useState } from "react";

type AuditEntry = {
  id: string;
  adminName: string;
  actionType: string;
  affectedUserName: string | null;
  entityType: string;
  entityId: string;
  previousVal: string | null;
  newVal: string | null;
  reason: string | null;
  groupName: string;
  createdAt: string; // ISO string
};

type Props = {
  entries: AuditEntry[];
  groups: { id: string; name: string }[];
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ADJUST_SCORE: { label: "Score Adjustment", color: "bg-red-100 text-red-700" },
  EDIT_WEEKLY_TARGET: { label: "Edit Target", color: "bg-amber-100 text-amber-700" },
  CORRECT_SCORE: { label: "Score Correction", color: "bg-orange-100 text-orange-700" },
};

export function AuditLogTable({ entries, groups }: Props) {
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  const actionTypes = Array.from(new Set(entries.map((e) => e.actionType)));

  const filtered = entries.filter((e) => {
    if (filterGroup !== "all" && e.groupName !== filterGroup) return false;
    if (filterAction !== "all" && e.actionType !== filterAction) return false;
    return true;
  });

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatJson(val: string | null) {
    if (!val) return "—";
    try {
      const obj = JSON.parse(val);
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    } catch {
      return val;
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          <option value="all">All Actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]?.label ?? a}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-[var(--color-muted)] self-center">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--color-surface)] p-12 rounded-lg border border-[var(--color-border)] text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-[var(--color-muted)]">No audit log entries found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-secondary)] border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Admin</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Affected User</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Group</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Details</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-muted)] text-xs uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((entry) => {
                  const actionStyle = ACTION_LABELS[entry.actionType] ?? {
                    label: entry.actionType,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr key={entry.id} className="hover:bg-[var(--color-secondary)]/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-[var(--color-muted)] whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${actionStyle.color}`}>
                          {actionStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-foreground)] whitespace-nowrap">
                        {entry.adminName}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-foreground)] whitespace-nowrap">
                        {entry.affectedUserName || "—"}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted)] whitespace-nowrap">
                        {entry.groupName}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-muted)] max-w-[200px]">
                        {entry.previousVal && (
                          <div>
                            <span className="text-red-500 line-through">{formatJson(entry.previousVal)}</span>
                          </div>
                        )}
                        {entry.newVal && (
                          <div>
                            <span className="text-green-600">{formatJson(entry.newVal)}</span>
                          </div>
                        )}
                        {!entry.previousVal && !entry.newVal && "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-muted)] max-w-[200px] truncate">
                        {entry.reason || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
