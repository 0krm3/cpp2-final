import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseCSV, convertCSVToEmployee, CSVEmployee } from '../../utils/csvParser';
import { Employee } from '../../types';
import { formatCurrency } from '@/utils/payrollCalculations';

interface CSVUploaderProps {
  onUpload: (file: File) => void;
  onCancel: () => void;
  existingEmployees: Employee[];
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload, onCancel, existingEmployees }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewEmployees, setPreviewEmployees] = useState<Employee[]>([]);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [updateSummary, setUpdateSummary] = useState<{
    new: Employee[];
    updated: Employee[];
    unchanged: Employee[];
  }>({ new: [], updated: [], unchanged: [] });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('CSVファイルを選択してください');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSV(csvText);
        const employees = parsedData.map(convertCSVToEmployee);
        
        setPreviewEmployees(employees);
        setStep('preview');
        
        // 更新内容の分析
        analyzeCsvUpdates(employees);
      } catch (error) {
        alert('CSVファイルの読み込みに失敗しました。形式を確認してください。');
        console.error(error);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const analyzeCsvUpdates = (newEmployees: Employee[]) => {
    const summary = {
      new: [] as Employee[],
      updated: [] as Employee[],
      unchanged: [] as Employee[]
    };

    newEmployees.forEach(newEmp => {
      const existing = existingEmployees.find(emp => emp.id === newEmp.id);
      
      if (!existing) {
        summary.new.push(newEmp);
      } else {
        // 全ての項目をチェックして変更があったか判断
        const isChanged = (
          existing.name !== newEmp.name ||
          existing.dateOfBirth !== newEmp.dateOfBirth ||
          existing.email !== newEmp.email ||
          existing.department !== newEmp.department ||
          existing.position !== newEmp.position ||
          existing.baseSalary !== newEmp.baseSalary ||
          existing.dependents !== newEmp.dependents ||
          existing.municipality !== newEmp.municipality ||
          existing.joinDate !== newEmp.joinDate
        );
        
        if (isChanged) {
          summary.updated.push(newEmp);
        } else {
          summary.unchanged.push(newEmp);
        }
      }
    });

    setUpdateSummary(summary);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleConfirmUpload = () => {

    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const sampleCsv = `ID,氏名,生年月日,メールアドレス,部署,役職,基本給,扶養人数,居住地,入社日
12345,田中太郎,1997-02-18,tanaka@company.com,営業部,営業主任,400000,1,東京都,2023-01-15
23456,佐藤花子,2003-11-21,sato@company.com,経理部,経理担当,350000,0,東京都,2022-06-01
34567,山田健一,1980-08-07,yamada@company.com,開発部,システムエンジニア,450000,2,東京都,2022-09-01`;

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'サンプル従業員データ.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">CSVデータプレビュー</h2>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">新規登録</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">{updateSummary.new.length}件</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">更新</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 mt-1">{updateSummary.updated.length}件</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-800">変更なし</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{updateSummary.unchanged.length}件</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">氏名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">生年月日</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メールアドレス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部署</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役職</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基本給</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">扶養人数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">居住地</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入社日</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewEmployees.map((employee) => {
                    const isNew = updateSummary.new.find(emp => emp.id === employee.id);
                    const isUpdated = updateSummary.updated.find(emp => emp.id === employee.id);
                    
                    return (
                      <tr key={employee.id} className={ isNew ? 'bg-green-50' : isUpdated ? 'bg-orange-50' : '' }>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            isNew ? 'bg-green-100 text-green-800' :
                            isUpdated ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {isNew ? '新規' : isUpdated ? '更新' : '変更なし'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.dateOfBirth}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(employee.baseSalary)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.dependents}人</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.municipality}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.joinDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                戻る
              </button>

              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                アップロード実行
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">CSV一括アップロード</h2>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">CSVファイル形式</h3>
            <p className="text-sm text-gray-600 mb-4">
              以下の形式でCSVファイルを作成してください。IDが既存の従業員と一致する場合は更新され、新しいIDの場合は新規登録されます。
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <pre className="text-sm text-gray-800 font-mono">
                {sampleCsv}
              </pre>
            </div>
            
            <button
              onClick={downloadSample}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              サンプルCSVダウンロード
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="mt-4">
              <p className="text-lg text-gray-600">
                CSVファイルをここにドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-500 mt-1">または</p>
              <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                ファイルを選択
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">アップロード時の注意事項:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>IDが既存の従業員と一致する場合、そのデータは上書きされます</li>
                  <li>新しいIDの従業員は新規として追加されます</li>
                  <li>CSVに含まれていない既存従業員のデータは保持されます</li>
                  <li>文字コードはUTF-8で保存してください</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2 inline" />
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
