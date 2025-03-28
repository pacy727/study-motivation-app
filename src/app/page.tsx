"use client";

import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 ユーザー状態監視（これが最重要！）
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 認証済みなら /home に遷移
  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [loading, user, router]);

  // 🔹 リダイレクト結果の取得（ここではsetUserしない）
  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("リダイレクト後のログイン失敗:", error);
    });
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">自発的学習促進システム</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Googleでログイン
      </button>
    </main>
  );
}
