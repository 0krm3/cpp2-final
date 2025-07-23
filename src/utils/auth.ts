import { User } from '../types';

// Mock authentication - in real app, this would connect to backend
export const mockUsers: User[] = [
  {
    id: 'admin1',
    email: 'admin@company.com',
    name: '管理者',
    role: 'admin'
  },
  {
    id: 'emp1',
    email: 'tanaka@company.com',
    name: '田中太郎',
    role: 'employee',
    employeeId: '12345'
  },
  {
    id: 'emp2',
    email: 'sato@company.com',
    name: '佐藤花子',
    role: 'employee',
    employeeId: '23456'
  },
  {
    id: 'emp3',
    email: 'yamada@company.com',
    name: '山田健一',
    role: 'employee',
    employeeId: '34567'
  },
  {
    id: 'emp4',
    email: 'suzuki@company.com',
    name: '鈴木美咲',
    role: 'employee',
    employeeId: '45678'
  },
  {
    id: 'emp5',
    email: 'watanabe@company.com',
    name: '渡辺誠',
    role: 'employee',
    employeeId: '56789'
  },
  {
    id: 'emp6',
    email: 'ito@company.com',
    name: '伊藤麻衣',
    role: 'employee',
    employeeId: '67890'
  },
  {
    id: 'emp7',
    email: 'takahashi@company.com',
    name: '高橋雄一',
    role: 'employee',
    employeeId: '78901'
  },
  {
    id: 'emp8',
    email: 'nakamura@company.com',
    name: '中村由美',
    role: 'employee',
    employeeId: '89012'
  },
  {
    id: 'emp9',
    email: 'kobayashi@company.com',
    name: '小林大輔',
    role: 'employee',
    employeeId: '90123'
  },
  {
    id: 'emp10',
    email: 'matsumoto@company.com',
    name: '松本あかり',
    role: 'employee',
    employeeId: '01234'
  }
];

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const authenticateUser = (email: string, password: string): User | null => {
  // Mock authentication logic
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password') {
    return user;
  }
  return null;
};