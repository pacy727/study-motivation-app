"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SUBJECTS = ["国語", "数学", "英語", "社会", "理科", "その他"];

function StudyLogForm({ subject, setSubject }: { subject: string; setSubject: (val: string) => void }) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [time, setTime] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    if (!content || !time || isNaN(Number(time)) || Number(time) <= 0) {
      alert("内容と学習時間を正しく入力してください");
      return;
    }

    await addDoc(collection(db, "studyLogs"), {
      userId: user.uid,
      userName: user.displayName || "",
      content,
      subject,
      time: Number(time),
      createdAt: serverTimestamp(),
      manualDate: date,
    });

    alert("記録しました！");
    router.push("/");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">📘 学習記録を書く</h1>

      <label className="block mb-2 font-semibold">📅 日付</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />

      <label className="block mb-2 font-semibold">📚 教科</label>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      >
        {SUBJECTS.map((subj) => (
          <option key={subj} value={subj}>{subj}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">📝 内容</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="学習した内容を入力"
        className="w-full h-32 border rounded p-2 mb-4"
      />

      <label className="block mb-2 font-semibold">⏱️ 学習時間（分）</label>
      <input
        type="text"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="例：60"
        className="w-full border rounded p-2 mb-6"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
      >
        ✅ 記録する
      </button>
    </div>
  );
}

export default function StudyLogPage() {
  const [subject, setSubject] = useState("国語");
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-cyan-200 to-yellow-200 text-gray-900">
      <Header displayName={user?.displayName ?? "名無し"} onNavigate={(path) => router.push(path)} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-grow p-4 max-w-3xl mx-auto w-full"
      >
        <StudyLogForm subject={subject} setSubject={setSubject} />
      </motion.main>
      <Footer onLogout={handleLogout} />
    </div>
  );
}
