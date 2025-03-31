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

import { motion } from "framer-motion";
import "react-calendar/dist/Calendar.css";

// コンポーネントたち
import HeaderBar from "./components/HeaderBar";
import StudyStats from "./components/StudyStats";
import WeeklyGoal from "./components/WeeklyGoal";
import MyCalendar from "./components/MyCalendar";
import TodoList from "./components/TodoList";
import CompletedList from "./components/CompletedList";
import RecordsList from "./components/RecordsList";

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
  // --------------------------
  // ステート管理
  // --------------------------
  const [user, setUser] = useState<User | null>(null);

  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});
  const [weeklyGoal, setWeeklyGoal] = useState<number>(10);
  const [editingGoal, setEditingGoal] = useState(false);

  const router = useRouter();

  // --------------------------
  // ユーザー認証
  // --------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  // --------------------------
  // Firestoreからログ＆タスクを取得
  // --------------------------
  useEffect(() => {
    if (!user) return;

    // 学習ログ取得
    const fetchLogs = async () => {
      const q = query(
        collection(db, "studyLogs"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Log));
      setLogs(fetchedLogs);

      // カレンダー用
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

    // タスク取得
    const fetchTasks = async () => {
      const q = query(collection(db, "studyTasks"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task)));
    };

    fetchLogs();
    fetchTasks();
  }, [user]);

  // --------------------------
  // ToDoリスト操作
  // --------------------------
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

  // --------------------------
  // ログアウト
  // --------------------------
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // --------------------------
  // JSX描画
  // --------------------------
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-10 px-4 bg-gradient-to-br from-lime-100 via-teal-100 to-blue-200 rounded-xl"
    >
      {/* ヘッダー */}
      <HeaderBar
        user={user}
        onLogout={handleLogout}
        onNavigateHome={() => router.push("/")}
        onNavigateStudyLog={() => router.push("/study-log")}
      />

      <h1 className="text-4xl font-bold text-center mb-8">マイページ</h1>

      {/* 学習状況（累計・週間・本日・順位・科目別など） */}
      <StudyStats logs={logs} />

      {/* 週間目標 */}
      <WeeklyGoal
        editingGoal={editingGoal}
        setEditingGoal={setEditingGoal}
        weeklyGoal={weeklyGoal}
        setWeeklyGoal={setWeeklyGoal}
      />

      {/* カレンダー表示 */}
      <MyCalendar calendarData={calendarData} />

      {/* ToDoリスト */}
      <TodoList
        tasks={tasks}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        newTopic={newTopic}
        setNewTopic={setNewTopic}
        handleAddTask={handleAddTask}
        handleToggleComplete={handleToggleComplete}
      />

      {/* 習得済み知識リスト */}
      <CompletedList tasks={tasks} />

      {/* 学習記録一覧 */}
      <RecordsList logs={logs} />
    </motion.div>
  );
}
