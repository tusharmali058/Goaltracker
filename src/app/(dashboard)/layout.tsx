import { AppShell } from "@/components/layout/AppShell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Single query: fetch user name + admin status in one go
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      memberships: {
        select: { role: true },
      },
    },
  });

  const isAdmin = user?.memberships.some(m => m.role === "ADMIN") ?? false;

  return (
    <AppShell isAdmin={isAdmin} userName={user?.name || session.user.name}>
      {children}
    </AppShell>
  );
}
