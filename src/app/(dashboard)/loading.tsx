export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse fade-in">
      {/* Header */}
      <div>
        <div className="h-7 w-32 bg-[var(--color-secondary)] rounded-[var(--radius-md)]" />
        <div className="h-4 w-48 bg-[var(--color-secondary)] rounded-[var(--radius-sm)] mt-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-[var(--radius-md)]" />
              <div>
                <div className="h-6 w-12 bg-[var(--color-secondary)] rounded mb-1" />
                <div className="h-3 w-16 bg-[var(--color-secondary)] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content card */}
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        <div className="h-5 w-24 bg-[var(--color-secondary)] rounded-[var(--radius-sm)] mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <div className="w-5 h-5 bg-[var(--color-secondary)] rounded" />
              <div className="h-4 flex-1 bg-[var(--color-secondary)] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-[var(--radius-md)]" />
            <div>
              <div className="h-4 w-20 bg-[var(--color-secondary)] rounded mb-1" />
              <div className="h-3 w-16 bg-[var(--color-secondary)] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
