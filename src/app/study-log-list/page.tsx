"use client";

// Reactの機能やFirebaseの機能を読み込む
import { useEffect, useState } from "react";
import {
  onAuthStateChanged, // ログイン状態を見張る関数
  signInWithPopup,    // Googleでログインするための関数
  GoogleAuthProvider, // Google認証の設定
  User                // ユーザー情報の型
} from "firebase/auth";

import {
  collection, query, orderBy, getDocs, Timestamp
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase"; // Firebaseの設定を読み込む

// 学習記録のデータの形をあらかじめ決めておく
interface Log {
  id: string;
  content: string;
  userId: string;
  createdAt?: Timestamp;
}

// このページが実際に表示される関数
export default function Home() {
  // ユーザー情報を入れる場所（まだログインしていなければnull）
  const [user, setUser] = useState<User | null>(null);

  // 学習記録を入れるためのリスト（最初は空っぽ）
  const [logs, setLogs] = useState<Log[]>([]);

  // ページ読み込み中かどうかを管理する（最初はtrue＝読み込み中）
  const [loading, setLoading] = useState(true);

  // 最初にログインしているか確認する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);      // ユーザーがいたら保存
      setLoading(false);  // 読み込み終了
    });

    return () => unsubscribe(); // 後片付け（リスナーの解除）
  }, []);

  // Googleでログインする関数（ボタンを押したときに使う）
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider(); // Googleログインの準備
    try {
      const result = await signInWithPopup(auth, provider); // ポップアップでログイン実行
      setUser(result.user); // ログイン成功したらユーザーを保存
    } catch (error) {
      console.error("ログイン失敗", error); // エラーがあれば表示
    }
  };

  // Firestoreから学習記録を読み込む関数
  const fetchLogs = async () => {
    const q = query(
      collection(db, "studyLogs"),         // "studyLogs"という場所から
      orderBy("createdAt", "desc")         // 新しい順に並べて
    );
    const snapshot = await getDocs(q);     // データを取り出す
    const data: Log[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      content: doc.data().content,
      userId: doc.data().userId,
      createdAt: doc.data().createdAt,
    }));
    setLogs(data); // 画面に表示できるように保存
  };

  // ユーザーがログインしたあとに学習記録を読み込む
  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]); // 「user」が変わったときだけ動く

  // 読み込み中は「読み込み中...」を表示
  if (loading) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  // ログインしていなければ、ログインを促す画面を表示
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">ログインが必要</h1>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Google
        </button>
      </main>
    );
  }

  // ログイン済みの人には学習記録一覧を表示
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4">
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
