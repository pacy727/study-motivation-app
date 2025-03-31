"use client";

interface Props {
  totalMyTime: number;
  weeklyAchievement: string;
  weeklyGoal: number;
  streakDays: number;
}

export default function SummarySection({
  totalMyTime,
  weeklyAchievement,
  weeklyGoal,
  streakDays,
}: Props) {
  return (
    <section className="mb-6 text-center">
      <p className="text-xl font-semibold mt-1">📚 累計学習時間：{totalMyTime}分</p>
      <p className="text-2xl font-semibold">
        今週の達成率：{weeklyAchievement}%（目標 {weeklyGoal / 60}時間）
      </p>
      <p className="text-xl font-semibold mt-2">🔥 連続学習日数：{streakDays}日</p>
    </section>
  );
}
