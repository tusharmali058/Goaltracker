"use client";

import { useState, useTransition } from "react";
import { Plus, UserPlus, X, Copy, Check } from "lucide-react";
import { createGroup, joinGroup } from "@/app/actions/group";

type ModalState = "none" | "create" | "join";

export function GroupActions() {
  const [modal, setModal] = useState<ModalState>("none");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createGroup(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setModal("none");
        setError(null);
      }
    });
  }

  function handleJoin(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await joinGroup(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setModal("none");
        setError(null);
      }
    });
  }

  function closeModal() {
    setModal("none");
    setError(null);
    setSuccessCode(null);
    setCopied(false);
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => setModal("create")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus size={18} />
          Create Group
        </button>
        <button
          onClick={() => setModal("join")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-secondary)] transition-all font-medium text-sm cursor-pointer"
        >
          <UserPlus size={18} />
          Join Group
        </button>
      </div>

      {/* Modal Overlay */}
      {modal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {modal === "create" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                    Create a Group
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    You&apos;ll be the admin of this group
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form action={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                      Group Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      maxLength={50}
                      placeholder="e.g. Study Squad"
                      className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                      Description{" "}
                      <span className="text-[var(--color-muted)] font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      name="description"
                      maxLength={200}
                      rows={3}
                      placeholder="What is this group about?"
                      className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2.5 px-4 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? "Creating..." : "Create Group"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                    Join a Group
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Enter the invite code shared by your group admin
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form action={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                      Group Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="code"
                      type="text"
                      required
                      placeholder="e.g. A1B2C3D4"
                      className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm font-mono tracking-wider uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2.5 px-4 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? "Joining..." : "Join Group"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function GroupCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copyCode}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-secondary)] rounded-md text-xs font-mono tracking-wider text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
      title="Click to copy invite code"
    >
      {code}
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
    </button>
  );
}
