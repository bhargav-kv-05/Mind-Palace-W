import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-background/60">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg">MindPalace</h3>
          <p className="text-sm text-foreground/70 mt-2">
            Secure, anonymous, and humanized psychological support for students in J&K and beyond.
          </p>
        </div>
        <div className="flex justify-start md:justify-end gap-6 items-start">
          <div>
            <h4 className="text-sm font-semibold mb-2">Legal</h4>
            <ul className="space-y-1 text-sm text-foreground/70">
              <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-foreground/70">© {new Date().getFullYear()} MindPalace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
