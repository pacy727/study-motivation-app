"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Log {
  id: string;
  content: string;
  userId: string;
  createdAt?: Timestamp;
}

export default function StudyLogList() {
  const [logs, setLogs] = useState<Log[]>([]);

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
