import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. メールアドレスでユーザーを検索
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' }); // ユーザーが見つからない
    }

    // 2. パスワードが一致するか検証
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' }); // パスワードが違う
    }
    
    // 3. JWT（証明書）を生成
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // トークンに含める情報
      process.env.JWT_SECRET as string,       // .envから秘密の鍵を読み込む
      { expiresIn: '1h' }                      // 有効期限（例: 1時間）
    );

    // 4. トークンを返す
    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
}