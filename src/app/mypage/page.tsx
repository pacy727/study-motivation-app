"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";

interface Log {
  id: string;
  content: string;
  time: number;
  createdAt?: any;
}

interface Task {
  id: string;
  subject: string;
  topic: string;
  completed: boolean;
}

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(10);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const q = query(
        collection(db, "studyLogs"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Log));
      setLogs(fetchedLogs);

      const calendarMap: Record<string, number> = {};
      fetchedLogs.forEach((log) => {
        const dateStr = log.createdAt?.toDate().toISOString().split("T")[0];
        if (dateStr) {
          calendarMap[dateStr] = (calendarMap[dateStr] || 0) + log.time;
        }
      });
      setCalendarData(calendarMap);
    };

    const fetchTasks = async () => {
      const q = query(collection(db, "studyTasks"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task)));
    };

    fetchLogs();
    fetchTasks();
  }, [user]);

  const handleAddTask = async () => {
    if (!newSubject || !newTopic || !user) return;
    const newTask = {
      userId: user.uid,
      subject: newSubject,
      topic: newTopic,
      completed: false,
    };
    const docRef = await addDoc(collection(db, "studyTasks"), newTask);
    setTasks([{ id: docRef.id, ...newTask }, ...tasks]);
    setNewSubject("");
    setNewTopic("");
  };

  const handleToggleComplete = async (task: Task) => {
    const ref = doc(db, "studyTasks", task.id);
    await updateDoc(ref, { completed: !task.completed });
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-10 px-4 bg-gradient-to-br from-lime-100 via-teal-100 to-blue-200 rounded-xl"
    >
      <header className="flex justify-end items-center gap-4 mb-6">
        <span>{user?.displayName}</span>
        <button onClick={() => router.push("/")} className="bg-blue-500 text-white px-3 py-1 rounded">
          ホーム
        </button>
        <button onClick={() => router.push("/study-log")} className="bg-green-500 text-white px-3 py-1 rounded">
          記録
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
          ログアウト
        </button>
      </header>

      <h1 className="text-4xl font-bold text-center mb-8">マイページ</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">勉強時間カレンダー</h2>
        <div className="bg-white p-4 rounded shadow text-center max-w-xl mx-auto">
          <Calendar
            tileContent={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              const minutes = calendarData[dateStr] || 0;
              return (
                <div className="text-center">
                  <div className="text-base font-semibold text-blue-600 whitespace-nowrap">
                    {minutes > 0 ? `${minutes}分` : ""}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </section>
   

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">StudyToDoリスト</h2>
        <div className="bg-white p-4 rounded shadow mb-4">
          <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="border p-2 rounded mr-2">
            <option value="">科目を選択</option>
            <option value="国語">国語</option>
            <option value="数学">数学</option>
            <option value="英語">英語</option>
            <option value="理科">理科</option>
            <option value="社会">社会</option>
            <option value="情報">情報</option>
          </select>
          <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="単元を入力" className="border p-2 rounded mr-2" />
          <button onClick={handleAddTask} className="px-4 py-2 bg-green-500 text-white rounded">追加</button>
        </div>

        <ul className="space-y-2">
          {tasks.filter((t) => !t.completed).map((task) => (
            <li key={task.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={task.completed} onChange={() => handleToggleComplete(task)} />
                {task.subject} - {task.topic}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">習得済み知識リスト</h2>
        {Array.from(new Set(tasks.filter(t => t.completed).map(t => t.subject))).map(subject => (
          <details key={subject} className="bg-white p-4 rounded shadow mb-2">
            <summary className="cursor-pointer font-semibold">{subject}</summary>
            <ul className="pl-4 list-disc">
              {tasks.filter(t => t.completed && t.subject === subject).map(t => (
                <li key={t.id}>{t.topic}</li>
              ))}
            </ul>
          </details>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">学習記録一覧</h2>
        <ul className="bg-white p-4 rounded shadow">
          {logs.map((log) => (
            <li key={log.id}>{log.content} - {log.time}分</li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
}
