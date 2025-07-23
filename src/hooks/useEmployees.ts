import { useState, useEffect } from 'react';
import { Employee } from '../types';

const mockEmployees: Employee[] = [
  {
    id: '12345',
    name: '田中太郎',
    email: 'tanaka@company.com',
    department: '営業部',
    baseSalary: 400000,
    dependents: 1,
    municipality: '東京都',
    joinDate: '2023-01-15',
    position: '営業主任',
    isActive: true
  },
  {
    id: '23456',
    name: '佐藤花子',
    email: 'sato@company.com',
    department: '経理部',
    baseSalary: 350000,
    dependents: 0,
    municipality: '東京都',
    joinDate: '2022-06-01',
    position: '経理担当',
    isActive: true
  },
  {
    id: '34567',
    name: '山田健一',
    email: 'yamada@company.com',
    department: '開発部',
    baseSalary: 480000,
    dependents: 2,
    municipality: '神奈川県',
    joinDate: '2021-04-01',
    position: 'シニアエンジニア',
    isActive: true
  },
  {
    id: '45678',
    name: '鈴木美咲',
    email: 'suzuki@company.com',
    department: '人事部',
    baseSalary: 380000,
    dependents: 1,
    municipality: '埼玉県',
    joinDate: '2023-03-15',
    position: '人事担当',
    isActive: true
  },
  {
    id: '56789',
    name: '渡辺誠',
    email: 'watanabe@company.com',
    department: '営業部',
    baseSalary: 320000,
    dependents: 0,
    municipality: '千葉県',
    joinDate: '2024-01-10',
    position: '営業アシスタント',
    isActive: true
  },
  {
    id: '67890',
    name: '伊藤麻衣',
    email: 'ito@company.com',
    department: '開発部',
    baseSalary: 420000,
    dependents: 0,
    municipality: '東京都',
    joinDate: '2022-09-01',
    position: 'フロントエンドエンジニア',
    isActive: true
  }
];

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // シミュレート: ローカルストレージから従業員データを読み込み
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees(mockEmployees);
      localStorage.setItem('employees', JSON.stringify(mockEmployees));
    }
    setLoading(false);
  }, []);

  const addEmployee = (employee: Employee) => {
    const updatedEmployees = [...employees, employee];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const updateEmployee = (id: string, updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id ? updatedEmployee : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const deleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const bulkUpdateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem('employees', JSON.stringify(newEmployees));
  };

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    bulkUpdateEmployees
  };
};