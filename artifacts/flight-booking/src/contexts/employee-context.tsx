import { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Employee {
  id: number;
  name: string;
  initials: string;
  role: string;
  username: string;
}

export const EMPLOYEES: Employee[] = [
  { id: 1, name: "James Smith", initials: "JS", role: "Administrator", username: "james" },
  { id: 2, name: "Sara Ahmed", initials: "SA", role: "Agent", username: "sara" },
  { id: 3, name: "Mohamed Ali", initials: "MA", role: "Agent", username: "mohamed" },
  { id: 4, name: "Nadia Hassan", initials: "NH", role: "Agent", username: "nadia" },
];

interface EmployeeContextValue {
  currentEmployee: Employee | null;
  employees: Employee[];
  isLoading: boolean;
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const EmployeeContext = createContext<EmployeeContextValue>({
  currentEmployee: null,
  employees: EMPLOYEES,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

const SESSION_KEY = "aeroops_employee";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Employee;
        if (parsed?.id && parsed?.name) {
          setCurrentEmployee(parsed);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, pin: string) => {
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: (body as { message?: string }).message ?? "Invalid credentials" };
      }

      const { employee } = (await res.json()) as { employee: Employee };
      setCurrentEmployee(employee);
      localStorage.setItem(SESSION_KEY, JSON.stringify(employee));
      return { success: true };
    } catch {
      return { success: false, error: "Unable to connect. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentEmployee(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <EmployeeContext.Provider value={{ currentEmployee, employees: EMPLOYEES, isLoading, login, logout }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  return useContext(EmployeeContext);
}

export function useCurrentEmployee(): Employee {
  const { currentEmployee } = useContext(EmployeeContext);
  if (!currentEmployee) {
    throw new Error("useCurrentEmployee must be called in an authenticated context");
  }
  return currentEmployee;
}
