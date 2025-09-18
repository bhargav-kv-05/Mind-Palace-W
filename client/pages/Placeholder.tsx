import { Link, useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title =
    pathname === "/login"
      ? "Secure Access"
      : pathname === "/chat"
        ? "Ephemeral Chat"
        : pathname === "/library"
          ? "Motivational Library"
          : pathname === "/dashboard"
            ? "Admin Dashboard"
            : pathname.replace("/", "");

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)]" />
      <div className="container py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="mt-4 text-foreground/70">
            This section will be implemented next. Tell me what you want here and I'll build it: form flows, live chat with Socket.io, counselor verification, analytics, or anything else.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/" className="rounded-full px-5 py-2.5 bg-foreground text-background font-semibold">Back to Home</Link>
            <a href="#contact" className="rounded-full px-5 py-2.5 bg-gradient-to-br from-primary to-secondary text-white font-semibold">Request this page</a>
          </div>
        </div>
      </div>
    </section>
  );
}
