import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { formidable } from 'formidable';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const file = await new Promise<any>((resolve, reject) => {
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve(files.file?.[0]);
      });
    });

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const content = fs.readFileSync(file.filepath, 'utf8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      // CSVのデータ型をスキーマに合わせて変換
      cast: (value, context) => {
        // '基本給'と'扶養人数'を数値に変換する
        if (context.column === '基本給' || context.column === '扶養人数') {
          return parseInt(value, 10) || 0;
        }
        // '入社日'と'生年月日'を日付オブジェクトに変換する
        if (context.column === '入社日' || context.column === '生年月日') {
          // 不正な日付の場合はnullを返し、後の処理でエラーを検知しやすくする
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        }
        return value;
      }
    });

    await prisma.$transaction(
      records.map((record: any) => {
        // CSVのヘッダー名と完全に一致させる
        const employeeData = {
          id: record.ID,
          name: record.氏名,
          dateOfBirth: record.生年月日,
          email: record.メールアドレス,
          department: record.部署,
          position: record.役職,
          baseSalary: record.基本給,
          dependents: record.扶養人数,
          municipality: record.居住地,
          joinDate: record.入社日,
          // CSVにないがスキーマで必須の項目
          isActive: true,
        };
        
        // 日付のバリデーション
        if (!employeeData.joinDate) {
            throw new Error(`Invalid joinDate for employee ID: ${employeeData.id}`);
        }

        return prisma.employee.upsert({
          where: { id: employeeData.id },
          update: { // 存在した場合に更新するデータ
            name: employeeData.name,
            dateOfBirth: employeeData.dateOfBirth,
            email: employeeData.email,
            department: employeeData.department,
            position: employeeData.position,
            baseSalary: employeeData.baseSalary,
            dependents: employeeData.dependents,
            municipality: employeeData.municipality,
            joinDate: employeeData.joinDate,
          },
          create: employeeData, // 存在しなかった場合に新規作成するデータ
        });
      })
    );
    
    res.status(200).json({ message: `Bulk update completed successfully.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process file.' });
  }
}