import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // --- GETリクエスト (従業員一覧の取得) ---
  if (req.method === 'GET') {
    try {
      const employees = await prisma.employee.findMany({
        orderBy: {
          createdAt: 'desc' // 新しい順に並び替え
        }
      });
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  } 
  // --- POSTリクエスト (新規従業員の登録) ---
  else if (req.method === 'POST') {
    try {
      // 1. フロントエンドから送られてきたデータを分割代入で受け取る
      const { 
        name, 
        email, 
        department, 
        position, 
        dateOfBirth,
        baseSalary, 
        dependents, 
        municipality, 
        joinDate,
        isActive 
      } = req.body;

      // 2. Prismaに渡すために、日付文字列をDateオブジェクトに変換する
      const dataForDb = {
        name,
        email,
        department,
        position,
        dateOfBirth: new Date(dateOfBirth),
        baseSalary,
        dependents,
        municipality,
        joinDate: new Date(joinDate),
        isActive,
      };

      // 3. 型を整えたデータをPrismaに渡す
      const newEmployee = await prisma.employee.create({
        data: dataForDb,
      });

      res.status(201).json(newEmployee);

    } catch (error) {
      console.error("Create employee error:", error); 
      res.status(500).json({ error: 'Failed to create employee' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
