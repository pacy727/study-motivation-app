"use client";

import React, { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; // ←ご自身のFirebase初期化ファイルをimport

interface Log {
  id: string;
  content: string;
  userId: string;
  time: number;
  createdAt?: Timestamp;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ★ onAuthStateChanged でログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("onAuthStateChanged:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ★ ログイン済ユーザーなら学習ログを取得
  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "studyLogs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Log[];
      setLogs(data);
    };

    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [user]);

  // Googleでログイン（リダイレクト方式）
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  // ログアウト
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 自分の合計学習時間
  const totalMyTime = logs
    .filter((log) => log.userId === user?.uid)
    .reduce((sum, log) => sum + (log.time || 0), 0);

  // ユーザーごとのランキング
  const rankingObj = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.userId] = (acc[log.userId] || 0) + (log.time || 0);
    return acc;
  }, {});
  const sortedRanking = Object.entries(rankingObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // ローディング中の表示
  if (loading) {
    return <div>読み込み中...</div>;
  }

  // ログインしていないときの表示
  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">自発的学習促進システム</h1>
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Googleでログイン
        </button>
      </main>
    );
  }

  // ログイン済ユーザー向けのページ表示
  return (
    <main className="p-4">
      <header className="flex justify-end items-center gap-4 mb-6">
        <span>{user.displayName} さん</span>
        <button
          onClick={() => router.push("/study-log")}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          記録する
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
          ログアウト
        </button>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">学習時間ランキング</h2>
        <ol className="list-decimal pl-5">
          {sortedRanking.map(([uid, time], index) => (
            <li key={index}>
              {uid}：{time}分
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold">
          あなたの学習時間：{totalMyTime}分
        </h2>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">あなたの学習記録</h2>
        <ul className="list-disc pl-5">
          {logs
            .filter((log) => log.userId === user.uid)
            .map((log) => (
              <li key={log.id}>
                {log.content}（{log.time}分）
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
