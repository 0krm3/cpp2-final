import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // --- 認証チェック ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // --- GETリクエスト (バッチ一覧の取得) ---
  if (req.method === 'GET') {
    try {
      const batches = await prisma.payrollBatch.findMany({
        orderBy: {
          createdAt: 'desc', // 新しい順に並び替え
        },
      });
      res.status(200).json(batches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payroll batches' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}