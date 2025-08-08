import { useState, useEffect } from 'react';
import { PayrollRecord, PayrollBatch, Employee } from '../types';
import { calculatePayroll } from '../utils/payrollCalculations';

export const usePayroll = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [payrollBatches, setPayrollBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージからデータを読み込み
    const storedRecords = localStorage.getItem('payrollRecords');
    const storedBatches = localStorage.getItem('payrollBatches');
    
    if (storedRecords) {
      setPayrollRecords(JSON.parse(storedRecords));
    }
    
    if (storedBatches) {
      setPayrollBatches(JSON.parse(storedBatches));
    }
    
    setLoading(false);
  }, []);

  const calculateMonthlyPayroll = (employees: Employee[], month: string, year: number) => {
    const batchId = `${year}-${month.padStart(2, '0')}`;
    
    // 各従業員の給与計算
    const records: PayrollRecord[] = employees
      .filter(emp => emp.isActive)
      .map(employee => {
        const calculation = calculatePayroll(employee, employee.baseSalary);
        
        return {
          id: `${batchId}-${employee.id}`,
          employeeId: employee.id,
          month,
          year,
          baseSalary: employee.baseSalary,
          overtime: 0,
          bonus: 0,
          grossPay: calculation.grossPay,
          incomeTax: calculation.incomeTax,
          residentTax: calculation.residentTax,
          employeeInsurance: calculation.employeeInsurance,
          healthInsurance: calculation.healthInsurance,
          longTermCareInsurance: calculation.longTermCareInsurance,
          pensionInsurance: calculation.pensionInsurance,
          totalSocialInsurance: calculation.totalSocialInsurance,
          totalDeductions: calculation.totalDeductions,
          netPay: calculation.netPay,
          createdAt: new Date().toISOString()
        };
      });

    // バッチ情報作成
    const batch: PayrollBatch = {
      id: batchId,
      month,
      year,
      status: 'calculated',
      totalEmployees: records.length,
      totalGrossPay: records.reduce((sum, r) => sum + r.grossPay, 0),
      totalDeductions: records.reduce((sum, r) => sum + r.totalDeductions, 0),
      totalNetPay: records.reduce((sum, r) => sum + r.netPay, 0),
      createdAt: new Date().toISOString(),
      calculatedAt: new Date().toISOString()
    };

    // 既存のレコードを更新または追加
    const updatedRecords = [
      ...payrollRecords.filter(r => !(r.month === month && r.year === year)),
      ...records
    ];
    
    const updatedBatches = [
      ...payrollBatches.filter(b => b.id !== batchId),
      batch
    ];

    setPayrollRecords(updatedRecords);
    setPayrollBatches(updatedBatches);
    
    localStorage.setItem('payrollRecords', JSON.stringify(updatedRecords));
    localStorage.setItem('payrollBatches', JSON.stringify(updatedBatches));

    return { records, batch };
  };

  const updatePayrollRecord = (recordId: string, updates: Partial<PayrollRecord>) => {
    const updatedRecords = payrollRecords.map(record =>
      record.id === recordId ? { ...record, ...updates } : record
    );
    
    setPayrollRecords(updatedRecords);
    localStorage.setItem('payrollRecords', JSON.stringify(updatedRecords));
  };

  const approveBatch = (batchId: string) => {
    const updatedBatches = payrollBatches.map(batch =>
      batch.id === batchId 
        ? { ...batch, status: 'approved' as const, approvedAt: new Date().toISOString() }
        : batch
    );
    
    setPayrollBatches(updatedBatches);
    localStorage.setItem('payrollBatches', JSON.stringify(updatedBatches));
  };

  const getRecordsByBatch = (batchId: string) => {
    return payrollRecords.filter(record => 
      `${record.year}-${record.month.padStart(2, '0')}` === batchId
    );
  };

  return {
    payrollRecords,
    payrollBatches,
    loading,
    calculateMonthlyPayroll,
    updatePayrollRecord,
    approveBatch,
    getRecordsByBatch
  };
};