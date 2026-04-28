import { createContext, useContext } from "react";

export interface Employee {
  id: number;
  name: string;
  initials: string;
  role: string;
}

export const EMPLOYEES: Employee[] = [
  { id: 1, name: "James Smith", initials: "JS", role: "Administrator" },
  { id: 2, name: "Sara Ahmed", initials: "SA", role: "Agent" },
  { id: 3, name: "Mohamed Ali", initials: "MA", role: "Agent" },
  { id: 4, name: "Nadia Hassan", initials: "NH", role: "Agent" },
];

interface EmployeeContextValue {
  currentEmployee: Employee;
  employees: Employee[];
}

const EmployeeContext = createContext<EmployeeContextValue>({
  currentEmployee: EMPLOYEES[0]!,
  employees: EMPLOYEES,
});

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeContext.Provider value={{ currentEmployee: EMPLOYEES[0]!, employees: EMPLOYEES }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  return useContext(EmployeeContext);
}
