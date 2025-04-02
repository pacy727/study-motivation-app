"use client";

interface HeaderProps {
  displayName: string;
  onNavigate: (path: string) => void;
}

export default function Header({ displayName, onNavigate }: HeaderProps) {
  return (
    <header className="w-full flex justify-between items-center px-6 py-3 bg-white bg-opacity-80 shadow-md">
      <div className="text-sm text-gray-800">
        <p className="font-semibold">🧑‍🎓 {displayName}</p>
        <p className="text-xs">Lv.5 | EXP: 1234 | 累計学習時間: 300分</p>
      </div>
      <nav className="flex gap-3">
        {[
          { label: "ホーム", path: "/" },
          { label: "マイページ", path: "/mypage" },
          { label: "記録", path: "/study-log" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className="px-3 py-1 rounded-md text-gray-700 hover:bg-blue-100 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
