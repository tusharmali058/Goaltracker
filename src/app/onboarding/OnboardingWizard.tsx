"use client";

import { useState, useTransition } from "react";
import { Target, Plus, ChevronDown, ChevronRight, UserPlus, Users, ArrowRight, Sparkles } from "lucide-react";
import { createGoal, addRoadmapMonth, addMonthlyCommitment } from "@/app/actions/goal";
import { createGroup, joinGroup } from "@/app/actions/group";
import { useRouter } from "next/navigation";

type Commitment = { id: string; title: string; order: number };
type Month = { id: string; title: string; order: number; isLocked: boolean; commitments: Commitment[] };

type Props = {
  currentStep: number;
  goalId: string | null;
  goalTitle: string | null;
  months: Month[];
  userName: string | null;
};

export function OnboardingWizard({ currentStep, goalId, goalTitle, months, userName }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-8 slide-up">
      {/* Welcome */}
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-violet-500" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          {currentStep === 1
            ? `Welcome${userName ? `, ${userName}` : ''}! Let's get started`
            : currentStep === 2
            ? 'Build your roadmap'
            : 'Almost there!'}
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          {currentStep === 1
            ? 'Set your long-term goal to begin your journey.'
            : currentStep === 2
            ? 'Break your goal into monthly milestones and commitments.'
            : 'Join or create a group to unlock weekly targets.'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step < currentStep
                  ? 'bg-emerald-500 text-white'
                  : step === currentStep
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-[var(--color-secondary)] text-[var(--color-muted)]'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 rounded-full ${step < currentStep ? 'bg-emerald-300' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-8">
        {currentStep === 1 && <Step1CreateGoal />}
        {currentStep === 2 && goalId && <Step2Roadmap goalId={goalId} goalTitle={goalTitle!} months={months} />}
        {currentStep === 3 && <Step3JoinGroup />}
      </div>
    </div>
  );
}

/* ── Step 1: Create Goal ── */
function Step1CreateGoal() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createGoal(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-violet-500" />
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Define Your Goal</h2>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm">{error}</div>
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
            className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:bg-white text-sm transition-all"
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
              className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:bg-white text-sm transition-all"
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
              className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:bg-white text-sm transition-all"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? "Creating..." : "Create Goal"}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  );
}

/* ── Step 2: Build Roadmap ── */
function Step2Roadmap({ goalId, goalTitle, months }: { goalId: string; goalTitle: string; months: Month[] }) {
  const router = useRouter();
  const hasCommitments = months.some(m => m.commitments.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{goalTitle}</h2>
          <p className="text-xs text-[var(--color-muted)]">Add months and commitments to your roadmap</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {months.map(month => (
          <MonthItem key={month.id} month={month} />
        ))}
        <AddMonthForm goalId={goalId} />
      </div>

      {hasCommitments && (
        <button
          onClick={() => router.refresh()}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Continue to next step
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

function MonthItem({ month }: { month: Month }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 bg-[var(--color-secondary)]/50 hover:bg-[var(--color-secondary)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="font-medium text-sm text-[var(--color-foreground)]">
            Month {month.order}: {month.title}
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-muted)] font-medium">
          {month.commitments.length} commitment{month.commitments.length !== 1 ? 's' : ''}
        </span>
      </button>
      {isExpanded && (
        <div className="p-3.5 pt-0 space-y-1.5">
          {month.commitments.length > 0 && (
            <ul className="space-y-1 mt-3">
              {month.commitments.map(c => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-[var(--color-foreground)] p-2 bg-[var(--color-secondary)] rounded-[var(--radius-sm)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                  {c.title}
                </li>
              ))}
            </ul>
          )}
          {!month.isLocked && <InlineAddCommitment monthId={month.id} />}
        </div>
      )}
    </div>
  );
}

function AddMonthForm({ goalId }: { goalId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addRoadmapMonth(formData);
      if (result.error) setError(result.error);
      else { setIsAdding(false); router.refresh(); }
    });
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors cursor-pointer text-sm"
      >
        <Plus size={16} /> Add Month
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
          className="w-full px-3 py-2 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm"
        />
      </div>
      <button type="submit" disabled={isPending} className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] text-sm font-medium disabled:opacity-50 cursor-pointer">
        {isPending ? "..." : "Add"}
      </button>
      <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-[var(--color-muted)] text-sm cursor-pointer">Cancel</button>
    </form>
  );
}

function InlineAddCommitment({ monthId }: { monthId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addMonthlyCommitment(formData);
      if (result.error) setError(result.error);
      else { setIsAdding(false); router.refresh(); }
    });
  }

  if (!isAdding) {
    return (
      <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline mt-2 cursor-pointer">
        <Plus size={12} /> Add commitment
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
        placeholder="e.g. Build 3 projects"
        autoFocus
        className="flex-1 px-3 py-1.5 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
      <button type="submit" disabled={isPending} className="px-3 py-1.5 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] text-xs font-medium disabled:opacity-50 cursor-pointer">
        {isPending ? "..." : "Add"}
      </button>
      <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-1.5 text-[var(--color-muted)] text-xs cursor-pointer">✕</button>
    </form>
  );
}

/* ── Step 3: Join / Create Group ── */
function Step3JoinGroup() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createGroup(formData);
      if (result.error) setError(result.error);
      else router.push("/");
    });
  }

  function handleJoin(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await joinGroup(formData);
      if (result.error) setError(result.error);
      else router.push("/");
    });
  }

  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-500" /> Join a Group
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Groups unlock weekly planning and daily assignments. Create your own or join an existing one.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setMode("create")}
            className="flex flex-col items-center gap-2 p-5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-violet-50 transition-all cursor-pointer"
          >
            <Plus className="w-6 h-6 text-[var(--color-accent)]" />
            <span className="text-sm font-semibold text-[var(--color-foreground)]">Create Group</span>
            <span className="text-xs text-[var(--color-muted)]">You'll be the admin</span>
          </button>
          <button
            onClick={() => setMode("join")}
            className="flex flex-col items-center gap-2 p-5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-violet-50 transition-all cursor-pointer"
          >
            <UserPlus className="w-6 h-6 text-[var(--color-accent)]" />
            <span className="text-sm font-semibold text-[var(--color-foreground)]">Join Group</span>
            <span className="text-xs text-[var(--color-muted)]">Enter invite code</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => { setMode("choose"); setError(null); }} className="text-xs text-[var(--color-accent)] hover:underline mb-4 cursor-pointer">
        ← Back
      </button>
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
        {mode === "create" ? "Create a Group" : "Join a Group"}
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm">{error}</div>
      )}
      <form action={mode === "create" ? handleCreate : handleJoin} className="space-y-4">
        {mode === "create" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Group Name *</label>
              <input name="name" type="text" required maxLength={50} placeholder="e.g. Study Squad"
                className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:bg-white text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Description <span className="text-[var(--color-muted)] font-normal">(optional)</span></label>
              <textarea name="description" maxLength={200} rows={2} placeholder="What is this group about?"
                className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:bg-white text-sm transition-all resize-none" />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Group Code *</label>
            <input name="code" type="text" required placeholder="e.g. A1B2C3D4"
              className="w-full px-4 py-3 bg-[var(--color-secondary)] border border-transparent rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:bg-white text-sm font-mono tracking-wider uppercase transition-all" />
          </div>
        )}
        <button type="submit" disabled={isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
          {isPending ? "..." : mode === "create" ? "Create Group" : "Join Group"}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  );
}
