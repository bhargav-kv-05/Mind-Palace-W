import { Link } from "react-router-dom";

export default function DashboardCounsellor() {
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-extrabold">Counsellor Dashboard</h1>
      <p className="mt-2 text-foreground/70">View screening results, moderate chats, and manage volunteers.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <h2 className="font-bold">Recent Screenings</h2>
          <p className="text-sm text-foreground/70">Incoming PHQ-9 and GAD-7 summaries per anonymous ID.</p>
          <Link to="/dashboard" className="mt-3 inline-block rounded-full px-4 py-2 bg-foreground text-background text-sm font-semibold">Review</Link>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-bold">Volunteer Nominations</h2>
          <p className="text-sm text-foreground/70">Nominate student mentors to provide off-hours peer moderation.</p>
          <Link to="/dashboard" className="mt-3 inline-block rounded-full px-4 py-2 bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold">Manage</Link>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-bold">Moderation Center</h2>
          <p className="text-sm text-foreground/70">Monitor flagged chats and escalate emergencies compassionately.</p>
          <Link to="/chat" className="mt-3 inline-block rounded-full px-4 py-2 border text-sm font-semibold">Open</Link>
        </div>
      </div>
    </section>
  );
}
