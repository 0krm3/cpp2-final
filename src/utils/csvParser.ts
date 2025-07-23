import { Employee } from '../types';

export interface CSVEmployee {
  id: string;
  name: string;
  department: string;
  baseSalary: number;
  dependents: number;
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
        case '名前':
          employee.name = value;
          break;
        case '部署':
          employee.department = value;
          break;
        case '給与額':
          employee.baseSalary = parseInt(value) || 0;
          break;
        case '扶養人数':
          employee.dependents = parseInt(value) || 0;
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
    email: `${csvEmployee.name.toLowerCase()}@company.com`,
    department: csvEmployee.department,
    baseSalary: csvEmployee.baseSalary,
    dependents: csvEmployee.dependents,
    municipality: '東京都',
    joinDate: new Date().toISOString().split('T')[0],
    position: 'スタッフ',
    isActive: true
  };
};