import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
    const { email, password, name, role = 'employee' } = req.body;

    // 入力値のバリデーション
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // ユーザーが既に存在するかチェック
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' }); // 409: Conflict
    }

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(password, 10); // 10はハッシュ化の計算コスト

    // データベースに新しいユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
      },
    });
    
    // レスポンスからパスワードハッシュを削除
    const { passwordHash: _, ...userWithoutPassword } = user;


    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}