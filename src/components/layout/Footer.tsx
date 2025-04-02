"use client";

interface FooterProps {
  onLogout: () => void;
}

export default function Footer({ onLogout }: FooterProps) {
  return (
    <footer className="w-full flex justify-end items-center px-6 py-3 bg-white bg-opacity-80 shadow-md">
      <nav className="flex gap-4">
        <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-200 transition-colors">
          設定
        </button>
        <button
          onClick={onLogout}
          className="px-3 py-1 rounded-md text-red-500 hover:bg-red-100 transition-colors"
        >
          ログアウト
        </button>
      </nav>
    </footer>
  );
}
