import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("synapnotes_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("synapnotes_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((response) => {
        setUser(response.data);
        localStorage.setItem("synapnotes_user", JSON.stringify(response.data));
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("synapnotes_token");
        localStorage.removeItem("synapnotes_user");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const persistSession = (accessToken, profile) => {
    localStorage.setItem("synapnotes_token", accessToken);
    localStorage.setItem("synapnotes_user", JSON.stringify(profile));
    setToken(accessToken);
    setUser(profile);
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    persistSession(response.data.access_token, response.data.user);
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    persistSession(response.data.access_token, response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem("synapnotes_token");
    localStorage.removeItem("synapnotes_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
