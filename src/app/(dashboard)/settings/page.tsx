import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Settings</h1>
        <p className="text-[var(--color-muted)] mt-1">Manage your account preferences</p>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">Preferences</h2>
        <p className="text-[var(--color-muted)] text-sm">Settings page is coming soon. You&apos;ll be able to update your timezone, notification preferences, and more.</p>
      </div>
    </div>
  );
}
