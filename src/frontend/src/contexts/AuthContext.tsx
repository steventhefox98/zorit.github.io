import { type LoginResult, type RegisterResult, Role } from "@/backend";
import { useGetMyRole, useLogin, useRegister } from "@/hooks/useQueries";
import { MOCK_ADMIN_USERNAME, isMockMode } from "@/lib/mockMode";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SESSION_KEY = "zorit.session";

interface StoredSession {
  username: string;
  role: Role;
}

interface AuthContextType {
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; role: Role | null }>;
  register: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; role: Role | null }>;
  logout: () => void;
  refreshRole: () => Promise<Role | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (
      typeof parsed?.username !== "string" ||
      typeof parsed?.role !== "string"
    ) {
      return null;
    }
    return {
      username: parsed.username,
      role: parsed.role as Role,
    };
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — session stays in-memory only */
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function toRole(value: string | Role): Role | null {
  const candidates = Object.values(Role) as string[];
  return candidates.includes(value as string) ? (value as Role) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const myRoleQuery = useGetMyRole(username);

  // Restore session from localStorage on mount.
  useEffect(() => {
    const stored = readSession();
    if (stored) {
      const restoredRole = toRole(stored.role);
      if (restoredRole) {
        setUsername(stored.username);
        setRole(restoredRole);
        return;
      }
      clearSession();
    }

    // No stored session — when running in mock mode (canister unavailable,
    // e.g. deployed to a static host), auto-establish a logged-in admin
    // session so the user is not blocked by auth. The mock backend serves
    // sample data regardless of credentials, so we set the local session
    // directly without a backend login round-trip.
    if (isMockMode()) {
      const mockRole = Role.Administrator;
      setUsername(MOCK_ADMIN_USERNAME);
      setRole(mockRole);
      writeSession({ username: MOCK_ADMIN_USERNAME, role: mockRole });
    }
  }, []);

  const applyResult = (
    result: LoginResult | RegisterResult,
  ): { success: boolean; role: Role | null } => {
    const resolvedRole = toRole(result.role);
    return {
      success: result.success,
      role: result.success ? resolvedRole : null,
    };
  };

  const login: AuthContextType["login"] = async (name, password) => {
    const result = await loginMutation.mutateAsync({
      username: name,
      password,
    });
    const outcome = applyResult(result);
    if (outcome.success && outcome.role) {
      setUsername(name);
      setRole(outcome.role);
      writeSession({ username: name, role: outcome.role });
    }
    return outcome;
  };

  const register: AuthContextType["register"] = async (name, password) => {
    const result = await registerMutation.mutateAsync({
      username: name,
      password,
    });
    const outcome = applyResult(result);
    if (outcome.success && outcome.role) {
      setUsername(name);
      setRole(outcome.role);
      writeSession({ username: name, role: outcome.role });
    }
    return outcome;
  };

  const logout = () => {
    setUsername(null);
    setRole(null);
    clearSession();
  };

  // Refresh the current user's role from the backend so pages can use the
  // current backend role instead of the stale login-time role. This is used
  // after a two-step accept promotes the user, and on page mounts that gate
  // access by role (e.g. Messages).
  const refreshRole: AuthContextType["refreshRole"] = async () => {
    if (!username) return null;
    try {
      const fresh = await myRoleQuery.refetch();
      const next = fresh.data ?? null;
      if (next) {
        setRole(next);
        writeSession({ username, role: next });
      }
      return next;
    } catch {
      return role;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        role,
        isAuthenticated: !!username,
        login,
        register,
        logout,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
