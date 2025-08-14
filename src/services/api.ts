import axios from 'axios';
import { Employee, CompanySettings, PayrollBatch, PayrollRecord } from '../types';

// APIのベースとなるURLを設定
const apiClient = axios.create({
  baseURL: '/api',
});

// リクエストのたびにトークンをヘッダーに付与する設定
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// --- 認証関連のAPI ---
export const login = (data: {email: string, password: string}) => apiClient.post('/auth/login', data);

export const getMe = () => apiClient.get('/auth/me');


// --- 従業員関連のAPI ---
export const getEmployees = () => apiClient.get<Employee[]>('/employees');

export const createEmployee = (employeeData: Omit<Employee, 'id'>) => 
  apiClient.post<Employee>('/employees', employeeData);

export const updateEmployee = (id: string, employeeData: Partial<Employee>) => 
  apiClient.put<Employee>(`/employees/${id}`, employeeData);

export const deleteEmployee = (id: string) => 
  apiClient.delete(`/employees/${id}`);

export const bulkUploadEmployees = (formData: FormData) => 
  apiClient.post('/employees/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// --- 給与計算関連のAPI ---
export const getPayrollBatches = () => apiClient.get<PayrollBatch[]>('/payroll/batches');

export const getPayrollRecordsByBatch = (batchId: string) => 
  apiClient.get<PayrollRecord[]>(`/payroll/batches/${batchId}`);

export const calculatePayroll = (year: number, month: string) => 
  apiClient.post('/payroll/calculate', { year, month });

export const approvePayrollBatch = (batchId: string) => 
  apiClient.put(`/payroll/batches/${batchId}/approve`);

// --- 会社設定関連のAPI ---
export const getSettings = () => apiClient.get<CompanySettings>('/settings');

export const updateSettings = (settingsData: Partial<CompanySettings>) => 
  apiClient.put<CompanySettings>('/settings', settingsData);

export default apiClient;
