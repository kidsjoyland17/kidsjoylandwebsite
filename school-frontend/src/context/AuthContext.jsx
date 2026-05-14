import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    // Bug #7 fix — teacherId was missing from destructuring before
    const {
      id,
      name,
      email: userEmail,
      role,
      avatar,
      profileCompleted,
      teacherId,
    } = res.data.data;

    const userData = { id, name, email: userEmail, role, avatar, profileCompleted, teacherId };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // continue even if server call fails
    } finally {
      setUser(null);
    }
  };

  const updateUser = (patch) =>
    setUser((prev) => ({ ...prev, ...patch }));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
};