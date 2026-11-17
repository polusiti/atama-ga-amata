import type { Metadata } from "next";
import type { ReactNode } from "react";
import "98.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "atamagazon | When the back-and-forth with an AI stalls",
  description:
    "Tell the shopkeeper what hurts, not what to build. A deterministic, LLM-free engine closes the gap between what you ask for and what you need.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
