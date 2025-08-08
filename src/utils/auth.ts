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