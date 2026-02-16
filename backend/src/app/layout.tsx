import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KantinApp - Hamar Katedralskole",
  description: "Canteen menu management and voting system",
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
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
