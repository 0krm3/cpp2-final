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
  // --- 門番（認証チェック）---
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
  // --- 門番ここまで ---

  // PUTリクエスト以外は許可しない
  if (req.method !== 'PUT') {
    return res.status(405).end('Method Not Allowed');
  }

  // URLからバッチのIDを取得
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Batch ID must be a string' });
  }

  try {
    // データベースのPayrollBatchを更新する
    const updatedBatch = await prisma.payrollBatch.update({
      where: { id }, // URLで指定されたIDのバッチを探す
      data: {
        status: 'approved', // statusを'approved'に更新
        approvedAt: new Date(), // 承認日時を記録
      },
    });

    res.status(200).json(updatedBatch);

  } catch (error) {
    console.error('Failed to approve payroll batch:', error);
    res.status(500).json({ error: 'Failed to approve payroll batch' });
  }
}