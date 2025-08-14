import React, { useState } from 'react';
import { Save, Building2, FileText, Calculator, AlertTriangle } from 'lucide-react';
import { CompanySettings } from '../../types';

// onSaveが非同期関数であることを明示
interface SettingsViewProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => Promise<void>; 
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [activeTab, setActiveTab] = useState<'company' | 'payroll' | 'tax'>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(''); // 新しい保存処理の前にメッセージをクリア

    try {
      await onSave(formData);
      setSaveMessage('設定が正常に保存されました！');
    } catch (err) {
      setSaveMessage('設定の保存中にエラーが発生しました。');
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'company', name: '会社情報', icon: Building2 },
    { id: 'payroll', name: '給与設定', icon: Calculator },
    { id: 'tax', name: '税・保険料設定', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">設定</h2>
          <p className="text-gray-600">システムの基本設定と給与計算パラメータ</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      {saveMessage && (
        <div className={`bg-${saveMessage.includes('エラー') ? 'red' : 'green'}-50 border border-${saveMessage.includes('エラー') ? 'red' : 'green'}-200 rounded-md p-4`}>
          <p className="text-sm text-green-700">{saveMessage}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2 inline" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">会社基本情報</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="株式会社サンプル"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    雇用保険番号
                  </label>
                  <input
                    type="text"
                    value={formData.employmentInsuranceNumber}
                    onChange={(e) => handleChange('employmentInsuranceNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="13-123456-7"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社住所 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyAddress}
                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="東京都渋谷区1-1-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管轄税務署
                  </label>
                  <input
                    type="text"
                    value={formData.taxOffice}
                    onChange={(e) => handleChange('taxOffice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="渋谷税務署"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管轄年金事務所
                  </label>
                  <input
                    type="text"
                    value={formData.socialInsuranceOffice}
                    onChange={(e) => handleChange('socialInsuranceOffice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="渋谷年金事務所"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">給与支払設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    給与締日
                  </label>
                  <select
                    value={formData.closingDate}
                    onChange={(e) => handleChange('closingDate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}日</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    給与計算の対象期間の終了日
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    給与支払日
                  </label>
                  <select
                    value={formData.paymentDate}
                    onChange={(e) => handleChange('paymentDate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}日</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    給与の振込日
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">給与計算スケジュール</p>
                    <p className="mt-1">
                      毎月{formData.closingDate}日締め、{formData.paymentDate}日支払いで給与計算が行われます。
                      締日と支払日の設定変更は次回の給与計算から適用されます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">税・保険料率設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    健康保険料率 (%)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.healthInsuranceRate * 100}
                    onChange={(e) => handleChange('healthInsuranceRate', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    現在: {(formData.healthInsuranceRate * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    厚生年金保険料率 (%)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.pensionInsuranceRate * 100}
                    onChange={(e) => handleChange('pensionInsuranceRate', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    現在: {(formData.pensionInsuranceRate * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    雇用保険料率 (%)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.employmentInsuranceRate * 100}
                    onChange={(e) => handleChange('employmentInsuranceRate', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    現在: {(formData.employmentInsuranceRate * 100).toFixed(3)}%
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">保険料率変更時の注意</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>保険料率の変更は次回の給与計算から適用されます</li>
                      <li>過去の給与計算結果には影響しません</li>
                      <li>法定料率の変更時は速やかに更新してください</li>
                      <li>料率変更前に既存データのバックアップを推奨します</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">2025年度 法定料率（参考）</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">健康保険料:</span> 4.95%
                  </div>
                  <div>
                    <span className="font-medium">厚生年金保険料:</span> 9.15%
                  </div>
                  <div>
                    <span className="font-medium">雇用保険料:</span> 0.6%
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ※ 実際の料率は管轄の年金事務所・ハローワークにご確認ください
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;