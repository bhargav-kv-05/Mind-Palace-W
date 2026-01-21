import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { api, API_BASE } from "@/lib/api";

export default function ChatPage() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<string>((searchParams.get("tab")) || "live");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
    else setTab("live"); // CRITICAL FIX: Reset to "live" if tab param is removed (e.g. clicking "Chat" header)
  }, [searchParams]);

  return (
    <section className="container py-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button className={`px-4 py-2 rounded-full text-sm ${(tab === "live" || tab === "private") ? "bg-foreground text-background" : "border"}`} onClick={() => setTab("live")}>Live Chat</button>
        <button className={`px-4 py-2 rounded-full text-sm ${tab === "peer_support" ? "bg-foreground text-background" : "border"}`} onClick={() => setTab("peer_support")}>Peer Support</button>
        <button className={`px-4 py-2 rounded-full text-sm ${tab === "posts" ? "bg-foreground text-background" : "border"}`} onClick={() => setTab("posts")}>Posts</button>
        <button className={`px-4 py-2 rounded-full text-sm ${tab === "library" ? "bg-foreground text-background" : "border"}`} onClick={() => setTab("library")}>Motivational Library</button>
      </div>
      <div className="mt-6">
        {(tab === "live" || tab === "private" || tab === "peer_support") ? <LiveChat activeTab={tab} /> : tab === "posts" ? <Posts /> : <LibraryTab />}
      </div>
    </section>
  );
}

function LiveChat({ activeTab }: { activeTab?: string }) {
  const { session } = useAuth();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isModerationMode = searchParams.get("mode") === "moderation";
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState<null | "positive" | "negative">(null);
  const [tagsInput, setTagsInput] = useState("");
  const socketRef = useRef<Socket | null>(null);

  // Counselor logic: Check for private intervention params
  const targetStudentId = searchParams.get("targetStudentId");
  const isPrivateTab = searchParams.get("tab") === "private";
  const urlPrivateRoomId = searchParams.get("privateRoomId");

  // Initialize state from URL if present (ROBUSTNESS FIX)
  const [scope, setScope] = useState<"institution" | "global" | "private" | "peer_support">(() => {
    if (activeTab === "peer_support") return "peer_support";
    if (isPrivateTab && (targetStudentId || urlPrivateRoomId)) return "private";
    return "institution";
  });
  const [privateRoomId, setPrivateRoomId] = useState<string | null>(() => {
    if (urlPrivateRoomId) return urlPrivateRoomId;
    if (session.role === "counsellor" && targetStudentId) return `private:${session.counsellorId}:${targetStudentId}`;
    return null;
  });

  // Sync scope with tab prop changes
  useEffect(() => {
    if (activeTab === "peer_support") setScope("peer_support");
    else if (activeTab === "live" && scope === "peer_support") setScope("institution");
  }, [activeTab]);

  const roomId = useMemo(() => {
    if (scope === "private" && privateRoomId) return privateRoomId;
    if (scope === "global") return "global:public";
    if (scope === "peer_support") return `peer:${session.institutionCode}`;
    return `inst:${session.institutionCode ?? "public"}`;
  }, [session.institutionCode, scope, privateRoomId]);

  useEffect(() => {
    // If counselor opening private tab
    if (session.role === "counsellor" && isPrivateTab && targetStudentId) {
      const pRoom = `private:${session.counsellorId}:${targetStudentId}`;
      setPrivateRoomId(pRoom);
      setScope("private");
    }
  }, [session.role, isPrivateTab, targetStudentId]);

  useEffect(() => {
    if (session.role === "student" && !session.anonymousId) {
      nav("/screening", { replace: true });
      return;
    }
    const s = io(API_BASE || window.location.origin, { transports: ["websocket", "polling"] });
    socketRef.current = s;
    setMessages([]); // Clear messages on switching rooms

    s.emit("join", { roomId });

    // Join institution room explicitly if we are in private mode? 
    // Actually, to receive the invite, the student needs to be in the inst room. 
    // If the student is currently in 'institution' scope, they are in the inst room. 
    // If they are in 'global', they might MISS the invite. 
    // Improvement: Always join 'inst:code' as a control channel?
    // For now, assume they are in 'institution' (default).

    // Counselor: Emit invite if entering private mode
    if (scope === "private" && session.role === "counsellor" && targetStudentId) {
      s.emit("request_private_session", {
        institutionCode: session.institutionCode,
        targetStudentId,
        counsellorId: session.counsellorId
      });
    }

    s.on("message", (m) => setMessages((prev) => [...prev, m]));
    s.on("alert", (a) => setMessages((prev) => [...prev, { system: true, ...a }]));

    // Student: Listen for invite
    s.on("private_session_invite", (payload) => {
      if (session.role === "student" && session.anonymousId === payload.targetStudentId) {
        // Auto-accept and PERSIST to URL so refresh works
        setSearchParams(params => {
          params.set("tab", "private");
          params.set("privateRoomId", payload.privateRoomId);
          return params;
        });
        // State update will happen automatically via the URL read logic below or we set it here for speed
        setPrivateRoomId(payload.privateRoomId);
        setScope("private");
      }
    });

    return () => { s.disconnect(); };
  }, [roomId, scope]); // Re-run when scope changes to join new room

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
      {isModerationMode ? (
        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-2 mb-2">
          <span className="font-bold text-destructive">Moderation Center</span>
          <span className="text-xs text-muted-foreground">Monitoring all sensitive conversations</span>
        </div>
      ) : scope === "private" ? (
        <div className="bg-purple-100 border border-purple-200 p-3 rounded-lg flex items-center gap-2 mb-2">
          <span className="font-bold text-purple-700">Private Support Session</span>
          <span className="text-xs text-purple-600">This conversation is 1:1 and private.</span>
          <button onClick={() => {
            if (session.role === "counsellor") {
              nav("/moderation");
            } else {
              setScope("institution");
            }
          }} className="ml-auto text-xs underline">Exit</button>
        </div>
      ) : scope === "peer_support" ? (
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center gap-2 mb-2">
          <span className="font-bold text-primary">Peer Support Channel</span>
          <span className="text-xs text-primary/80">Helping students from your university anonymously.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg w-fit">
          {session.role === "counsellor" ? (
            <span className="text-xs text-muted-foreground px-2">Preview only (Restricted)</span>
          ) : (
            <>
              <button
                onClick={() => setScope("institution")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${scope === "institution" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                My University
              </button>
              <button
                onClick={() => setScope("global")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${scope === "global" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Global Community
              </button>
            </>
          )}
        </div>
      )}

      <div className="h-80 overflow-auto rounded-xl border p-3 bg-background">
        {messages.map((m, i) => (
          <div key={i} className="text-sm py-1">
            {m.system ? (
              <span className="text-amber-600">[ALERT] {m.severity}</span>
            ) : (
              <>
                <span className="font-semibold mr-2">
                  {m.authorRole === "volunteer" ? (
                    <span className="text-primary flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                      Volunteer
                    </span>
                  ) : (
                    m.authorAnonymousId ?? m.authorRole
                  )}
                </span>
                <span>{m.text}</span>
              </>
            )}
          </div>
        ))}
      </div>
      {(session.role !== "counsellor" && session.role !== "admin" || scope === "private") && (
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
      )}
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
    await fetch(api("/api/posts"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ institutionCode: session.institutionCode, authorAnonymousId: session.anonymousId, text, tone: tone || null, tags: tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) }) });
    setText("");
    setTone("");
    setTagsInput("");
    load();
  }

  return (
    <div className="grid gap-4">
      {session.role !== "counsellor" && session.role !== "admin" && (
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
      )}
      <div className="grid gap-2">
        {posts.map((p, i) => (
          <div key={i} className="rounded-lg border p-3 text-sm">
            <div className="text-foreground/60">{new Date(p.createdAt).toLocaleString()} {p.tone ? `• ${p.tone}` : ""} {p.tags?.length ? `• ${p.tags.map((t: string) => `#${t}`).join(" ")}` : ""}</div>
            <div>{p.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryTab() {
  const { session } = useAuth();
  const [tone, setTone] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const qs = new URLSearchParams();
    if (tone) qs.set("tone", tone);
    if (tag) qs.set("tag", tag);
    // CRITICAL FIX: Pass viewer's institution code AND ROLE
    if (session.institutionCode) {
      qs.set("viewerInstitutionCode", session.institutionCode);
    }
    if (session.role) {
      qs.set("viewerRole", session.role);
    }
    const res = await fetch(api(`/api/library?${qs.toString()}`));
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function hide(id: string) {
    if (!confirm("Hide this item from students at your university? You can still see it.")) return;
    await fetch(api(`/api/library/${id}/hide`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institutionCode: session.institutionCode })
    });
    load();
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <select value={tone} onChange={(e) => setTone(e.target.value)} className="rounded-lg border px-2"><option value="">All</option><option value="positive">Green</option><option value="negative">Red</option></select>
        <input placeholder="Filter by tag (e.g., stress)" value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-lg border px-3 py-2" />
        <button onClick={load} className="rounded-full px-4 py-2 bg-foreground text-background">Search</button>
      </div>
      <div className="grid gap-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border p-3 text-sm flex justify-between items-start">
            <div>
              <div className="text-foreground/60">{new Date(it.createdAt).toLocaleString()} {it.tone ? `• ${it.tone}` : ""} {it.tags?.length ? `• ${it.tags.map((t: string) => `#${t}`).join(" ")}` : ""}</div>
              <div>{it.text}</div>
            </div>
            {(session.role === "counsellor" || session.role === "admin") && (
              <button
                onClick={() => hide(it._id)}
                className="text-muted-foreground hover:bg-muted p-1.5 rounded"
                title="Hide from my campus"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
