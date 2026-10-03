import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Shield, ArrowLeft, ScrollText } from "lucide-react";

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get all groups where user is admin
  const adminMemberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id, role: "ADMIN" },
    include: { group: { select: { id: true, name: true } } },
  });

  if (adminMemberships.length === 0) {
    redirect("/");
  }

  const groupIds = adminMemberships.map((m) => m.group.id);

  // Fetch all audit logs for those groups (up to 100)
  const logs = await prisma.auditLog.findMany({
    where: { groupId: { in: groupIds } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admin: { select: { name: true, email: true } },
      group: { select: { name: true } },
    },
  });

  // Look up affected user names
  const affectedUserIds = logs
    .map((l) => l.affectedUser)
    .filter((id): id is string => id !== null);

  const affectedUsers = await prisma.user.findMany({
    where: { id: { in: affectedUserIds } },
    select: { id: true, name: true, email: true },
  });

  const userMap = new Map(affectedUsers.map((u) => [u.id, u.name || u.email]));

  const entries = logs.map((log) => ({
    id: log.id,
    adminName: log.admin.name || log.admin.email,
    actionType: log.actionType,
    affectedUserName: log.affectedUser ? (userMap.get(log.affectedUser) ?? log.affectedUser) : null,
    entityType: log.entityType,
    entityId: log.entityId,
    previousVal: log.previousVal,
    newVal: log.newVal,
    reason: log.reason,
    groupName: log.group.name,
    createdAt: log.createdAt.toISOString(),
  }));

  const groups = adminMemberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
  }));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin
            </Link>
            <Badge variant="admin">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[var(--color-accent)]" />
            Audit Log
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Complete history of all admin actions across your groups</p>
        </div>
      </div>

      <AuditLogTable entries={entries} groups={groups} />
    </div>
  );
}
