import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const RESPONSE_CHOICES = [
  { value: 0, label: "0 - Not at all" },
  { value: 1, label: "1 - Several days" },
  { value: 2, label: "2 - More than half the days" },
  { value: 3, label: "3 - Nearly every day" },
];

export default function ScreeningPage() {
  const { session, login } = useAuth();
  const nav = useNavigate();
  const [phq9, setPhq9] = useState<number[]>(() => Array(PHQ9_QUESTIONS.length).fill(0));
  const [gad7, setGad7] = useState<number[]>(() => Array(GAD7_QUESTIONS.length).fill(0));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function submit() {
    setLoading(true);
    const res = await fetch(api("/api/screenings"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ institutionCode: session.institutionCode, studentId: session.studentId, studentAnonymousId: session.anonymousId, phq9, gad7 }) });
    const data = await res.json();
    setResult(data);
    // Set anonymousId returned by server into session
    if (data?.studentAnonymousId) {
      login({ ...session, anonymousId: data.studentAnonymousId });
    }
    setLoading(false);
  }

  return (
    <section className="container py-8">
      <h1 className="text-3xl font-extrabold">Screening</h1>
      <p className="text-foreground/70">Complete PHQ-9 and GAD-7 before joining chat.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Scale title="PHQ-9" questions={PHQ9_QUESTIONS} values={phq9} setValues={setPhq9} />
        <Scale title="GAD-7" questions={GAD7_QUESTIONS} values={gad7} setValues={setGad7} />
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

type ScaleProps = {
  title: string;
  questions: string[];
  values: number[];
  setValues: Dispatch<SetStateAction<number[]>>;
};

function Scale({ title, questions, values, setValues }: ScaleProps) {
  return (
    <div className="space-y-4 rounded-2xl border p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">
        {questions.map((question, idx) => {
          const fieldId = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-q${idx + 1}`;
          return (
            <div key={fieldId} className="space-y-2 rounded-xl border bg-background p-3">
              <p className="text-sm font-semibold text-foreground">Question {idx + 1}</p>
              <p className="text-sm text-foreground/80">{question}</p>
              <select
                id={fieldId}
                value={values[idx] ?? 0}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setValues((prev) => prev.map((v, i) => (i === idx ? value : v)));
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {RESPONSE_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
