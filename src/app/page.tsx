// src/app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">自発的学習促進システム</h1>
      <div className="flex flex-col gap-2">
        <Link href="/study-log" className="px-4 py-2 bg-blue-500 text-white rounded text-center">
          学習記録を書く
        </Link>
        <Link href="/study-log-list" className="px-4 py-2 bg-green-500 text-white rounded text-center">
          学習記録を確認する
        </Link>
      </div>
    </main>
  );
}
