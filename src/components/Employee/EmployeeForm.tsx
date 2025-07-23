import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    id: '',
    name: '',
    email: '',
    department: '',
    baseSalary: 0,
    dependents: 0,
    municipality: '東京都',
    joinDate: '',
    position: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        department: '',
        baseSalary: 0,
        dependents: 0,
        municipality: '東京都',
        joinDate: new Date().toISOString().split('T')[0],
        position: '',
        isActive: true
      });
    }
  }, [employee]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id?.trim()) {
      newErrors.id = '従業員IDは必須です';
    }

    if (!formData.name?.trim()) {
      newErrors.name = '氏名は必須です';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.department?.trim()) {
      newErrors.department = '部署は必須です';
    }

    if (!formData.baseSalary || formData.baseSalary < 0) {
      newErrors.baseSalary = '基本給は0以上の数値を入力してください';
    }

    if (formData.dependents === undefined || formData.dependents < 0) {
      newErrors.dependents = '扶養人数は0以上の数値を入力してください';
    }

    if (!formData.joinDate) {
      newErrors.joinDate = '入社日は必須です';
    }

    if (!formData.position?.trim()) {
      newErrors.position = '役職は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData as Employee);
    }
  };

  const handleChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {employee ? '従業員情報編集' : '新規従業員登録'}
        </h2>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
                従業員ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="id"
                value={formData.id || ''}
                onChange={(e) => handleChange('id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.id ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12345"
              />
              {errors.id && <p className="mt-1 text-sm text-red-600">{errors.id}</p>}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="田中太郎"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="tanaka@company.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                部署 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="営業部"
              />
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                役職 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.position ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="営業主任"
              />
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
            </div>

            <div>
              <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700 mb-2">
                基本給 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="baseSalary"
                value={formData.baseSalary || ''}
                onChange={(e) => handleChange('baseSalary', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.baseSalary ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="400000"
              />
              {errors.baseSalary && <p className="mt-1 text-sm text-red-600">{errors.baseSalary}</p>}
            </div>

            <div>
              <label htmlFor="dependents" className="block text-sm font-medium text-gray-700 mb-2">
                扶養人数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="dependents"
                value={formData.dependents || ''}
                onChange={(e) => handleChange('dependents', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dependents ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.dependents && <p className="mt-1 text-sm text-red-600">{errors.dependents}</p>}
            </div>

            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-2">
                入社日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="joinDate"
                value={formData.joinDate || ''}
                onChange={(e) => handleChange('joinDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.joinDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.joinDate && <p className="mt-1 text-sm text-red-600">{errors.joinDate}</p>}
            </div>

            <div>
              <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-2">
                居住地（自治体）
              </label>
              <select
                id="municipality"
                value={formData.municipality || ''}
                onChange={(e) => handleChange('municipality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                雇用状態
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="true"
                    checked={formData.isActive === true}
                    onChange={() => handleChange('isActive', true)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  在籍
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="false"
                    checked={formData.isActive === false}
                    onChange={() => handleChange('isActive', false)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  退職
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-2 inline" />
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;