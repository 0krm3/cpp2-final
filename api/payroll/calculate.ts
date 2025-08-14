// 外部ファイルから型をインポートするのをやめ、このファイル内で直接定義する
interface SimpleEmployee {
  id: string;
  name: string;
  dateOfBirth: Date;
  dependents: number;
  baseSalary: number;
}

interface PayrollCalculation {
  grossPay: number;
  incomeTax: number;
  residentTax: number;
  employeeInsurance: number;
  healthInsurance: number;
  longTermCareInsurance: number;
  pensionInsurance: number;
  totalSocialInsurance: number;
  totalDeductions: number;
  netPay: number;
}

// 雇用保険料率
const EMPLOYMENT_INSURANCE_RATE = 0.006;
// 健康保険料率
const HEALTH_INSURANCE_RATE = 0.0495;
// 介護保険料率
const LONG_TERM_CARE_INSURANCE_RATE = 0.0091;
// 厚生年金保険料率
const PENSION_INSURANCE_RATE = 0.0915;

// 源泉徴収税額表（月額表）のサンプルデータ
const incomeTaxTable2025 = [
  { min: 88000,  taxes: [290, 0, 0] },
  { min: 93000,  taxes: [810, 0, 0] },
  { min: 150000, taxes: [3130, 1200, 0] },
  { min: 200000, taxes: [4950, 3000, 1050] },
  { min: 250000, taxes: [6690, 4740, 2790] },
  { min: 300000, taxes: [8470, 6510, 4560] },
  { min: 350000, taxes: [10630, 8680, 6730] },
  { min: 400000, taxes: [15440, 13490, 11540] }
];

// 生年月日から減税の年齢を計算するヘルパー関数
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// 所得税計算（簡略化）
const getMonthlyIncomeTax = (
  monthlyGrossSalary: number,
  monthlySocialInsurance: number,
  dependentsCount: number
): number => {
  const salaryBase = monthlyGrossSalary - monthlySocialInsurance;
  if (salaryBase < incomeTaxTable2025[0].min) { return 0; }
  for (let i = incomeTaxTable2025.length - 1; i >= 0; i--) {
    const tier = incomeTaxTable2025[i];
    if (salaryBase >= tier.min) {
      if (dependentsCount < tier.taxes.length) { return tier.taxes[dependentsCount]; }
      return tier.taxes[tier.taxes.length - 1];
    }
  }
  return 0;
};

// 住民税計算（簡略化）
const calculateResidentTax = (annualIncome: number, dependents: number): number => {
  const taxableIncome = annualIncome - (dependents * 330000); // 扶養控除
  const basicDeduction = 430000; // 基礎控除
  const adjustedIncome = Math.max(0, taxableIncome - basicDeduction);
  const annualTax = Math.floor(adjustedIncome * 0.10);
  return Math.floor(annualTax / 12); // 月割り
};

export const calculatePayroll = (
  employee: SimpleEmployee, // ★ 型をSimpleEmployeeに変更
  baseSalary: number,
  overtime: number = 0,
  bonus: number = 0
): PayrollCalculation => {
  const grossPay = baseSalary + overtime + bonus;
  const employeeInsurance = Math.floor(grossPay * EMPLOYMENT_INSURANCE_RATE);
  const healthInsurance = Math.floor(grossPay * HEALTH_INSURANCE_RATE);
  const currentAge = calculateAge(employee.dateOfBirth);
  let longTermCareInsurance = 0;
  if (currentAge >= 40 && currentAge < 65) {
    longTermCareInsurance = Math.floor(grossPay * LONG_TERM_CARE_INSURANCE_RATE);
  }
  const pensionInsurance = Math.floor(grossPay * PENSION_INSURANCE_RATE);
  const totalSocialInsurance = employeeInsurance + healthInsurance + pensionInsurance + longTermCareInsurance;
  const incomeTax = getMonthlyIncomeTax(grossPay, totalSocialInsurance, employee.dependents);
  const residentTax = calculateResidentTax(grossPay * 12, employee.dependents);
  const totalDeductions = incomeTax + residentTax + totalSocialInsurance;
  const netPay = grossPay - totalDeductions;
  return { grossPay, incomeTax, residentTax, employeeInsurance, healthInsurance, longTermCareInsurance, pensionInsurance, totalSocialInsurance, totalDeductions, netPay };
};

// 元々のAPIのコード
import { Prisma, PrismaClient } from '@prisma/client';
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
  
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { year, month } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const employees = await tx.employee.findMany({ where: { isActive: true } });
      
      if (employees.length === 0) {
        throw new Error('No active employees found for calculation.');
      }
      
      const calculationResults = [];
      for (const employee of employees) {
        // Prismaから取得したemployeeオブジェクトは、SimpleEmployeeと互換性がある
        const result = calculatePayroll(employee, employee.baseSalary);
        calculationResults.push({
          employeeId: employee.id,
          year,
          month: month.toString(),
          baseSalary: employee.baseSalary,
          overtime: 0,
          bonus: 0,
          ...result,
        });
      }
      
      const totalGrossPay = calculationResults.reduce((sum, r) => sum + r.grossPay, 0);
      const totalDeductions = calculationResults.reduce((sum, r) => sum + r.totalDeductions, 0);
      const totalNetPay = calculationResults.reduce((sum, r) => sum + r.netPay, 0);
      
      const existingBatch = await tx.payrollBatch.findFirst({
        where: { year, month: month.toString() },
      });
      
      let batch;

      if (existingBatch) {
        await tx.payrollRecord.deleteMany({
          where: { batchId: existingBatch.id },
        });

        batch = await tx.payrollBatch.update({
          where: { id: existingBatch.id },
          data: {
            status: 'calculated',
            totalEmployees: employees.length,
            totalGrossPay,
            totalDeductions,
            totalNetPay,
            calculatedAt: new Date(),
          },
        });
      } else {
        batch = await tx.payrollBatch.create({
          data: {
            year,
            month: month.toString(),
            status: 'calculated',
            totalEmployees: employees.length,
            totalGrossPay,
            totalDeductions,
            totalNetPay,
          },
        });
      }

      const payrollRecordsData = calculationResults.map(record => ({
        ...record,
        batchId: batch.id,
      }));

      await tx.payrollRecord.createMany({
        data: payrollRecordsData,
      });

      return batch;
    });

    res.status(200).json({ message: 'Payroll calculated successfully', batch: result });

  } catch (error) {
    console.error('!!! Calculation Error !!!:', error);
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
}
