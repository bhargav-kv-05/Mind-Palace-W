import { ReactNode } from "react";
import Header from "../site/Header";
import Footer from "../site/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
