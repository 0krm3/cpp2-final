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

  // --- GETリクエスト (設定の取得) ---
  if (req.method === 'GET') {
    try {
      // 常に最初の一件を取得（設定は一つしかない想定）
      const settings = await prisma.companySettings.findFirst();
      if (!settings) {
        // もし一件もなければ、空のオブジェクトを返すか、初期値を作成する
        return res.status(404).json({ error: 'Settings not found.' });
      }
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings.' });
    }
  }

  // --- PUTリクエスト (設定の更新) ---
  else if (req.method === 'PUT') {
    try {
      // まず既存の設定を探す
      const existingSettings = await prisma.companySettings.findFirst();

      let updatedSettings;
      if (existingSettings) {
        // 存在すれば更新する
        updatedSettings = await prisma.companySettings.update({
          where: { id: existingSettings.id },
          data: req.body,
        });
      } else {
        // 存在しなければ新規作成する
        updatedSettings = await prisma.companySettings.create({
          data: req.body,
        });
      }
      res.status(200).json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings.' });
    }
  }

  // --- それ以外のメソッドは許可しない ---
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}