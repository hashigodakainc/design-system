import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hashigodaka Design System — Process Archive",
  description: "Hashigodakaのデザインシステム制作過程で行った9つの比較と判断の記録。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
