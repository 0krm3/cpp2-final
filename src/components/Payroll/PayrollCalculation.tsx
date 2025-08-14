import React, { useState } from 'react';
import { Calculator, Users, DollarSign, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { Employee, PayrollBatch } from '../../types';
import { formatCurrency } from '@/utils/payrollCalculations';

interface PayrollCalculationProps {
  employees: Employee[];
  payrollBatches: PayrollBatch[];
  onCalculate: (month: string, year: number) => void;
  onApprove: (batchId: string) => void;
  onViewDetails: (batchId: string) => void;
}

const PayrollCalculation: React.FC<PayrollCalculationProps> = ({
  employees,
  payrollBatches,
  onCalculate,
  onApprove,
  onViewDetails
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);

  const activeEmployees = employees.filter(emp => emp.isActive);
  const currentBatchId = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
  const existingBatch = payrollBatches.find(batch => batch.id === currentBatchId);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // 計算処理のシミュレーション
    setTimeout(() => {
      onCalculate(selectedMonth.toString(), selectedYear);
      setIsCalculating(false);
    }, 2000);
  };

  const getStatusColor = (status: PayrollBatch['status']) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'calculated': return 'blue';
      case 'approved': return 'green';
      case 'paid': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusText = (status: PayrollBatch['status']) => {
    switch (status) {
      case 'draft': return '下書き';
      case 'calculated': return '計算済み';
      case 'approved': return '承認済み';
      case 'paid': return '支払済み';
      default: return '未処理';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">給与計算</h2>
        <p className="text-gray-600">月次給与の計算・承認・管理を行います</p>
      </div>

      {/* 計算実行セクション */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">新規給与計算</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                計算対象年
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                計算対象月
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCalculate}
                disabled={isCalculating || existingBatch?.status === 'approved'}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? '計算中...' : '給与計算実行'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">対象従業員</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{activeEmployees.length}名</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">予想支給総額</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {formatCurrency(activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0))}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">計算状態</span>
              </div>
              <p className="text-lg font-bold text-purple-900 mt-1">
                {existingBatch ? getStatusText(existingBatch.status) : '未計算'}
              </p>
            </div>
          </div>

          {existingBatch && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">
                    {selectedYear}年{selectedMonth}月分の給与計算は既に実行済みです
                  </p>
                  <p className="mt-1">
                    再計算を行うと既存のデータが上書きされます。承認済みの場合は再計算できません。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 給与計算履歴 */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">給与計算履歴</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  対象期間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  従業員数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支給総額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  控除総額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  差引支給額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollBatches
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {batch.year}年{batch.month}月
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(batch.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.totalEmployees}名
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(batch.totalGrossPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    -{formatCurrency(batch.totalDeductions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(batch.totalNetPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(batch.status)}-100 text-${getStatusColor(batch.status)}-800`}>
                      {getStatusText(batch.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onViewDetails(batch.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-150"
                      >
                        詳細
                      </button>
                      {batch.status === 'calculated' && (
                        <button
                          onClick={() => onApprove(batch.id)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors duration-150"
                        >
                          承認
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payrollBatches.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">まだ給与計算が実行されていません</p>
              <p className="text-sm text-gray-400">上記のフォームから給与計算を開始してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollCalculation;