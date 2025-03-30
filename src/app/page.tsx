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
import { motion } from "framer-motion";

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

  const weeklyGoal = 600;

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
    if (user) fetchLogs();
    else setLogs([]);
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
  const weeklyLogs = userLogs.filter(
    (log) => log.createdAt?.toDate() && log.createdAt.toDate() >= oneWeekAgo
  );
  const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + (log.time || 0), 0);
  const weeklyAchievement = ((weeklyTotal / weeklyGoal) * 100).toFixed(1);

  const barData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(oneWeekAgo);
    date.setDate(date.getDate() + i);
    const dayString = `${date.getMonth() + 1}/${date.getDate()}`;
    const total = weeklyLogs
      .filter((log) => log.createdAt?.toDate()?.toDateString() === date.toDateString())
      .reduce((sum, log) => sum + (log.time || 0), 0);
    return { day: dayString, time: total };
  });

  const sortedRanking = Array.from(
    logs.reduce((map, log) => {
      const userEntry = map.get(log.userId) || { name: log.userName || log.userId, time: 0 };
      userEntry.time += log.time;
      map.set(log.userId, userEntry);
      return map;
    }, new Map())
  )
    .sort((a, b) => b[1].time - a[1].time)
    .slice(0, 10);

  const streakDays = Array.from({ length: 30 }).reduce((streak: number, _, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const hasLog = userLogs.some(
      (log) => log.createdAt?.toDate()?.toDateString() === date.toDateString()
    );
    return hasLog ? streak + 1 : streak > 0 ? streak : 0;
  }, 0);

  if (loading) return <div className="text-center p-6 text-gray-500">読み込み中...</div>;

  if (!user)
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-cyan-400 to-yellow-300 text-white">
        <h1 className="text-4xl font-extrabold mb-6">Ohtani Study Diary</h1>
        <button onClick={handleLogin} className="px-6 py-2 bg-white text-blue-500 font-semibold rounded shadow-lg hover:bg-gray-100 transition">
          Googleでログイン
        </button>
      </main>
    );

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-cyan-200 to-yellow-200 text-gray-900 rounded-xl shadow-xl"
    >
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">ようこそ、{user.displayName}さん！</h2>
        <div>
          <button onClick={() => router.push("/study-log")} className="mr-4 px-4 py-2 bg-green-400 rounded hover:bg-green-500 transition">
            記録
          </button>
          <button onClick={() => router.push("/mypage")} className="mr-4 px-4 py-2 bg-blue-400 rounded hover:bg-blue-500 transition">
            マイページ
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-400 rounded hover:bg-red-500 transition">
            ログアウト
          </button>
        </div>
      </header>

      <section className="mb-6 text-center">
        <p className="text-xl font-semibold mt-1">📚 累計学習時間：{totalMyTime}分</p>
        <p className="text-2xl font-semibold">  今週の達成率：{weeklyAchievement}%（目標{weeklyGoal / 60}時間）</p>
        <p className="text-xl font-semibold mt-2">🔥 連続学習日数：{streakDays}日</p>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">🏅 学習時間ランキング</h3>
        <ol className="list-decimal list-inside space-y-1">
          {sortedRanking.map(([, info], idx) => (
            <li key={idx}>{info.name}：{info.time}分</li>
          ))}
        </ol>
      </section>

      <section className="h-72 mb-8">
        <ResponsiveContainer>
          <BarChart data={barData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="time" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">📖 あなたの学習記録</h3>
        <ul className="list-disc pl-5">
          {userLogs.map((log) => (
            <li key={log.id}>{log.content}（{log.time}分）</li>
          ))}
        </ul>
      </section>
    </motion.main>
  );
}
