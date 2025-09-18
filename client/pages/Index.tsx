import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  MessageSquare,
  LibraryBig,
  Users2,
  Languages,
  BarChart3,
  AlarmCheck,
  Sparkles,
} from "lucide-react";

const peerInsights: { tag: string; message: string }[] = [
  { tag: "stress", message: "Breathe. Break tasks into tiny steps. You’re not behind—you’re human." },
  { tag: "lonely", message: "Join one group activity this week. One smile can start a friendship." },
  { tag: "anxiety", message: "Name 5 things you see, 4 you feel, 3 you hear. Grounding works." },
  { tag: "exams", message: "Focus on 25-minute sprints. Progress beats perfection." },
  { tag: "family", message: "It’s okay to set boundaries with love. Your peace matters too." },
];

function GradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-secondary/25 via-accent/20 to-primary/20 blur-3xl" />
    </div>
  );
}

export default function Index() {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      peerInsights.filter(
        (i) => i.tag.includes(query.toLowerCase()) || i.message.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <GradientBackground />
        <div className="container pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-foreground/70">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure • Anonymous • Humanized
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              MindPalace
              <span className="block bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">
                Digital Psychological Support for Students
              </span>
            </h1>
            <p className="mt-4 text-lg text-foreground/70 max-w-prose">
              Confidential access with ephemeral chats, a consent-based motivational library, multilingual support, and verified human moderators—tailored for Jammu & Kashmir and beyond.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                Get Started Securely
              </Link>
              <Link to="/library" className="rounded-full px-6 py-3 text-sm font-semibold border hover:bg-foreground hover:text-background transition">
                Explore Library
              </Link>
            </div>
            <div className="mt-8 rounded-xl border p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-secondary" /> Try the motivational library
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a feeling or tag (e.g., stress, lonely, exams)"
                  className="flex-1 rounded-lg border px-3 py-2 bg-background"
                />
                <Link to="/library" className="rounded-lg px-3 py-2 bg-foreground text-background text-sm font-semibold">
                  Open Library
                </Link>
              </div>
              {query && (
                <ul className="mt-3 space-y-2">
                  {results.slice(0, 3).map((r, i) => (
                    <li key={i} className="rounded-md border px-3 py-2 text-sm">
                      <span className="mr-2 rounded bg-secondary/10 px-2 py-0.5 text-secondary text-[11px] font-bold uppercase tracking-wide">{r.tag}</span>
                      {r.message}
                    </li>
                  ))}
                  {results.length === 0 && (
                    <li className="text-sm text-foreground/60">No matches yet. We’ll learn from the community with consent.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 blur-2xl" />
            <div className="rounded-3xl border shadow-xl p-6 bg-background/80">
              <div className="grid grid-cols-2 gap-4">
                <FeatureCard icon={<MessageSquare className="h-5 w-5" />} title="Ephemeral Chats" desc="Disappearing by default with consent-based saves." />
                <FeatureCard icon={<LibraryBig className="h-5 w-5" />} title="Motivational Library" desc="Real, anonymized peer messages as fallback support." />
                <FeatureCard icon={<Users2 className="h-5 w-5" />} title="Verified Network" desc="Counsellors + nominated student volunteers." />
                <FeatureCard icon={<Languages className="h-5 w-5" />} title="Multilingual" desc="NLP/Translate API for regional languages." />
              </div>
              <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 text-sm">
                If severe distress is detected, we escalate with care: motivational buffer → notify moderator → emergency mapping when required.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="relative border-t">
        <div className="container py-16 grid md:grid-cols-3 gap-8">
          <Benefit icon={<ShieldCheck className="h-5 w-5" />} title="Three-layer Privacy" desc="Ephemeral by default, consent-based storage, and internally traceable IDs for emergencies only." />
          <Benefit icon={<BarChart3 className="h-5 w-5" />} title="Insights, not Identities" desc="Admin dashboard shows anonymized trends, tags, and common issues to guide policy." />
          <Benefit icon={<AlarmCheck className="h-5 w-5" />} title="Compassionate Escalation" desc="Sensitive keywords trigger buffers and, if needed, alerts to trained humans." />
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,theme(colors.secondary/15),transparent_60%)]" />
        <div className="container py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Launch a stigma-free support system in your institution
          </h2>
          <p className="mt-3 text-foreground/70 max-w-2xl mx-auto">
            Start with a free prototype. Scale with subscriptions. Verified counsellors and volunteers ensure reliability.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="rounded-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              Get Started
            </Link>
            <a href="mailto:bhargavkv05@gmail.com" className="rounded-full px-6 py-3 text-sm font-semibold border">
              Talk to Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 font-semibold">
        <span className="rounded-md bg-gradient-to-br from-primary/15 to-secondary/15 p-2 text-primary">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-sm text-foreground/70">{desc}</p>
    </div>
  );
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-6">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-gradient-to-br from-primary to-secondary text-white p-2">{icon}</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-foreground/70">{desc}</p>
    </div>
  );
}
