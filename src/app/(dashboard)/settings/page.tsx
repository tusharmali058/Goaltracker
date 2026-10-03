import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Settings, User, Globe, Bell, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      timezone: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          group: { select: { name: true } },
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--color-accent)]" />
          Settings
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          Manage your account preferences
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <User className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Account Information
          </h3>
        </div>
        <dl className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <dt className="text-sm text-[var(--color-muted)]">Name</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">
              {user.name || "Not set"}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <dt className="text-sm text-[var(--color-muted)]">Email</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">
              {user.email}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <dt className="text-sm text-[var(--color-muted)]">Member Since</dt>
            <dd className="text-sm font-medium text-[var(--color-foreground)]">
              {user.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-sm text-[var(--color-muted)]">Groups</dt>
            <dd className="flex flex-wrap gap-1.5 justify-end">
              {user.memberships.length > 0 ? (
                user.memberships.map((m, i) => (
                  <Badge
                    key={i}
                    variant={m.role === "ADMIN" ? "admin" : "accent"}
                  >
                    {m.group.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-[var(--color-muted)]">None</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Timezone */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <Globe className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Regional
          </h3>
        </div>
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              Timezone
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Used for daily check-in cutoffs and deadlines
            </p>
          </div>
          <Badge variant="accent">{user.timezone}</Badge>
        </div>
      </Card>

      {/* Notifications (Coming Soon) */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <Bell className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Notifications
          </h3>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Notification preferences for deadline reminders, streak alerts, and
          admin actions are coming soon.
        </p>
      </Card>

      {/* Security (Coming Soon) */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Security
          </h3>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Password change and two-factor authentication options are coming soon.
        </p>
      </Card>
    </div>
  );
}
