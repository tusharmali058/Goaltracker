import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Determine which step the user is on
  const goal = await prisma.goal.findFirst({
    where: { userId },
    include: {
      months: {
        orderBy: { order: "asc" },
        include: { commitments: { orderBy: { order: "asc" } } },
      },
    },
  });

  const membership = await prisma.groupMember.findFirst({
    where: { userId },
  });

  // If everything is set up, redirect to dashboard
  const hasCommitments = goal?.months.some(m => m.commitments.length > 0) ?? false;
  if (goal && hasCommitments && membership) {
    redirect("/");
  }

  // Determine current step
  let currentStep = 1;
  if (goal) currentStep = 2;
  if (goal && hasCommitments) currentStep = 3;

  const serializedMonths = goal?.months.map(m => ({
    id: m.id,
    title: m.title,
    order: m.order,
    isLocked: m.isLocked,
    commitments: m.commitments.map(c => ({
      id: c.id,
      title: c.title,
      order: c.order,
    })),
  })) ?? [];

  return (
    <OnboardingWizard
      currentStep={currentStep}
      goalId={goal?.id ?? null}
      goalTitle={goal?.title ?? null}
      months={serializedMonths}
      userName={session.user.name ?? null}
    />
  );
}
