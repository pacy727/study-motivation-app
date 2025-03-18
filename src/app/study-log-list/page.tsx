"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function StudyLogList() {
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    const q = query(collection(db, "studyLogs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
