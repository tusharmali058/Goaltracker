import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number; // 0–100
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning";
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
};

export function ProgressBar({
  value,
  size = "md",
  variant = "default",
  showLabel,
  className,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  const barColors = {
    default: clamped === 100
      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
      : "bg-gradient-to-r from-violet-400 to-indigo-500",
    success: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    warning: "bg-gradient-to-r from-amber-400 to-orange-500",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-[var(--color-secondary)] rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full rounded-full",
            barColors[variant],
            animated && "transition-all duration-700 ease-out"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--color-muted)]">{clamped}%</span>
        </div>
      )}
    </div>
  );
}
