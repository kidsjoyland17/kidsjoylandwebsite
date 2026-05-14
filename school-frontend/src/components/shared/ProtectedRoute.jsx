import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ROLE_HOME = {
  admin:   "/admin/dashboard",
  teacher: "/teacher/dashboard",
};

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", height: "100vh",
        fontSize: 16, color: "#7a9990",
      }}>
        Loading…
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → send to their own home, not /login
  // Bug #8 fix: previously sent everyone to /login which was confusing
  if (role && user.role !== role) {
    const fallback = ROLE_HOME[user.role] || "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
}