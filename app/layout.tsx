import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Code Drill",
  description: "A 10-minute, no-AI-assist coding rep, once a day, per framework.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
