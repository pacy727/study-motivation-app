"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// コンポーネント
import HomeHeader from "../components/HomeHeader";
import SummarySection from "../components/SummarySection";
import RankingSection from "../components/RankingSection";
import ChartSection from "../components/ChartSection";
import RecordList from "../components/RecordList";

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

  // 目標値（分ベース）。600分 = 10時間
  const weeklyGoal = 600;

  // --------------------------
  // ユーザー監視
  // --------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --------------------------
  // ログ取得
  // --------------------------
  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "studyLogs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data: Log[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Log));
      setLogs(data);
    };

    if (user) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [user]);

  // --------------------------
  // イベントハンドラ
  // --------------------------
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

  // --------------------------
  // ログ計算
  // --------------------------
  const userLogs = logs.filter((log) => log.userId === user?.uid);
  const totalMyTime = userLogs.reduce((sum, log) => sum + (log.time || 0), 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  const weeklyLogs = userLogs.filter((log) => {
    const dt = log.createdAt?.toDate();
    return dt && dt >= oneWeekAgo;
  });
  const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + log.time, 0);
  const weeklyAchievement = ((weeklyTotal / weeklyGoal) * 100).toFixed(1);

  // グラフ用データ
  const barData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(oneWeekAgo);
    date.setDate(date.getDate() + i);
    const dayString = `${date.getMonth() + 1}/${date.getDate()}`;
    const dayLogs = weeklyLogs.filter((log) => {
      const dt = log.createdAt?.toDate();
      return dt && dt.toDateString() === date.toDateString();
    });
    const total = dayLogs.reduce((sum, log) => sum + log.time, 0);
    return { day: dayString, time: total };
  });

  // ランキング
  const rankingMap = logs.reduce((map, log) => {
    const userName = log.userName || log.userId;
    if (!map[userName]) map[userName] = 0;
    map[userName] += log.time || 0;
    return map;
  }, {} as Record<string, number>);
  const sortedRanking = Object.entries(rankingMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // 連続日数
  const streakDays = Array.from({ length: 30 }).reduce((streak: number, _, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const hasLog = userLogs.some((log) => {
      const dt = log.createdAt?.toDate();
      return dt && dt.toDateString() === date.toDateString();
    });
    return hasLog ? streak + 1 : streak > 0 ? streak : 0;
  }, 0);

  // --------------------------
  // 表示切替
  // --------------------------
  if (loading) {
    return <div className="text-center p-6 text-gray-500">読み込み中...</div>;
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-cyan-400 to-yellow-300 text-white">
        <h1 className="text-4xl font-extrabold mb-6">Ohtani Study Diary</h1>
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-white text-blue-500 font-semibold rounded shadow-lg hover:bg-gray-100 transition"
        >
          Googleでログイン
        </button>
      </main>
    );
  }

  // --------------------------
  // JSX
  // --------------------------
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-cyan-200 to-yellow-200 text-gray-900 rounded-xl shadow-xl"
    >
      {/* ヘッダー */}
      <HomeHeader
        displayName={user.displayName ?? "名無し"}
        onLogout={handleLogout}
        onGoStudyLog={() => router.push("/study-log")}
        onGoMyPage={() => router.push("/mypage")}
      />

      {/* サマリ表示 */}
      <SummarySection
        totalMyTime={totalMyTime}
        weeklyAchievement={weeklyAchievement}
        weeklyGoal={weeklyGoal}
        streakDays={streakDays}
      />

      {/* ランキング */}
      <RankingSection sortedRanking={sortedRanking} />

      {/* バーチャート */}
      <ChartSection barData={barData} />

      {/* 学習記録一覧 */}
      <RecordList userLogs={userLogs} />
    </motion.main>
  );
}
