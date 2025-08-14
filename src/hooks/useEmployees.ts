import { useState, useEffect, useCallback } from 'react';
import { Employee } from '../types';
import * as api from '../services/api';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getEmployees();
      setEmployees(response.data);
    } catch (err) {
      setError('従業員データの取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  
  const addEmployee = async (employeeData: Employee) => {
  try {
    // APIに送るデータからidプロパティを確実に除外する
    console.log("3. [useEmployees] App.tsxから受け取ったデータ:", employeeData);
    const { id, ...dataToSend } = employeeData;
    console.log("4. [useEmployees] APIに送信する直前のデータ (ID削除後):", dataToSend);
    
    await api.createEmployee(dataToSend);
    fetchEmployees(); // データ再取得して画面を更新
  } catch (err) {
    console.error('Failed to add employee:', err);
  }
};

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      await api.updateEmployee(id, employeeData);
      fetchEmployees(); // データ再取得して画面を更新
    } catch (err) {
      console.error('Failed to update employee:', err);
      // TODO: ユーザーにエラーを通知する
    }
  };

  const deleteEmployee = async (id: string) => {
    if (window.confirm('本当にこの従業員を削除しますか？')) {
      try {
        await api.deleteEmployee(id);
        fetchEmployees(); // データ再取得して画面を更新
      } catch (err) {
        console.error('Failed to delete employee:', err);
        // TODO: ユーザーにエラーを通知する
      }
    }
  };
  
  const bulkUpdateEmployees = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file); // API側で'file'というキーを期待
    try {
      await api.bulkUploadEmployees(formData);
      fetchEmployees(); // データ再取得して画面を更新
    } catch (err) {
      console.error('Failed to bulk upload:', err);
      // TODO: ユーザーにエラーを通知する
    }
  };

  return { 
    employees, 
    loading, 
    error,
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    bulkUpdateEmployees,
    refetch: fetchEmployees // 手動で再取得するための関数
  };
};
