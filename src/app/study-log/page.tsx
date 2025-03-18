"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function StudyLog() {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("ログインが必要です！");
      return;
    }
    await addDoc(collection(db, "studyLogs"), {
      content: content,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
    alert("学習記録を保存しました！");
    setContent("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">学習記録ログ</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日の学習内容を入力"
        className="border border-gray-300 rounded w-full p-2"
      ></textarea>
      <button
        onClick={handleSubmit}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        記録を保存
      </button>
    </main>
  );
}
