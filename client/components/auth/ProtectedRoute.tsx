import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Role = "student" | "counsellor" | "volunteer" | "admin";

export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: Role | Role[] }) {
  const { session } = useAuth();
  if (!session.role) return <Navigate to="/login" replace />;

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role as Role)) {
    const fallback = session.role === "student" ? "/dashboard/student" : session.role === "counsellor" ? "/dashboard/counsellor" : session.role === "volunteer" ? "/dashboard/volunteer" : "/dashboard/admin";
    return <Navigate to={fallback} replace />;
  }
  return children;
}
