import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Role = "student" | "counsellor" | "admin";

export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: Role }) {
  const { session } = useAuth();
  if (!session.role) return <Navigate to="/login" replace />;
  if (role && session.role !== role) {
    const fallback = session.role === "student" ? "/dashboard/student" : session.role === "counsellor" ? "/dashboard/counsellor" : "/dashboard/admin";
    return <Navigate to={fallback} replace />;
  }
  return children;
}
