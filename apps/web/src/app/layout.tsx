import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RouteHire — Waste industry hiring",
  description: "Free career coach for candidates. Outcome-based recruiting for haulers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="top">
          <a href="/">RouteHire</a>
          <a href="/jobs">Jobs</a>
          <a href="/intake">Find work</a>
          <a href="/hauler">Haulers</a>
          <a href="/press">Press</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
