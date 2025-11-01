import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type UserRole = "student" | "counsellor" | "admin" | null;
export interface Session {
  role: UserRole;
  institutionCode: string | null;
  studentId?: string | null;
  anonymousId?: string | null;
  counsellorId?: string | null;
}

const AuthCtx = createContext<{
  session: Session;
  login: (s: Session) => void;
  logout: () => void;
}>({
  session: { role: null, institutionCode: null },
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => {
    const raw = localStorage.getItem("mp.session");
    return raw ? JSON.parse(raw) : { role: null, institutionCode: null };
  });

  useEffect(() => {
    localStorage.setItem("mp.session", JSON.stringify(session));
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      login: (s: Session) => setSession(s),
      logout: () => setSession({ role: null, institutionCode: null }),
    }),
    [session],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
