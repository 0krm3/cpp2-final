import { useState, useEffect } from 'react';
import { CompanySettings } from '../types';

const defaultSettings: CompanySettings = {
  companyName: '株式会社サンプル',
  companyAddress: '東京都渋谷区1-1-1',
  taxOffice: '渋谷税務署',
  socialInsuranceOffice: '渋谷年金事務所',
  employmentInsuranceNumber: '13-123456-7',
  healthInsuranceRate: 0.0495,
  pensionInsuranceRate: 0.0915,
  employmentInsuranceRate: 0.006,
  paymentDate: 25,
  closingDate: 20
};

export const useSettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSettings = localStorage.getItem('companySettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
    setLoading(false);
  }, []);

  const updateSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    localStorage.setItem('companySettings', JSON.stringify(newSettings));
  };

  return {
    settings,
    loading,
    updateSettings
  };
};