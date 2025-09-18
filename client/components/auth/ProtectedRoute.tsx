import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: "student" | "counsellor" }) {
  const { session } = useAuth();
  if (!session.role) return <Navigate to="/login" replace />;
  if (role && session.role !== role) return <Navigate to={session.role === "student" ? "/dashboard/student" : "/dashboard/counsellor"} replace />;
  return children;
}
