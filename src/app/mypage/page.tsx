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
  doc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";

interface Log {
  id: string;
  content: string;
  time: number;
  createdAt?: Timestamp;
  subject?: string;
  userName?: string;
  userId: string;
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
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});
  const [weeklyGoal, setWeeklyGoal] = useState<number>(10);
  const [editingGoal, setEditingGoal] = useState(false);

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
        const date = log.createdAt?.toDate();
        if (date) {
          const dateStr = date.toISOString().split("T")[0];
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

  const today = new Date().toISOString().split("T")[0];
  const todayTime = logs
    .filter((log) => {
      const date = log.createdAt?.toDate();
      return date && date.toISOString().split("T")[0] === today;
    })
    .reduce((sum, log) => sum + (log.time || 0), 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weeklyTime = logs
    .filter((log) => {
      const date = log.createdAt?.toDate();
      return date && date >= weekAgo;
    })
    .reduce((sum, log) => sum + (log.time || 0), 0);

  const totalTime = logs.reduce((sum, log) => sum + (log.time || 0), 0);

  const subjectTimes: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.subject) {
      subjectTimes[log.subject] = (subjectTimes[log.subject] || 0) + log.time;
    }
  });

  const rankingMap: Record<string, number> = {};
  logs.forEach((log) => {
    rankingMap[log.userId] = (rankingMap[log.userId] || 0) + (log.time || 0);
  });
  const sortedRanking = Object.entries(rankingMap).sort((a, b) => b[1] - a[1]);
  const myRank = sortedRanking.findIndex(([id]) => id === user?.uid) + 1;


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


      <section className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">学習状況</h2>
        <p>累計学習時間：{totalTime}分</p>
        <p>今週の学習時間：{weeklyTime}分</p>
        <p>今日の学習時間：{todayTime}分</p>
        <p>勉強時間ランキング：{myRank}位</p>
       
      </section>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center mb-8">
                {["国", "数", "英", "理", "社", "情"].map((subj) => (
          <div key={subj} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-sm">{subj}</h3>
            <p className="text-lg font-bold">{subjectTimes[subj] || 0}分</p>
          </div>
        ))}
      </div>
      


      <section className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">週間目標</h2>
        {editingGoal ? (
          <div>
            <input
              type="number"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="border p-2 rounded mr-2"
            />
            <button
              onClick={() => setEditingGoal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              設定
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold">今週の目標：{weeklyGoal}時間</p>
            <button
              onClick={() => setEditingGoal(true)}
              className="px-4 py-2 bg-gray-500 text-white rounded mt-2"
            >
              目標を変更
            </button>
          </div>
        )}
      </section>

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
        <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">新しいToDoを追加</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="科目"
            className="border p-2 rounded w-full sm:w-1/3"
          />
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="単元"
            className="border p-2 rounded w-full sm:w-2/3"
          />
        </div>
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          追加
        </button>
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
