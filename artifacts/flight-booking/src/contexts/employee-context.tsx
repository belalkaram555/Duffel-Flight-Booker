import { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Employee {
  id: number;
  name: string;
  initials: string;
  role: string;
  username: string;
  isActive?: boolean;
}

interface EmployeeContextValue {
  currentEmployee: Employee | null;
  employees: Employee[];
  sessionToken: string | null;
  isLoading: boolean;
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextValue>({
  currentEmployee: null,
  employees: [],
  sessionToken: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  refreshEmployees: async () => {},
});

const SESSION_KEY = "aeroops_employee";
const TOKEN_KEY = "aeroops_token";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/employees`);
      if (res.ok) {
        const data = await res.json() as { employees: Employee[] };
        setEmployees(data.employees);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Employee;
          if (parsed?.id && parsed?.name) {
            setCurrentEmployee(parsed);
          }
        }
        if (storedToken) {
          setSessionToken(storedToken);
        }
      } catch {
      }
      if (!cancelled) {
        await loadEmployees();
        setIsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [loadEmployees]);

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

      const body = (await res.json()) as { employee: Employee; sessionToken?: string };
      setCurrentEmployee(body.employee);
      localStorage.setItem(SESSION_KEY, JSON.stringify(body.employee));
      if (body.sessionToken) {
        setSessionToken(body.sessionToken);
        localStorage.setItem(TOKEN_KEY, body.sessionToken);
      }
      return { success: true };
    } catch {
      return { success: false, error: "Unable to connect. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`${BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      }).catch(() => {});
    }
    setCurrentEmployee(null);
    setSessionToken(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <EmployeeContext.Provider value={{ currentEmployee, employees, sessionToken, isLoading, login, logout, refreshEmployees: loadEmployees }}>
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
