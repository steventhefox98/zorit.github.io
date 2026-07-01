import {
  type Avatar,
  type LoginResult,
  type RegisterResult,
  Role,
} from "@/backend";
import {
  useGetAvatar,
  useGetMyRole,
  useLogin,
  useRegister,
} from "@/hooks/useQueries";
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
  avatar: Avatar | null;
}

interface AuthContextType {
  username: string | null;
  role: Role | null;
  avatar: Avatar | null;
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
  /** Force a re-fetch of the current user's avatar (e.g. after setMyAvatar). */
  refreshAvatar: () => Promise<Avatar | null>;
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
    // avatar is optional in older sessions; default to null.
    const avatar = (parsed.avatar ?? null) as Avatar | null;
    return {
      username: parsed.username,
      role: parsed.role as Role,
      avatar,
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
  const [avatar, setAvatar] = useState<Avatar | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const myRoleQuery = useGetMyRole(username);
  // Fetch the current user's avatar so the navbar can render it without
  // a separate query. The query is keyed on username and re-runs on
  // login / session restore.
  const myAvatarQuery = useGetAvatar(username);

  // Restore session from localStorage on mount.
  useEffect(() => {
    const stored = readSession();
    if (stored) {
      const restoredRole = toRole(stored.role);
      if (restoredRole) {
        setUsername(stored.username);
        setRole(restoredRole);
        setAvatar(stored.avatar);
      } else {
        clearSession();
      }
    }
  }, []);

  // Sync the avatar query result into auth state. The query refetches
  // whenever `username` changes (login, register, session restore) and
  // whenever the avatar query is invalidated (after setMyAvatar).
  useEffect(() => {
    if (username && myAvatarQuery.data !== undefined) {
      setAvatar(myAvatarQuery.data ?? null);
      // Persist the fresh avatar alongside the existing session.
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const existing = JSON.parse(raw) as StoredSession;
          existing.avatar = myAvatarQuery.data ?? null;
          localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
        }
      } catch {
        /* storage unavailable — avatar stays in-memory only */
      }
    }
  }, [username, myAvatarQuery.data]);

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
      // Avatar will be fetched by the myAvatarQuery effect once
      // username is set; persist a null placeholder so the session
      // blob is well-formed.
      setAvatar(null);
      writeSession({ username: name, role: outcome.role, avatar: null });
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
      setAvatar(null);
      writeSession({ username: name, role: outcome.role, avatar: null });
    }
    return outcome;
  };

  const logout = () => {
    setUsername(null);
    setRole(null);
    setAvatar(null);
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
        writeSession({ username, role: next, avatar });
      }
      return next;
    } catch {
      return role;
    }
  };

  // Force a re-fetch of the current user's avatar. Used by the profile
  // page after setMyAvatar so the navbar updates immediately.
  const refreshAvatar: AuthContextType["refreshAvatar"] = async () => {
    if (!username) return null;
    try {
      const fresh = await myAvatarQuery.refetch();
      const next = fresh.data ?? null;
      setAvatar(next);
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const existing = JSON.parse(raw) as StoredSession;
          existing.avatar = next;
          localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
        }
      } catch {
        /* ignore */
      }
      return next;
    } catch {
      return avatar;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        role,
        avatar,
        isAuthenticated: !!username,
        login,
        register,
        logout,
        refreshRole,
        refreshAvatar,
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
