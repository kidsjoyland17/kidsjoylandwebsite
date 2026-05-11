import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On every page load, ask the server "who am I?"
  // The HttpOnly cookie is sent automatically by the browser.
  // If the cookie is missing/expired, the server returns 401 → user = null.
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    // Server sets the HttpOnly cookie automatically in the response.
    // We just read the user data from the response body.
    const { id, name, email: userEmail, role, avatar, profileCompleted }
      = res.data.data;

    const userData = { id, name, email: userEmail, role, avatar, profileCompleted };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // server clears the cookie
    } catch {
      // continue even if the server call fails
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