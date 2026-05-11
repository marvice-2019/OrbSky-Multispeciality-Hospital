import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

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
        if (err?.response?.status && err.response.status !== 401) {
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

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Network/server failure shouldn't block local sign-out.
      console.warn("Logout request failed; clearing client state anyway", err);
    }
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
