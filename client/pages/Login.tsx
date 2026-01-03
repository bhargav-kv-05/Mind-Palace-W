import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Institution {
  id: string;
  name: string;
  code: string;
  region: string;
}

export default function Login() {
  const nav = useNavigate();
  const { session, login } = useAuth();
  const [role, setRole] = useState<"student" | "counsellor" | "admin">(
    "student",
  );
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionCode, setInstitutionCode] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("@/lib/api").then(({ api }) => {
      fetch(api("/api/mock/institutions"))
        .then((r) => r.json())
        .then(setInstitutions)
        .catch(() => setInstitutions([]));
    });
  }, []);

  const selected = useMemo(
    () => institutions.find((i) => i.code === institutionCode),
    [institutions, institutionCode],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!selected) throw new Error("Invalid institution code");
      if (!userId)
        throw new Error(
          role === "student"
            ? "Enter Student ID"
            : role === "counsellor"
            ? "Enter Counsellor ID"
            : "Enter Admin ID",
        );

      if (role === "student") {
        login({
          role: "student",
          institutionCode,
          institutionName: selected.name,
          studentId: userId,
          anonymousId: null,
        });
        nav("/screening", { replace: true });
      } else if (role === "counsellor") {
        login({
          role: "counsellor",
          institutionCode,
          institutionName: selected.name,
          counsellorId: userId
        });
        nav("/dashboard/counsellor", { replace: true });
      } else {
        login({
          role: "admin",
          institutionCode,
          institutionName: selected.name
        });
        nav("/dashboard/admin", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative">
      <div className="container py-16 max-w-xl">
        <h1 className="text-3xl font-extrabold">Secure Access</h1>
        <p className="mt-2 text-foreground/70">
          Institution Code →{" "}
          {role === "student"
            ? "Student ID"
            : role === "counsellor"
            ? "Counsellor ID"
            : "Admin ID"} →
          {role === "student" ? "Anonymous/Verified session" : "Secure dashboard access"}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border p-1">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`px-4 py-1 text-sm rounded-full ${role === "student" ? "bg-foreground text-background" : ""}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("counsellor")}
                className={`px-4 py-1 text-sm rounded-full ${role === "counsellor" ? "bg-foreground text-background" : ""}`}
              >
                Counsellor
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-4 py-1 text-sm rounded-full ${role === "admin" ? "bg-foreground text-background" : ""}`}
              >
                Admin
              </button>
            </div>
            <p className="text-xs text-foreground/60">
              {role === "student"
                ? "Access support, chat, and wellbeing resources"
                : role === "counsellor"
                  ? "Monitor student wellbeing and moderate discussions"
                  : "View institution analytics and insights"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Institution Code</label>
            <input
              list="inst-codes"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={institutionCode}
              onChange={(e) => setInstitutionCode(e.target.value)}
              placeholder="e.g., JKU-UK-001"
            />
            <datalist id="inst-codes">
              {institutions.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.name}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-sm font-medium">
              {role === "student"
                ? "Student ID"
                : role === "counsellor"
                ? "Counsellor ID"
                : "Admin ID"}
            </label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={
                role === "student"
                  ? "UK-21-4587"
                  : role === "counsellor"
                  ? "UK-PSY-01"
                  : "ADM-001"
              }
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            disabled={loading}
            className="rounded-full px-5 py-2.5 bg-gradient-to-br from-primary to-secondary text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Enter"}
          </button>
        </form>
      </div>
    </section>
  );
}
