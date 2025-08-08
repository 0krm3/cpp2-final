export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  employeeId?: string;
}

export interface Employee {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  dependents: number;
  municipality: string;
  joinDate: string;
  isActive: boolean;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  overtime: number;
  bonus: number;
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
  createdAt: string;
}

export interface PayrollCalculation {
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

export interface PayrollBatch {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  createdAt: string;
  calculatedAt?: string;
  approvedAt?: string;
}

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  taxOffice: string;
  socialInsuranceOffice: string;
  employmentInsuranceNumber: string;
  healthInsuranceRate: number;
  pensionInsuranceRate: number;
  employmentInsuranceRate: number;
  paymentDate: number; // 支払日（月の何日）
  closingDate: number; // 締日（月の何日）
}

export interface PayrollReport {
  type: 'monthly' | 'yearly' | 'department';
  period: string;
  data: {
    totalEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    departmentBreakdown?: Record<string, {
      employees: number;
      grossPay: number;
      netPay: number;
    }>;
  };
}