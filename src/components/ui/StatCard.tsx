import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]",
        "transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-secondary)] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[var(--color-foreground)]">{value}</span>
            {trend && trend !== "neutral" && (
              <span className={cn("text-xs font-medium", trend === "up" ? "text-emerald-500" : "text-red-500")}>
                {trend === "up" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)] truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}
