import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: "sm" | "md" | "lg";
};

export function Card({ children, className, hover, glass, padding = "md" }: CardProps) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)]",
        glass ? "glass" : "bg-[var(--color-surface)]",
        "shadow-[var(--shadow-card)]",
        hover && "card-hover cursor-pointer",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold text-[var(--color-foreground)]", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-[var(--color-muted)] mt-1", className)}>{children}</p>;
}
