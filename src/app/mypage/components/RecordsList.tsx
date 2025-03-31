"use client";
import { Timestamp } from "firebase/firestore";

interface Log {
  id: string;
  content: string;
  time: number;
  createdAt?: Timestamp;
  subject?: string;
  userName?: string;
  userId: string;
}

interface Props {
  logs: Log[];
}

export default function RecordsList({ logs }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">学習記録一覧</h2>
      <ul className="bg-white p-4 rounded shadow">
        {logs.map((log) => (
          <li key={log.id}>
            {log.content} - {log.time}分
          </li>
        ))}
      </ul>
    </section>
  );
}
