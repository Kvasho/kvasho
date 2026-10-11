"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, fetchCurrentUser, logout as logoutRequest, type CurrentUser } from "./api";

type Session = {
  /** `undefined` while the first check is running, `null` when signed out. */
  user: CurrentUser | null | undefined;
  setUser: (user: CurrentUser | null) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return session;
}

/** The signed-in user, read from the API once and shared by every Invoicer page. */
export default function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    fetchCurrentUser(controller.signal)
      .then(setUser)
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (!(error instanceof ApiError)) console.error(error);
        setUser(null);
      });

    return () => controller.abort();
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
