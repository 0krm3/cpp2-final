import { Employee } from '../types';

export interface CSVEmployee {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  dependents: number;
  joinDate: string;
  municipality: string;
}

export const parseCSV = (csvText: string): CSVEmployee[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const employee: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      switch (header) {
        case 'ID':
          employee.id = value;
          break;
        case '氏名':
          employee.name = value;
          break;
        case '生年月日':
          employee.dateOfBirth = value;
          break;
        case 'メールアドレス':
          employee.email = value;
          break;
        case '部署':
          employee.department = value;
          break;
        case '役職':
          employee.position = value;
          break;
        case '基本給':
          employee.baseSalary = parseInt(value) || 0;
          break;
        case '扶養人数':
          employee.dependents = parseInt(value) || 0;
          break;
        case '居住地':
          employee.municipality = value;
          break;
        case '入社日':
          employee.joinDate = value;
          break;
      }
    });
    
    return employee as CSVEmployee;
  });
};

export const convertCSVToEmployee = (csvEmployee: CSVEmployee): Employee => {
  return {
    id: csvEmployee.id,
    name: csvEmployee.name,
    dateOfBirth: csvEmployee.dateOfBirth,
    email: csvEmployee.email,
    department: csvEmployee.department,
    position: csvEmployee.position,
    baseSalary: csvEmployee.baseSalary,
    dependents: csvEmployee.dependents,
    municipality: csvEmployee.municipality,
    joinDate: csvEmployee.joinDate,
    isActive: true
  };
};