import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Usage:
// <ProtectedRoute role="admin">   → only admins pass
// <ProtectedRoute role="teacher"> → only teachers pass
// <ProtectedRoute>                → any logged-in user passes

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Still checking cookie — show nothing yet
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", height: "100vh",
        fontSize: 16, color: "#7a9990"
      }}>
        Loading…
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → go to login
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  // All good
  return children;
}