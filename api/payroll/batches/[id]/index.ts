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
  // --- 認証チェック (変更なし) ---
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

  if (req.method === 'GET') {
    const { id } = req.query;

    // ▼▼▼ この行を追加 ▼▼▼
    console.log(`[API LOG] Received request for batchId: ${id}`);
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Batch ID must be a string' });
    }

    try {
      const records = await prisma.payrollRecord.findMany({
        where: {
          batchId: id,
        },
      });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}