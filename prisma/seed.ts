import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // --- 1. 管理者ユーザーの作成 ---
  const adminPasswordHash = await bcrypt.hash('password', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: '管理者',
      role: 'admin',
      passwordHash: adminPasswordHash,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // --- 2. 従業員データと、それに対応するユーザーを作成 ---
  const employeePasswordHash = await bcrypt.hash('password', 10);
  
  // Employeeテーブルに従業員を作成
  const employee = await prisma.employee.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      id: 'emp001', // 従業員IDを固定
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

  // Userテーブルに従業員用ユーザーを作成
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      email: employee.email,
      name: employee.name,
      role: 'employee',
      passwordHash: employeePasswordHash,
      employeeId: employee.id, // ★ UserとEmployeeを紐付ける
    },
  });
  console.log(`Created user for employee: ${employeeUser.email}`);
  

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Caught an error during seeding:');
    // エラーオブジェクトがErrorインスタンスか確認し、より詳細な情報を出力
    if (e instanceof Error) {
        console.error(`Error Name: ${e.name}`);
        console.error(`Error Message: ${e.message}`);
        console.error(`Error Stack: ${e.stack}`);
    } else {
        console.error('The thrown object was not an Error instance:');
        console.error(e);
    }
    process.exit(1);
  })
  .finally(async () => {
    console.log('Disconnecting Prisma Client...');
    await prisma.$disconnect();
  });
