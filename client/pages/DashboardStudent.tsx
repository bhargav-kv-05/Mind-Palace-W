import { Link } from "react-router-dom";

export default function DashboardStudent() {
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-extrabold">Student Dashboard</h1>
      <p className="mt-2 text-foreground/70">You're browsing anonymously. Start a screening or open a chat.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="font-bold">PHQ-9 & GAD-7</h2>
          <p className="text-sm text-foreground/70">Complete a quick screening; results go to your institution counsellor.</p>
          <Link to="/screening" className="mt-3 inline-block rounded-full px-4 py-2 bg-foreground text-background text-sm font-semibold">Start Screening</Link>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-bold">Ephemeral Chat</h2>
          <p className="text-sm text-foreground/70">Speak freely—messages disappear by default. You can consent to save.</p>
          <Link to="/chat" className="mt-3 inline-block rounded-full px-4 py-2 bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold">Open Chat</Link>
        </div>
      </div>
    </section>
  );
}
