"use client";

interface Props {
  displayName: string;
  onLogout: () => void;
  onGoStudyLog: () => void;
  onGoMyPage: () => void;
}

export default function HomeHeader({
  displayName,
  onLogout,
  onGoStudyLog,
  onGoMyPage,
}: Props) {
  return (
    <header className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold">ようこそ、{displayName}さん！</h2>
      <div>
        <button onClick={onGoStudyLog} className="mr-4 px-4 py-2 bg-green-400 rounded hover:bg-green-500 transition">
          記録
        </button>
        <button onClick={onGoMyPage} className="mr-4 px-4 py-2 bg-blue-400 rounded hover:bg-blue-500 transition">
          マイページ
        </button>
        <button onClick={onLogout} className="px-4 py-2 bg-red-400 rounded hover:bg-red-500 transition">
          ログアウト
        </button>
      </div>
    </header>
  );
}
