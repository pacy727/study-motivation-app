"use client";

import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
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
import { auth, db } from "@/lib/firebase";

interface Log {
  id: string;
  content: string;
  userId: string;
  createdAt?: Timestamp;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Firebaseリダイレクトから戻ったときの処理
  useEffect(() => {
    const fetchRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error("リダイレクト結果取得エラー", error);
      }
    };

    fetchRedirectResult();
  }, []);

  // 🔁 ページ初回ロード時の認証チェック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔁 Googleログイン処理（リダイレクト方式）
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  // 🔁 ログアウト処理
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); // 状態を初期化
  };

  // 🔁 学習記録をFirestoreから取得
  const fetchLogs = async () => {
    const q = query(collection(db, "studyLogs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data: Log[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      content: doc.data().content,
      userId: doc.data().userId,
      createdAt: doc.data().createdAt,
    }));
    setLogs(data);
  };

  // 🔁 ユーザーがログイン済みのときに記録を取得
  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  // 🔁 ローディング中の画面
  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  // 🔁 ログインしていないときの画面
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Googleでログイン
        </button>
      </main>
    );
  }

  // ✅ ログイン後の画面（学習記録 + ログアウト）
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 relative">
      {/* 右上にログアウトボタン */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded"
      >
        ログアウト
      </button>

      <h1 className="text-2xl font-bold mb-4">学習記録一覧</h1>
      <ul className="w-full">
        {logs.map((log) => (
          <li key={log.id} className="border-b border-gray-300 py-2">
            {log.content}
          </li>
        ))}
      </ul>
    </main>
  );
}
