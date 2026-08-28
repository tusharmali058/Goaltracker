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

  // Optionally fetch user from db to get roles
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { memberships: true }
  });

  const isAdmin = user?.memberships.some(m => m.role === "ADMIN") ?? false;

  return (
    <AppShell isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
