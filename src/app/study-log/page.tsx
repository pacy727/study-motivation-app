"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function StudyLogPage() {
  const [content, setContent] = useState("");
  const [time, setTime] = useState(0);
  const router = useRouter();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    if (!content || time <= 0) {
      alert("内容と時間を正しく入力してください");
      return;
    }

    await addDoc(collection(db, "studyLogs"), {
      userId: user.uid,
      content,
      time,
      createdAt: serverTimestamp(),
    });

    alert("記録しました！");
    router.push("/"); // ホームへ戻る
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">学習記録を書く</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="学習した内容を入力"
        className="w-full max-w-md h-32 border rounded p-2 mb-4"
      />

      <input
        type="number"
        value={time}
        onChange={(e) => setTime(Number(e.target.value))}
        placeholder="学習時間（分）"
        className="w-full max-w-md border rounded p-2 mb-4"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        記録する
      </button>
    </main>
  );
}
