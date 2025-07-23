import React from 'react';
import { FileText, Download, User } from 'lucide-react';
import { Employee, PayrollRecord } from '../../types';
import { formatCurrency } from '../../utils/payrollCalculations';

interface PayslipViewProps {
  employee: Employee;
  payrollRecord?: PayrollRecord;
}

const PayslipView: React.FC<PayslipViewProps> = ({ employee, payrollRecord }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // モックの給与データ（実際のアプリでは適切なデータを使用）
  const mockPayroll = payrollRecord || {
    id: '1',
    employeeId: employee.id,
    month: `${currentMonth}`,
    year: currentYear,
    baseSalary: employee.baseSalary,
    overtime: 15000,
    bonus: 0,
    grossPay: employee.baseSalary + 15000,
    incomeTax: Math.floor((employee.baseSalary + 15000) * 0.08),
    employeeInsurance: Math.floor((employee.baseSalary + 15000) * 0.006),
    healthInsurance: Math.floor((employee.baseSalary + 15000) * 0.0495),
    pensionInsurance: Math.floor((employee.baseSalary + 15000) * 0.0915),
    totalDeductions: 0,
    netPay: 0,
    createdAt: new Date().toISOString()
  };

  mockPayroll.totalDeductions = mockPayroll.incomeTax + mockPayroll.employeeInsurance + mockPayroll.healthInsurance + mockPayroll.pensionInsurance;
  mockPayroll.netPay = mockPayroll.grossPay - mockPayroll.totalDeductions;

  const handleDownload = () => {
    // 実際のアプリではPDF生成ライブラリを使用
    alert('PDF版給与明細のダウンロード機能です（デモ版では未実装）');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">給与明細書</h2>
          <p className="text-gray-600">{mockPayroll.year}年{mockPayroll.month}月分</p>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          PDF版ダウンロード
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* ヘッダー情報 */}
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">従業員ID: {employee.id} | {employee.department} | {employee.position}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 支給項目 */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                支給項目
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">基本給</span>
                  <span className="font-medium">{formatCurrency(mockPayroll.baseSalary)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">時間外手当</span>
                  <span className="font-medium">{formatCurrency(mockPayroll.overtime)}</span>
                </div>
                {mockPayroll.bonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">賞与</span>
                    <span className="font-medium">{formatCurrency(mockPayroll.bonus)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">支給合計</span>
                  <span className="text-lg">{formatCurrency(mockPayroll.grossPay)}</span>
                </div>
              </div>
            </div>

            {/* 控除項目 */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                控除項目
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">所得税</span>
                  <span className="font-medium text-red-600">-{formatCurrency(mockPayroll.incomeTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">雇用保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(mockPayroll.employeeInsurance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">健康保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(mockPayroll.healthInsurance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">厚生年金保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(mockPayroll.pensionInsurance)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">控除合計</span>
                  <span className="text-lg text-red-600">-{formatCurrency(mockPayroll.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 差引支給額 */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">差引支給額</span>
                <span className="text-3xl font-bold text-blue-700">{formatCurrency(mockPayroll.netPay)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                支給額 {formatCurrency(mockPayroll.grossPay)} - 控除額 {formatCurrency(mockPayroll.totalDeductions)}
              </p>
            </div>
          </div>

          {/* 備考・詳細情報 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-3">詳細情報</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">扶養人数:</span> {employee.dependents}人
              </div>
              <div>
                <span className="font-medium">居住地:</span> {employee.municipality}
              </div>
              <div>
                <span className="font-medium">作成日:</span> {new Date(mockPayroll.createdAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">重要なお知らせ</p>
                <p>この給与明細書は大切に保管してください。年末調整や確定申告の際に必要となる場合があります。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipView;