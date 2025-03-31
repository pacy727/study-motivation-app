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

export default function StudyStats({ logs }: Props) {
  // 本日
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTime = logs
    .filter((log) => {
      const date = log.createdAt?.toDate();
      return date && date.toISOString().split("T")[0] === todayStr;
    })
    .reduce((sum, log) => sum + (log.time || 0), 0);

  // 週間
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weeklyTime = logs
    .filter((log) => {
      const date = log.createdAt?.toDate();
      return date && date >= weekAgo;
    })
    .reduce((sum, log) => sum + (log.time || 0), 0);

  // 累計
  const totalTime = logs.reduce((sum, log) => sum + (log.time || 0), 0);

  // ランキング
  const rankingMap: Record<string, number> = {};
  logs.forEach((log) => {
    rankingMap[log.userId] = (rankingMap[log.userId] || 0) + (log.time || 0);
  });
  const sortedRanking = Object.entries(rankingMap).sort((a, b) => b[1] - a[1]);
  // 仮に自分のIDが "xxx" としてもいいですが、このコンポーネントは受け取っていない
  // MyPage側でRankを計算するなら propsにmyRankを渡してもOKです
  const myRank = "??";

  // 科目別
  const subjectTimes: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.subject) {
      subjectTimes[log.subject] = (subjectTimes[log.subject] || 0) + log.time;
    }
  });

  return (
    <section className="mb-6 bg-white p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">学習状況</h2>
      <p>累計学習時間：{totalTime}分</p>
      <p>今週の学習時間：{weeklyTime}分</p>
      <p>今日の学習時間：{todayTime}分</p>
      <p>勉強時間ランキング：{myRank}位</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center mt-4">
        {["国", "数", "英", "理", "社", "情"].map((subj) => (
          <div key={subj} className="bg-gray-50 p-2 rounded shadow">
            <h3 className="font-semibold text-sm">{subj}</h3>
            <p className="text-lg font-bold">{subjectTimes[subj] || 0}分</p>
          </div>
        ))}
      </div>
    </section>
  );
}
