import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardAdmin() {
  const { session } = useAuth();
  const [data, setData] = useState<any>(null);

  async function load() {
    const qs = new URLSearchParams();
    if (session.institutionCode) qs.set("institutionCode", session.institutionCode);
    const res = await fetch(api(`/api/admin/analytics?${qs.toString()}`));
    setData(await res.json());
  }
  useEffect(() => { load(); }, []);

  return (
    <section className="container py-12">
      <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
      <p className="mt-2 text-foreground/70">Institution: {session.institutionCode ?? "All"}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="Screenings" value={data?.screenings?.total ?? 0}>
          <small className="text-foreground/60">By severity: {JSON.stringify(data?.screenings?.bySeverity ?? [])}</small>
        </Card>
        <Card title="Alerts" value={(data?.alerts?.bySeverity ?? []).reduce((a:number,b:any)=>a+b.count,0)}>
          <small className="text-foreground/60">Top tags: {JSON.stringify(data?.alerts?.topTags ?? [])}</small>
        </Card>
        <Card title="Library Entries" value={(data?.library?.byTone ?? []).reduce((a:number,b:any)=>a+b.count,0)}>
          <small className="text-foreground/60">Tone split: {JSON.stringify(data?.library?.byTone ?? [])}</small>
        </Card>
        <Card title="Posts" value={data?.posts?.total ?? 0} />
      </div>
    </section>
  );
}

function Card({ title, value, children }: { title: string; value: number; children?: any }) {
  return (
    <div className="rounded-2xl border p-6">
      <div className="text-sm text-foreground/60">{title}</div>
      <div className="text-3xl font-extrabold">{value}</div>
      {children}
    </div>
  );
}
