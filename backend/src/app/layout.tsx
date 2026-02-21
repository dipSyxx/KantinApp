import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KantinApp - Hamar Katedralskole",
  description:
    "Kantinesystem for Hamar Katedralskole. Se ukemenyer, stem på retter og hold deg oppdatert.",
  other: {
    "apple-mobile-web-app-title": "KantinApp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="bg-surface text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
