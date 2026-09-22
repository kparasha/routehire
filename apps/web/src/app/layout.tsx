import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RouteHire — Local hauler jobs, home every night",
  description:
    "Build a free driver profile for local waste & recycling seats. No resume. Haulers call when you match.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=Barlow+Condensed:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="top">
          <a className="brand" href="/">
            RouteHire
          </a>
          <a href="/intake">Drivers</a>
          <a href="/hauler">Hiring</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
