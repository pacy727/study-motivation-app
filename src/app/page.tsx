"use client";

import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
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
import { auth, db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Log {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  time: number;
  createdAt?: Timestamp;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("ログイン失敗:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const userLogs = logs.filter((log) => log.userId === user?.uid);
  const totalMyTime = userLogs.reduce((sum, log) => sum + (log.time || 0), 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  const weeklyLogs = userLogs.filter((log) => log.createdAt?.toDate() && log.createdAt.toDate() >= oneWeekAgo);
  const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + (log.time || 0), 0);

  const barData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(oneWeekAgo);
    date.setDate(date.getDate() + i);
    const dayString = `${date.getMonth() + 1}/${date.getDate()}`;
    const total = weeklyLogs
      .filter((log) => log.createdAt?.toDate() && log.createdAt.toDate().toDateString() === date.toDateString())
      .reduce((sum, log) => sum + (log.time || 0), 0);
    return { day: dayString, time: total };
  });

  const rankingMap = new Map<string, { name: string; time: number }>();
  logs.forEach((log) => {
    const current = rankingMap.get(log.userId);
    const name = log.userId === user?.uid ? user.displayName || log.userId : log.userName || log.userId;
    if (current) {
      current.time += log.time || 0;
    } else {
      rankingMap.set(log.userId, { name, time: log.time || 0 });
    }
  });

  const sortedRanking = Array.from(rankingMap.entries())
    .sort((a, b) => b[1].time - a[1].time)
    .slice(0, 10);

  if (loading) return <div>読み込み中...</div>;

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
          {sortedRanking.map(([, info], index) => (
            <li key={index}>{info.name}：{info.time}分</li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold">あなたの学習時間</h2>
        <p>累計：{totalMyTime}分</p>
        <p>今週：{weeklyTotal}分</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="time" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">あなたの学習記録</h2>
        <ul className="list-disc pl-5">
          {userLogs.map((log) => (
            <li key={log.id}>{log.content}（{log.time}分）</li>
          ))}
        </ul>
      </section>
    </main>
  );
}