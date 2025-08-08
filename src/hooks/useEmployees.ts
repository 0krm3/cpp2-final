import { useState, useEffect } from 'react';
import { Employee } from '../types';

const mockEmployees: Employee[] = [
  {
    id: '12345',
    name: '田中太郎',
    dateOfBirth: '1990-01-01',
    email: 'tanaka@company.com',
    department: '営業部',
    baseSalary: 400000,
    dependents: 1,
    municipality: '東京都',
    joinDate: '2023-01-15',
    position: '営業主任',
    isActive: true
  },
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