import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { api, API_BASE } from "@/lib/api";

export default function ChatPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<"live" | "posts">("live");
  return (
    <section className="container py-8">
      <div className="flex items-center gap-2">
        <button className={`px-4 py-2 rounded-full text-sm ${tab === "live" ? "bg-foreground text-background" : "border"}`} onClick={() => setTab("live")}>Live Chat</button>
        <button className={`px-4 py-2 rounded-full text-sm ${tab === "posts" ? "bg-foreground text-background" : "border"}`} onClick={() => setTab("posts")}>Posts</button>
      </div>
      <div className="mt-6">
        {tab === "live" ? <LiveChat /> : <Posts />}
      </div>
    </section>
  );
}

function LiveChat() {
  const { session } = useAuth();
  const nav = (await import("react-router-dom")).useNavigate?.() as any;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState<null | "positive" | "negative" >(null);
  const [tagsInput, setTagsInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const roomId = useMemo(() => `inst:${session.institutionCode ?? "public"}`, [session.institutionCode]);

  useEffect(() => {
    const s = io(API_BASE || window.location.origin, { transports: ["websocket", "polling"] });
    socketRef.current = s;
    s.emit("join", { roomId });
    s.on("message", (m) => setMessages((prev) => [...prev, m]));
    s.on("alert", (a) => setMessages((prev) => [...prev, { system: true, ...a }]));
    return () => { s.disconnect(); };
  }, [roomId]);

  async function send() {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("message", {
      roomId,
      institutionCode: session.institutionCode,
      authorAnonymousId: session.anonymousId,
      authorRole: session.role ?? "student",
      text,
      consent,
      tags: tagsInput.split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean),
    });
    setText("");
    setConsent(null);
    setTagsInput("");
  }

  return (
    <div className="grid gap-4">
      <div className="h-80 overflow-auto rounded-xl border p-3 bg-background">
        {messages.map((m, i) => (
          <div key={i} className="text-sm py-1">
            {m.system ? (
              <span className="text-amber-600">[ALERT] {m.severity}</span>
            ) : (
              <>
                <span className="font-semibold mr-2">{m.authorAnonymousId ?? m.authorRole}</span>
                <span>{m.text}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-lg border px-3 py-2" placeholder="Type your message" />
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="rounded-lg border px-3 py-2 w-56" placeholder="tags (comma separated)" />
        <select value={consent ?? ""} onChange={(e) => setConsent(e.target.value ? (e.target.value as any) : null)} className="rounded-lg border px-2">
          <option value="">No save</option>
          <option value="positive">Save to Library (Green)</option>
          <option value="negative">Save to Library (Red)</option>
        </select>
        <button onClick={send} className="rounded-full px-4 py-2 bg-gradient-to-br from-primary to-secondary text-white">Send</button>
      </div>
    </div>
  );
}

function Posts() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [tone, setTone] = useState<"positive" | "negative" | "" | null>("");
  const [tagsInput, setTagsInput] = useState("");

  async function load() {
    const res = await fetch(api(`/api/posts?institutionCode=${encodeURIComponent(session.institutionCode ?? "")}`));
    setPosts(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function submit() {
    if (!text.trim()) return;
    await fetch(api("/api/posts"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ institutionCode: session.institutionCode, authorAnonymousId: session.anonymousId, text, tone: tone || null, tags: tagsInput.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean) }) });
    setText("");
    setTone("");
    setTagsInput("");
    load();
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-lg border px-3 py-2" placeholder="Share a thought (will be saved)" />
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="rounded-lg border px-3 py-2 w-56" placeholder="tags (comma separated)" />
        <select value={tone ?? ""} onChange={(e) => setTone(e.target.value as any)} className="rounded-lg border px-2">
          <option value="">No tone</option>
          <option value="positive">Positive (Green)</option>
          <option value="negative">Negative (Red)</option>
        </select>
        <button onClick={submit} className="rounded-full px-4 py-2 bg-foreground text-background">Post</button>
      </div>
      <div className="grid gap-2">
        {posts.map((p, i) => (
          <div key={i} className="rounded-lg border p-3 text-sm">
            <div className="text-foreground/60">{new Date(p.createdAt).toLocaleString()} {p.tone ? `• ${p.tone}` : ""}</div>
            <div>{p.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
