import React from 'react';
import { Users, Calculator, FileText, Settings, BarChart3 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'admin' | 'employee';
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, userRole }) => {
  const adminTabs = [
    { id: 'dashboard', name: 'ダッシュボード', icon: BarChart3 },
    { id: 'employees', name: '従業員管理', icon: Users },
    { id: 'payroll', name: '給与計算', icon: Calculator },
    { id: 'reports', name: 'レポート', icon: FileText },
    { id: 'settings', name: '設定', icon: Settings }
  ];

  const employeeTabs = [
    { id: 'payslip', name: '給与明細', icon: FileText },
    { id: 'profile', name: '個人情報', icon: Users }
  ];

  const tabs = userRole === 'admin' ? adminTabs : employeeTabs;

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 min-h-screen w-50">
      <div className="p-4">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;