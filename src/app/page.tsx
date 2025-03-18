"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // ← ここが明確な型指定
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // as any を完全に削除済み
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded">
          Googleでログインする
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">自発的学習促進システム</h1>
      <div className="flex flex-col gap-2">
        <Link
          href="/study-log"
          className="px-4 py-2 bg-blue-500 text-white rounded text-center"
        >
          学習記録を書く
        </Link>
        <Link
          href="/study-log-list"
          className="px-4 py-2 bg-green-500 text-white rounded text-center"
        >
          学習記録を確認する
        </Link>
      </div>
    </main>
  );
}
