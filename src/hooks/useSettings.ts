import { useState, useEffect, useCallback } from 'react';
import { CompanySettings } from '../types';
import * as api from '../services/api';

const initialSettings: CompanySettings = {
  companyName: '未設定の会社名',
  companyAddress: '',
  taxOffice: '',
  socialInsuranceOffice: '',
  employmentInsuranceNumber: '',
  healthInsuranceRate: 0.0,
  pensionInsuranceRate: 0.0,
  employmentInsuranceRate: 0.0,
  paymentDate: 25,
  closingDate: 15,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getSettings();
      setSettings(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSettings(initialSettings);
      } else {
        setError('設定情報の取得に失敗しました。');
        console.error('Error fetching settings:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [fetchSettings]);

  const updateSettings = async (newSettings: CompanySettings) => {
    try {
      const response = await api.updateSettings(newSettings);
      setSettings(response.data);
      alert('設定を更新しました。');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('設定の更新に失敗しました。');
    }
  };

  return { settings, loading, error, updateSettings };
};
