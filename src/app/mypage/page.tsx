"use client";

import { useState, useEffect } from "react";
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
import { onAuthStateChanged, User } from "firebase/auth";
import { Calendar } from "react-calendar";
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
  const [weeklyGoal, setWeeklyGoal] = useState<number>(10); // 時間単位に変更
  const [editingGoal, setEditingGoal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-10 px-4 bg-gradient-to-br from-blue-50 to-yellow-50 rounded-xl"
    >
      <h1 className="text-4xl font-bold text-center mb-8">マイページ</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">学習統計</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">累計勉強時間</p>
            <p>{logs.reduce((sum, log) => sum + log.time, 0)}分</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">週計勉強時間</p>
            <p>{logs.reduce((sum, log) => sum + log.time, 0)}分</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">本日の勉強時間</p>
            <p>{logs.filter(log => log.createdAt?.toDate().toDateString() === new Date().toDateString()).reduce((sum, log) => sum + log.time, 0)}分</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">順位</p>
            <p>3位</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">科目別勉強時間</h2>
        <div className="bg-white p-4 rounded shadow grid grid-cols-6 text-center">
          <p>国</p><p>数</p><p>英</p><p>理</p><p>社</p><p>情</p>
          <p>100分</p><p>200分</p><p>150分</p><p>180分</p><p>130分</p><p>70分</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-4">週間目標設定</h2>
        {!editingGoal ? (
          <div className="flex items-center gap-4">
            <p className="text-xl">現在の目標: {weeklyGoal}時間</p>
            <button onClick={() => setEditingGoal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">設定</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <input type="number" value={weeklyGoal} onChange={(e) => setWeeklyGoal(Number(e.target.value))} className="border p-2 rounded" />
            <button onClick={() => setEditingGoal(false)} className="bg-blue-500 text-white px-4 py-2 rounded">保存</button>
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
                  <div className="text-base font-semibold text-blue-600 whitespace-nowrap">{minutes > 0 ? `${minutes}分` : ""}</div>
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
