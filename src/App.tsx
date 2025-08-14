import React, { useState, useEffect } from 'react';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import EmployeeList from './components/Employee/EmployeeList';
import EmployeeForm from './components/Employee/EmployeeForm';
import CSVUploader from './components/Employee/CSVUploader';
import PayslipView from './components/Payslip/PayslipView';
import PayrollCalculation from './components/Payroll/PayrollCalculation';
import PayrollDetails from './components/Payroll/PayrollDetails';
import ReportsView from './components/Reports/ReportsView';
import SettingsView from './components/Settings/SettingsView';
import { User, Employee, PayrollRecord } from './types';
import { login, getMe } from './services/api';
import { useEmployees } from './hooks/useEmployees';
import { usePayroll } from './hooks/usePayroll';
import { useSettings } from './hooks/useSettings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [detailRecords, setDetailRecords] = useState<PayrollRecord[]>([]);
  
  // 従業員用の給与明細を保存する専用のstateを追加
  const [employeePayslips, setEmployeePayslips] = useState<PayrollRecord[]>([]);

  const { employees, loading: employeesLoading, addEmployee, updateEmployee, deleteEmployee, bulkUpdateEmployees } = useEmployees();
  const { 
    payrollBatches, 
    loading: payrollLoading, 
    calculateMonthlyPayroll, 
    approveBatch, 
    getRecordsByBatch 
  } = usePayroll();
  const { settings, loading: settingsLoading, error: settingsError, updateSettings } = useSettings();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(response => {
          setUser(response.data);
          setActiveTab(response.data.role === 'admin' ? 'dashboard' : 'payslip');
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsAppLoading(false));
    } else {
      setIsAppLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (selectedBatchId) {
      const fetchDetails = async () => {
        const records = await getRecordsByBatch(selectedBatchId);
        setDetailRecords(records);
      };
      fetchDetails();
    } else {
      setDetailRecords([]);
    }
  }, [selectedBatchId, getRecordsByBatch]);

  // 従業員としてログインしており、給与バッチのデータが読み込めたら実行
  useEffect(() => {
    if (user?.role === 'employee' && payrollBatches.length > 0) {
      const fetchAllPayslips = async () => {
        // 全てのバッチに対するデータ取得処理（Promise）の配列を作成
        const promises = payrollBatches.map(batch => getRecordsByBatch(batch.id));
        // 全てのPromiseが完了するのを待つ
        const results = await Promise.all(promises);
        // 結果を一つの配列にまとめる
        const allRecords = results.flat();
        setEmployeePayslips(allRecords);
      };
      fetchAllPayslips();
    }
  }, [user, payrollBatches, getRecordsByBatch]);

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    try {
      const response = await login({ email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      const userResponse = await getMe();
      setUser(userResponse.data);
      setActiveTab(userResponse.data.role === 'admin' ? 'dashboard' : 'payslip');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'ログインに失敗しました。';
      setLoginError(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveTab('dashboard');
    setSelectedEmployee(null);
    setShowEmployeeForm(false);
    setShowCSVUploader(false);
  };
  
  const handleEmployeeSave = (employee: Employee) => {
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, employee);
    } else {
      addEmployee(employee);
    }
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
  };

  const handleEmployeeEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleEmployeeDelete = (id: string) => {
    deleteEmployee(id);
  };

  const handleEmployeeAdd = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleBulkUpload = () => {
    setShowCSVUploader(true);
  };

  const handleCSVUpload = (file: File) => {
    bulkUpdateEmployees(file);
    setShowCSVUploader(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowEmployeeForm(false);
    setShowCSVUploader(false);
    setSelectedEmployee(null);
    setSelectedBatchId(null);
  };

  const handlePayrollCalculate = (month: string, year: number) => {
    calculateMonthlyPayroll(year, month);
  };

  const handleBatchApprove = (batchId: string) => {
    approveBatch(batchId);
  };

  const handleViewBatchDetails = (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const handleBackFromDetails = () => {
    setSelectedBatchId(null);
  };

  if (isAppLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  const renderContent = () => {
    if (employeesLoading || payrollLoading || settingsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      );
    }
    
    if (settingsError) {
        return (
            <div className="text-center py-12 text-red-500">
                <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
                <p>{settingsError}</p>
            </div>
        );
    }

    if (user.role === 'admin') {
      if (selectedBatchId) {
        const batch = payrollBatches.find(b => b.id === selectedBatchId);
        if (batch) {
          return (
            <PayrollDetails
              batch={batch}
              records={detailRecords}
              employees={employees}
              onBack={handleBackFromDetails}
            />
          );
        }
      }

      if (showEmployeeForm) {
        return (
          <EmployeeForm
            employee={selectedEmployee || undefined}
            onSave={handleEmployeeSave}
            onCancel={() => {
              setShowEmployeeForm(false);
              setSelectedEmployee(null);
            }}
          />
        );
      }

      if (showCSVUploader) {
        return (
          <CSVUploader
            onUpload={handleCSVUpload}
            onCancel={() => setShowCSVUploader(false)}
            existingEmployees={employees}
          />
        );
      }

      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard employees={employees} />;
        
        case 'employees':
          return (
            <EmployeeList
              employees={employees}
              onEdit={handleEmployeeEdit}
              onDelete={handleEmployeeDelete}
              onAdd={handleEmployeeAdd}
              onBulkUpload={handleBulkUpload}
            />
          );

        case 'payroll':
          return (
            <PayrollCalculation
              employees={employees}
              payrollBatches={payrollBatches}
              onCalculate={handlePayrollCalculate}
              onApprove={handleBatchApprove}
              onViewDetails={handleViewBatchDetails}
            />
          );
        case 'reports':
          return (
            <ReportsView
              payrollRecords={detailRecords}
              payrollBatches={payrollBatches}
              employees={employees}
            />
          );
        case 'settings':
          if (settings) {
            return (
              <SettingsView
                settings={settings}
                onSave={updateSettings}
              />
            );
          }
          return null;
        default:
          return <AdminDashboard employees={employees} />;
      }
    } else {
      const currentEmployee = employees.find(emp => emp.email === user.email);
      
      if (!currentEmployee) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">従業員情報が見つかりません</p>
          </div>
        );
      }

      switch (activeTab) {
        case 'payslip':
          return (
            <PayslipView 
              employee={currentEmployee} 
              payrollRecords={employeePayslips}
            />
          );
        case 'profile':
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">個人情報</h2>
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">氏名</label>
                    <p className="mt-1 text-sm text-gray-900">{currentEmployee.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">従業員ID</label>
                    <p className="mt-1 text-sm text-gray-900">{currentEmployee.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">部署</label>
                    <p className="mt-1 text-sm text-gray-900">{currentEmployee.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">役職</label>
                    <p className="mt-1 text-sm text-gray-900">{currentEmployee.position}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <p className="mt-1 text-sm text-gray-900">{currentEmployee.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">入社日</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(currentEmployee.joinDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return (
            <PayslipView 
              employee={currentEmployee} 
              payrollRecords={employeePayslips}
            />
          );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="flex">
        {user && <Navigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          userRole={user.role} 
        />}
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
