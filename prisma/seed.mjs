import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // --- 1. 管理者ユーザーの作成 ---
  const adminPasswordHash = await bcrypt.hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: '管理者',
      role: 'admin',
      passwordHash: adminPasswordHash,
    },
  });
  console.log(`Created admin user: admin@company.com`);

  // --- 2. 従業員データと、それに対応するユーザーを作成 ---
  const employeePasswordHash = await bcrypt.hash('password', 10);
  
  const employee = await prisma.employee.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      id: 'emp001',
      name: '従業員',
      email: 'employee@company.com',
      department: '一般',
      position: '担当',
      dateOfBirth: new Date('2000-01-01'),
      baseSalary: 300000,
      dependents: 0,
      municipality: '東京都',
      joinDate: new Date(),
      isActive: true,
    },
  });
  console.log(`Created employee: ${employee.name}`);

  await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      email: employee.email,
      name: employee.name,
      role: 'employee',
      passwordHash: employeePasswordHash,
      employeeId: employee.id,
    },
  });
  console.log(`Created user for employee: employee@company.com`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
