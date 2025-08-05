import { Employee, PayrollCalculation } from '../types';

// 所得税率（簡略化）
const getIncomeTaxRate = (income: number, dependents: number): number => {
  const taxableIncome = income - (dependents * 38000); // 扶養控除簡略化
  if (taxableIncome <= 1950000) return 0.05;
  if (taxableIncome <= 3300000) return 0.10;
  if (taxableIncome <= 6950000) return 0.20;
  return 0.23;
};

// 住民税計算（簡略化）
const calculateResidentTax = (annualIncome: number, dependents: number): number => {
  const taxableIncome = annualIncome - (dependents * 33000); // 扶養控除
  const basicDeduction = 430000; // 基礎控除
  const adjustedIncome = Math.max(0, taxableIncome - basicDeduction);
  
  // 住民税率 10%（都道府県民税4% + 市町村民税6%）
  const annualTax = Math.floor(adjustedIncome * 0.10);
  return Math.floor(annualTax / 12); // 月割り
};

// 雇用保険料率
const EMPLOYMENT_INSURANCE_RATE = 0.006;

// 健康保険料率（簡略化）
const HEALTH_INSURANCE_RATE = 0.0495;

// 厚生年金保険料率
const PENSION_INSURANCE_RATE = 0.0915;

export const calculatePayroll = (
  employee: Employee,
  baseSalary: number,
  overtime: number = 0,
  bonus: number = 0
): PayrollCalculation => {
  const grossPay = baseSalary + overtime + bonus;
  
  // 各種控除計算
  const incomeTax = Math.floor(grossPay * getIncomeTaxRate(grossPay * 12, employee.dependents));
  const residentTax = calculateResidentTax(grossPay * 12, employee.dependents);
  const employeeInsurance = Math.floor(grossPay * EMPLOYMENT_INSURANCE_RATE);
  const healthInsurance = Math.floor(grossPay * HEALTH_INSURANCE_RATE);
  const pensionInsurance = Math.floor(grossPay * PENSION_INSURANCE_RATE);
  
  const totalDeductions = incomeTax + residentTax + employeeInsurance + healthInsurance + pensionInsurance;
  const netPay = grossPay - totalDeductions;

  return {
    grossPay,
    incomeTax,
    residentTax,
    employeeInsurance,
    healthInsurance,
    pensionInsurance,
    totalDeductions,
    netPay
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount);
};