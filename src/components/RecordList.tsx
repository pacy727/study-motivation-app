"use client";
import { Timestamp } from "firebase/firestore";

interface Log {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  time: number;
  createdAt?: Timestamp;
}

interface Props {
  userLogs: Log[];
}

export default function RecordList({ userLogs }: Props) {
  return (
    <section>
      <h3 className="text-2xl font-semibold mb-4">📖 あなたの学習記録</h3>
      <ul className="list-disc pl-5">
        {userLogs.map((log) => (
          <li key={log.id}>
            {log.content}（{log.time}分）
          </li>
        ))}
      </ul>
    </section>
  );
}
