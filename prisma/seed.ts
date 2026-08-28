import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@goaltracker.com' },
    update: {},
    create: {
      email: 'admin@goaltracker.com',
      name: 'Admin Rahul',
      passwordHash,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@goaltracker.com' },
    update: {},
    create: {
      email: 'student@goaltracker.com',
      name: 'Student Parul',
      passwordHash,
    },
  });

  // 2. Create Group
  const group = await prisma.group.upsert({
    where: { code: 'GROUP-2026' },
    update: {},
    create: {
      name: 'Cohort 2026',
      description: 'The internship ready cohort',
      code: 'GROUP-2026',
    },
  });

  // 3. Add Members
  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: adminUser.id, groupId: group.id } },
    update: {},
    create: {
      userId: adminUser.id,
      groupId: group.id,
      role: Role.ADMIN,
    },
  });

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: studentUser.id, groupId: group.id } },
    update: {},
    create: {
      userId: studentUser.id,
      groupId: group.id,
      role: Role.STUDENT,
    },
  });

  // 4. Create Goal for Student
  const goal = await prisma.goal.create({
    data: {
      userId: studentUser.id,
      title: 'Become Internship Ready',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-02-01'),
    }
  });

  // 5. Create Roadmap Months & Commitments
  const m1 = await prisma.roadmapMonth.create({
    data: {
      goalId: goal.id,
      title: 'Month 1: JavaScript Fundamentals',
      order: 1,
      commitments: {
        create: [
          { title: 'DOM Manipulation', order: 1 },
          { title: 'Git and GitHub', order: 2 },
          { title: 'React Basics', order: 3 },
        ]
      }
    }
  });

  const m2 = await prisma.roadmapMonth.create({
    data: {
      goalId: goal.id,
      title: 'Month 2: Advanced React',
      order: 2,
      commitments: {
        create: [
          { title: 'Authentication', order: 1 },
          { title: 'Protected Routes', order: 2 },
        ]
      }
    }
  });

  // 6. Create Weekly Plan for current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() - today.getDay() + 6);

  const weeklyPlan = await prisma.weeklyPlan.create({
    data: {
      userId: studentUser.id,
      startDate: startOfWeek,
      endDate: endOfWeek,
      targets: {
        create: [
          { title: 'Complete auth system', weight: 3 },
          { title: 'Build login form', weight: 2 },
          { title: 'Solve 3 DSA problems', weight: 1 },
        ]
      }
    },
    include: { targets: true }
  });

  // 7. Create Daily Assignments
  await prisma.dailyAssignment.create({
    data: {
      userId: studentUser.id,
      weeklyTargetId: weeklyPlan.targets[0].id,
      title: 'Setup NextAuth',
      date: new Date(),
      isCompleted: true,
      isLocked: false,
    }
  });
  
  await prisma.dailyAssignment.create({
    data: {
      userId: studentUser.id,
      weeklyTargetId: weeklyPlan.targets[1].id,
      title: 'Build UI form',
      date: new Date(),
      isCompleted: false,
      isLocked: false,
    }
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
