import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Political Baby Generator — Totally Scientific™",
  description:
    "A fictional parody generator: pick two public figures and create a stylized cartoon baby avatar. Not a biological, genetic or medical prediction.",
  applicationName: "Political Baby Generator",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d0d14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
