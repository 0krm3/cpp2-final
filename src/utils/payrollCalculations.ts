import { Employee, PayrollCalculation } from '../types';

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
const calculateAge = (dateOfBirthString: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirthString);
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
  
  // 住民税率 10%（都道府県民税4% + 市町村民税6%）
  const annualTax = Math.floor(adjustedIncome * 0.10);
  return Math.floor(annualTax / 12); // 月割り
};

export const calculatePayroll = (
  employee: Employee,
  baseSalary: number,
  overtime: number = 0,
  bonus: number = 0
): PayrollCalculation => {
  const grossPay = baseSalary + overtime + bonus;
  const employeeInsurance = Math.floor(grossPay * EMPLOYMENT_INSURANCE_RATE);
  const healthInsurance = Math.floor(grossPay * HEALTH_INSURANCE_RATE);

  // 生年月日から減税の年齢を計算
  const currentAge = calculateAge(employee.dateOfBirth);

  // 介護保険料の計算
  let longTermCareInsurance = 0;
  if (currentAge >= 40 && currentAge < 65) {
    longTermCareInsurance = Math.floor(grossPay * LONG_TERM_CARE_INSURANCE_RATE);
  }
  
  const pensionInsurance = Math.floor(grossPay * PENSION_INSURANCE_RATE);

  const totalSocialInsurance = employeeInsurance + healthInsurance + pensionInsurance + longTermCareInsurance;

  // const incomeTax = Math.floor(grossPay * getIncomeTaxRate(grossPay * 12, employee.dependents));
  const incomeTax = getMonthlyIncomeTax(grossPay, totalSocialInsurance, employee.dependents);
  const residentTax = calculateResidentTax(grossPay * 12, employee.dependents);
  
  const totalDeductions = incomeTax + residentTax + totalSocialInsurance
  const netPay = grossPay - totalDeductions;

  return {
    grossPay,
    incomeTax,
    residentTax,
    employeeInsurance,
    healthInsurance,
    longTermCareInsurance,
    pensionInsurance,
    totalSocialInsurance,
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