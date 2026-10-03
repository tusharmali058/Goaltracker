import { cn } from "@/lib/utils";
import Link from "next/link";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {icon && (
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white rounded-[var(--radius-md)] text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
