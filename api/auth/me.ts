import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

// JWTを検証するためのインターフェースを定義
interface JwtPayload {
  userId: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // 1. ヘッダーからトークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];

    // 2. トークンを検証（門番のチェック）
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // 3. トークン内のユーザーIDでユーザーを検索
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 4. パスワードハッシュを除いてユーザー情報を返す
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    // トークンの期限切れや不正なトークンの場合は401エラーを返す
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
}