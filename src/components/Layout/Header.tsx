import React from 'react';
import { LogOut, User, Building2 } from 'lucide-react';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Q-Mei</h1>
              <p className="text-xs text-gray-500">中小企業向けクラウドサービス</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user.name}</p>
                <p className="text-gray-500">{user.role === 'admin' ? '管理者' : '従業員'}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;