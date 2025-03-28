"use client";

import { useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // リダイレクトログイン直後の結果を取得
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        router.push("/home");
      }
    });

    // ログイン済みであれば自動で /home に遷移
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/home");
      }
    });

    return () => unsubscribe();
  }, [router]);

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
