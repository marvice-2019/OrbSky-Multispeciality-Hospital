import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const HTTP_UNAUTHORIZED = 401;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, object = logged in
  const [loading, setLoading] = useState(true);

  // One-time session probe on mount. Intentionally no dependencies — this must
  // run exactly once when the provider mounts, regardless of any other state.
  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) setUser(res.data);
      })
      .catch((err) => {
        // 401 here just means "no active session" — that's expected, not an error.
        const status = err?.response?.status;
        if (status && status !== HTTP_UNAUTHORIZED) {
          console.warn("Auth probe failed:", err);
        }
        if (mounted) setUser(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Network/server failure shouldn't block local sign-out.
      console.warn("Logout request failed; clearing client state anyway", err);
    }
    setUser(false);
  }, []);

  // Memoize so context consumers don't re-render on every AuthProvider render.
  const value = useMemo(
    () => ({ user, loading, login, logout, setUser }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
