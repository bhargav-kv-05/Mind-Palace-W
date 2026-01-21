import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";

export default function LibraryPage() {
  const { session } = useAuth();
  const [tone, setTone] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const qs = new URLSearchParams();
    if (tone) qs.set("tone", tone);
    if (tag) qs.set("tag", tag);
    // CRITICAL FIX: Pass viewer's institution code AND ROLE (Same as Chat.tsx)
    if (session.institutionCode) {
      qs.set("viewerInstitutionCode", session.institutionCode);
    }
    if (session.role) {
      qs.set("viewerRole", session.role);
    }
    const res = await fetch(api(`/api/library?${qs.toString()}`));
    setItems(await res.json());
  }
  useEffect(() => { load(); }, [session]); // Re-load when session loads

  return (
    <section className="container py-8">
      <h1 className="text-3xl font-extrabold">Motivational Library</h1>
      <div className="mt-4 flex gap-2">
        <select value={tone} onChange={(e) => setTone(e.target.value)} className="rounded-lg border px-2"><option value="">All</option><option value="positive">Green</option><option value="negative">Red</option></select>
        <input placeholder="Filter by tag (e.g., stress)" value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-lg border px-3 py-2" />
        <button onClick={load} className="rounded-full px-4 py-2 bg-foreground text-background">Search</button>
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="text-xs text-foreground/60">{new Date(it.createdAt).toLocaleString()} {it.tone ? `• ${it.tone}` : ""}</div>
            <div className="mt-1">{it.text}</div>
            {it.tags?.length ? <div className="mt-2 flex gap-1 text-xs text-foreground/60">{it.tags.map((t: string, idx: number) => (<span key={idx} className="rounded bg-secondary/10 px-2 py-0.5">#{t}</span>))}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
