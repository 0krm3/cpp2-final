import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { PayrollRecord, Employee, PayrollBatch } from '../../types';
import { formatCurrency } from '../../utils/payrollCalculations';

interface ReportsViewProps {
  payrollRecords: PayrollRecord[];
  payrollBatches: PayrollBatch[];
  employees: Employee[];
}

const ReportsView: React.FC<ReportsViewProps> = ({
  payrollRecords,
  payrollBatches,
  employees
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportType, setReportType] = useState<'monthly' | 'department' | 'yearly'>('monthly');

  // 年間データの集計
  const yearlyData = useMemo(() => {
    const yearRecords = payrollRecords.filter(record => record.year === selectedYear);
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthRecords = yearRecords.filter(record => parseInt(record.month) === month);
      
      return {
        month,
        employees: monthRecords.length,
        grossPay: monthRecords.reduce((sum, r) => sum + r.grossPay, 0),
        deductions: monthRecords.reduce((sum, r) => sum + r.totalDeductions, 0),
        netPay: monthRecords.reduce((sum, r) => sum + r.netPay, 0)
      };
    });

    return monthlyData;
  }, [payrollRecords, selectedYear]);

  // 部署別データの集計
  const departmentData = useMemo(() => {
    const yearRecords = payrollRecords.filter(record => record.year === selectedYear);
    const departmentMap = new Map<string, {
      employees: Set<string>;
      grossPay: number;
      deductions: number;
      netPay: number;
    }>();

    yearRecords.forEach(record => {
      const employee = employees.find(emp => emp.id === record.employeeId);
      if (!employee) return;

      const dept = employee.department;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          employees: new Set(),
          grossPay: 0,
          deductions: 0,
          netPay: 0
        });
      }

      const deptData = departmentMap.get(dept)!;
      deptData.employees.add(record.employeeId);
      deptData.grossPay += record.grossPay;
      deptData.deductions += record.totalDeductions;
      deptData.netPay += record.netPay;
    });

    return Array.from(departmentMap.entries()).map(([dept, data]) => ({
      department: dept,
      employees: data.employees.size,
      grossPay: data.grossPay,
      deductions: data.deductions,
      netPay: data.netPay,
      avgSalary: data.grossPay / data.employees.size || 0
    }));
  }, [payrollRecords, employees, selectedYear]);

  const exportReport = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'monthly') {
      csvContent = [
        '月,従業員数,支給総額,控除総額,差引支給額',
        ...yearlyData.map(data => 
          `${data.month}月,${data.employees},${data.grossPay},${data.deductions},${data.netPay}`
        )
      ].join('\n');
      filename = `月次レポート_${selectedYear}年.csv`;
    } else if (reportType === 'department') {
      csvContent = [
        '部署,従業員数,支給総額,控除総額,差引支給額,平均給与',
        ...departmentData.map(data => 
          `${data.department},${data.employees},${data.grossPay},${data.deductions},${data.netPay},${Math.round(data.avgSalary)}`
        )
      ].join('\n');
      filename = `部署別レポート_${selectedYear}年.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalYearlyGross = yearlyData.reduce((sum, data) => sum + data.grossPay, 0);
  const totalYearlyNet = yearlyData.reduce((sum, data) => sum + data.netPay, 0);
  const totalYearlyDeductions = yearlyData.reduce((sum, data) => sum + data.deductions, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">レポート</h2>
          <p className="text-gray-600">給与計算の分析とレポート出力</p>
        </div>
        
        <button
          onClick={exportReport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV出力
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対象年
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
                レポート種類
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'monthly' | 'department' | 'yearly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">月次レポート</option>
                <option value="department">部署別レポート</option>
                <option value="yearly">年間サマリー</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 年間サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">年間支給総額</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalYearlyGross)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">年間控除総額</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalYearlyDeductions)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">年間差引支給額</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalYearlyNet)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* レポート内容 */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {reportType === 'monthly' && '月次推移'}
            {reportType === 'department' && '部署別集計'}
            {reportType === 'yearly' && '年間詳細'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {reportType === 'monthly' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    月
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    従業員数
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支給総額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    控除総額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    差引支給額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {yearlyData.map((data) => (
                  <tr key={data.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.month}月
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {data.employees}名
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(data.grossPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                      -{formatCurrency(data.deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-700">
                      {formatCurrency(data.netPay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'department' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    部署
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    従業員数
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支給総額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均給与
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    差引支給額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.map((data) => (
                  <tr key={data.department} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {data.employees}名
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(data.grossPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(data.avgSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-700">
                      {formatCurrency(data.netPay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {((reportType === 'monthly' && yearlyData.every(d => d.employees === 0)) ||
          (reportType === 'department' && departmentData.length === 0)) && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">選択した期間のデータがありません</p>
            <p className="text-sm text-gray-400">給与計算を実行してからレポートを確認してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;