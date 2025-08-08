import React from 'react';
import { ArrowLeft, Download, User, DollarSign } from 'lucide-react';
import { PayrollRecord, Employee, PayrollBatch } from '../../types';
import { formatCurrency } from '../../utils/payrollCalculations';

interface PayrollDetailsProps {
  batch: PayrollBatch;
  records: PayrollRecord[];
  employees: Employee[];
  onBack: () => void;
}

const PayrollDetails: React.FC<PayrollDetailsProps> = ({
  batch,
  records,
  employees,
  onBack
}) => {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '不明';
  };

  const getEmployeeDepartment = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : '不明';
  };

  const exportPayrollData = () => {
    const csvContent = [
      '従業員ID,氏名,部署,基本給,時間外手当,支給総額,所得税,住民税,雇用保険料,健康保険料,介護保険料,厚生年金保険料,社会保険料,控除総額,差引支給額',
      ...records.map(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return [
          record.employeeId,
          employee?.name || '不明',
          employee?.department || '不明',
          record.baseSalary,
          record.overtime,
          record.grossPay,
          record.incomeTax,
          record.residentTax,
          record.employeeInsurance,
          record.healthInsurance,
          record.longTermCareInsurance,
          record.pensionInsurance,
          record.totalSocialInsurance,
          record.totalDeductions,
          record.netPay
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `給与計算結果_${batch.year}年${batch.month}月.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {batch.year}年{batch.month}月 給与計算詳細
            </h2>
            <p className="text-gray-600">
              計算日: {batch.calculatedAt ? new Date(batch.calculatedAt).toLocaleDateString('ja-JP') : '未計算'}
            </p>
          </div>
        </div>
        
        <button
          onClick={exportPayrollData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV出力
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">対象従業員</p>
              <p className="text-2xl font-bold text-gray-900">{batch.totalEmployees}名</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">支給総額</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(batch.totalGrossPay)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">控除総額</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(batch.totalDeductions)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">差引支給額</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(batch.totalNetPay)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細テーブル */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">従業員別給与計算結果</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  従業員
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  基本給
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時間外手当
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支給総額
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所得税
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住民税
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  雇用保険料
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  健康保険料
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  介護保険料
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  厚生年金保険料
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  社会保険料
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  控除総額
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  差引支給額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => {
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getEmployeeName(record.employeeId)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getEmployeeDepartment(record.employeeId)}
                        </p>
                        <p className="text-xs text-gray-400">ID: {record.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(record.baseSalary)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(record.overtime)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(record.grossPay)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.incomeTax)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.residentTax)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.employeeInsurance)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.healthInsurance)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.longTermCareInsurance)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.pensionInsurance)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(record.totalSocialInsurance)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                      -{formatCurrency(record.totalDeductions)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-700">
                      {formatCurrency(record.netPay)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetails;