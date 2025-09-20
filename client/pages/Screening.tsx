import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function ScreeningPage() {
  const { session, login } = useAuth();
  const nav = useNavigate();
  const [phq9, setPhq9] = useState<number[]>(Array(9).fill(0));
  const [gad7, setGad7] = useState<number[]>(Array(7).fill(0));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function submit() {
    setLoading(true);
    const res = await fetch(api("/api/screenings"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ institutionCode: session.institutionCode, studentId: session.studentId, studentAnonymousId: session.anonymousId, phq9, gad7 }) });
    const data = await res.json();
    setResult(data);
    // Set anonymousId returned by server into session
    try {
      const { useAuth } = await import("@/context/AuthContext");
    } catch {}
    setLoading(false);
  }

  return (
    <section className="container py-8">
      <h1 className="text-3xl font-extrabold">Screening</h1>
      <p className="text-foreground/70">Complete PHQ-9 and GAD-7 before joining chat.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Scale title="PHQ-9" items={9} values={phq9} setValues={setPhq9} />
        <Scale title="GAD-7" items={7} values={gad7} setValues={setGad7} />
      </div>
      <div className="mt-6 flex gap-3">
        <button disabled={loading} onClick={submit} className="rounded-full px-5 py-2.5 bg-gradient-to-br from-primary to-secondary text-white">{loading ? "Submitting..." : "Submit"}</button>
        {result && <button onClick={() => nav("/chat")} className="rounded-full px-5 py-2.5 border">Go to Chat</button>}
      </div>
      {result && (
        <div className="mt-6 rounded-xl border p-4">
          <div className="font-semibold">Results</div>
          <div className="text-sm text-foreground/70">PHQ-9: {result.phq9Total} ({result.phq9Severity}), GAD-7: {result.gad7Total} ({result.gad7Severity})</div>
        </div>
      )}
    </section>
  );
}

function Scale({ title, items, values, setValues }: { title: string; items: number; values: number[]; setValues: (v: number[]) => void }) {
  return (
    <div>
      <h2 className="font-bold">{title}</h2>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {Array.from({ length: items }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">Q{idx + 1}</span>
            <select value={values[idx]} onChange={(e) => setValues(values.map((v, i) => (i === idx ? Number(e.target.value) : v)))} className="rounded-lg border px-2">
              <option value={0}>0 - Not at all</option>
              <option value={1}>1 - Several days</option>
              <option value={2}>2 - More than half the days</option>
              <option value={3}>3 - Nearly every day</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
