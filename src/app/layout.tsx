import type { Metadata } from "next";
//import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";


export const metadata: Metadata = {
  title: "Ohtani Study Diary",
  description: "自発的に勉強意欲を刺激する学習記録システム",
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-zenMaru">{children}</body>
    </html>
  );
}


