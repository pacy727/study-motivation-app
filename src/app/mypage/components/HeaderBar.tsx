"use client";
import { User } from "firebase/auth";

interface Props {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateStudyLog: () => void;
}

export default function HeaderBar({
  user,
  onLogout,
  onNavigateHome,
  onNavigateStudyLog,
}: Props) {
  return (
    <header className="flex justify-end items-center gap-4 mb-6">
      <span>{user?.displayName}</span>
      <button onClick={onNavigateHome} className="bg-blue-500 text-white px-3 py-1 rounded">
        ホーム
      </button>
      <button onClick={onNavigateStudyLog} className="bg-green-500 text-white px-3 py-1 rounded">
        記録
      </button>
      <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded">
        ログアウト
      </button>
    </header>
  );
}
