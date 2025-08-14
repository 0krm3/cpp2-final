import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID must be a string' });
  }

  // --- 特定の従業員を1件取得 ---
  if (req.method === 'GET') {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
      });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  }
  // --- 従業員情報を更新 ---
  else if (req.method === 'PUT') {
    try {
      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: req.body,
      });
      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update employee' });
    }
  }
  // --- 従業員を削除 ---
  else if (req.method === 'DELETE') {
    try {
      await prisma.employee.delete({
        where: { id },
      });
      res.status(204).end(); // 204: 成功したが中身は空
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete employee' });
    }
  }
  // --- それ以外のメソッドは許可しない ---
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}