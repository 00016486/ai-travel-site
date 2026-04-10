import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOURLY.UZ",
  description: "TOURLY.UZ - Uzbekistan smart AI travel planner"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="scroll-smooth">{children}</body>
    </html>
  );
}
