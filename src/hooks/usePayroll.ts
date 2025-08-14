import { useState, useEffect, useCallback } from 'react';
import { PayrollBatch, PayrollRecord } from '../types';
import * as api from '../services/api';

export const usePayroll = () => {
  const [payrollBatches, setPayrollBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPayrollBatches();
      setPayrollBatches(response.data);
    } catch (err) {
      setError('給与計算履歴の取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { // トークンがある時だけAPIを呼び出す
      fetchBatches();
    } else {
      // トークンがない場合はローディングを終了
      setLoading(false);
    }
  }, [fetchBatches]);

  const calculateMonthlyPayroll = async (year: number, month: string) => {
    try {
      await api.calculatePayroll(year, month);
      fetchBatches();
    } catch (err) {
      console.error('Failed to calculate payroll:', err);
      setError('給与計算の実行に失敗しました。');
    }
  };

  const approveBatch = async (batchId: string) => {
    try {
      await api.approvePayrollBatch(batchId);
      fetchBatches();
    } catch (err) {
      console.error('Failed to approve batch:', err);
      setError('バッチの承認に失敗しました。');
    }
  };

  const getRecordsByBatch = useCallback(async (batchId: string): Promise<PayrollRecord[]> => {
    try {
      const response = await api.getPayrollRecordsByBatch(batchId);
      return response.data; // stateを更新せず、データを直接returnする
    } catch (err) {
      console.error('Failed to get records by batch:', err);
      return []; // エラー時は空配列を返す
    }
  }, []);

  return {
    payrollBatches,
    loading,
    error,
    calculateMonthlyPayroll,
    approveBatch,
    getRecordsByBatch,
    refetchBatches: fetchBatches,
  };
};
