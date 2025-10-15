import { Link, NavLink, useLocation } from "react-router-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { LogOut, MessageSquare, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Chat" },
  { to: "/library", label: "Motivational Library" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const dashboardHref = useMemo(() => {
    switch (session.role) {
      case "student":
        return "/dashboard/student";
      case "counsellor":
        return "/dashboard/counsellor";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/login";
    }
  }, [session.role]);

  const handleSignOut = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 blur-md" />
            <div className="relative rounded-xl p-2 bg-gradient-to-br from-primary to-secondary text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <span className="font-extrabold tracking-tight text-lg">MindPalace</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-foreground/90",
                  isActive || location.pathname === item.to
                    ? "text-foreground"
                    : "text-foreground/60",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session.role ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to={dashboardHref}>Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-primary to-secondary shadow-md hover:shadow-lg transition-shadow"
            >
              <MessageSquare className="h-4 w-4" /> Launch App
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
