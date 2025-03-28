"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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

  // ログインチェック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  // 学習記録の取得
  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "studyLogs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data: Log[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Log[];
      setLogs(data);
    };
    if (user) fetchLogs();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const totalMyTime = logs.filter((log) => log.userId === user?.uid).reduce((sum, log) => sum + (log.time || 0), 0);

  const ranking = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.userId] = (acc[log.userId] || 0) + (log.time || 0);
    return acc;
  }, {});

  const sortedRanking = Object.entries(ranking).sort((a, b) => b[1] - a[1]).slice(0, 10);

  if (loading) return <div>読み込み中...</div>;

  if (!user) return null; // ログイン未検出時の安全対策

  return (
    <main className="p-4">
      <header className="flex justify-end items-center gap-4 mb-6">
        <span>{user.displayName}</span>
        <button onClick={() => router.push("/study-log")} className="bg-green-500 text-white px-3 py-1 rounded">
          記録
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
          ログアウト
        </button>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">学習時間ランキング</h2>
        <ol className="list-decimal pl-5">
          {sortedRanking.map(([uid, time], index) => (
            <li key={index}>{uid}：{time}分</li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold">あなたの学習時間：{totalMyTime}分</h2>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">あなたの学習記録</h2>
        <ul className="list-disc pl-5">
          {logs.filter((log) => log.userId === user.uid).map((log) => (
            <li key={log.id}>
              {log.content}（{log.time}分）
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
