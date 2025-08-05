import React from 'react';
import { FileText, Download, User } from 'lucide-react';
import { Employee, PayrollRecord } from '../../types';
import { formatCurrency } from '../../utils/payrollCalculations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PayslipViewProps {
  employee: Employee;
  payrollRecords: PayrollRecord[];
}

const PayslipView: React.FC<PayslipViewProps> = ({ employee, payrollRecords }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedPeriod, setSelectedPeriod] = React.useState(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`);

  // 従業員の給与記録を取得
  const employeeRecords = payrollRecords.filter(record => record.employeeId === employee.id);
  
  // 選択された期間の給与記録を取得
  const [selectedYear, selectedMonth] = selectedPeriod.split('-');
  const currentPayroll = employeeRecords.find(
    record => record.year === parseInt(selectedYear) && record.month === selectedMonth.replace(/^0/, '')
  );

  // 利用可能な期間のリストを作成
  const availablePeriods = employeeRecords
    .map(record => ({
      value: `${record.year}-${record.month.padStart(2, '0')}`,
      label: `${record.year}年${record.month}月`
    }))
    .sort((a, b) => b.value.localeCompare(a.value));

  const handleDownload = async () => {
    if (!currentPayroll) {
      alert('選択された期間の給与明細が見つかりません');
      return;
    }

    try {
      const element = document.getElementById('payslip-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`給与明細_${employee.name}_${currentPayroll.year}年${currentPayroll.month}月.pdf`);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成中にエラーが発生しました');
    }
  };

  if (!currentPayroll) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">給与明細書</h2>
          <p className="text-gray-600">給与明細の履歴</p>
        </div>

        {availablePeriods.length > 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">利用可能な給与明細</h3>
            <div className="space-y-2">
              {availablePeriods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">給与明細がまだ作成されていません</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">給与明細書</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availablePeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          PDF版ダウンロード
        </button>
      </div>

      <div id="payslip-content" className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                  <span className="font-medium">{formatCurrency(currentPayroll.baseSalary)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">時間外手当</span>
                  <span className="font-medium">{formatCurrency(currentPayroll.overtime)}</span>
                </div>
                {currentPayroll.bonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">賞与</span>
                    <span className="font-medium">{formatCurrency(currentPayroll.bonus)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">支給合計</span>
                  <span className="text-lg">{formatCurrency(currentPayroll.grossPay)}</span>
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
                  <span className="font-medium text-red-600">-{formatCurrency(currentPayroll.incomeTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">住民税</span>
                  <span className="font-medium text-red-600">-{formatCurrency(currentPayroll.residentTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">雇用保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(currentPayroll.employeeInsurance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">健康保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(currentPayroll.healthInsurance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">厚生年金保険料</span>
                  <span className="font-medium text-red-600">-{formatCurrency(currentPayroll.pensionInsurance)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">控除合計</span>
                  <span className="text-lg text-red-600">-{formatCurrency(currentPayroll.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 差引支給額 */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">差引支給額</span>
                <span className="text-3xl font-bold text-blue-700">{formatCurrency(currentPayroll.netPay)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                支給額 {formatCurrency(currentPayroll.grossPay)} - 控除額 {formatCurrency(currentPayroll.totalDeductions)}
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
                <span className="font-medium">作成日:</span> {new Date(currentPayroll.createdAt).toLocaleDateString('ja-JP')}
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