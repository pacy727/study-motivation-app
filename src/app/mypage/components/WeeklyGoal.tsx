"use client";

interface Props {
  weeklyGoal: number;
  setWeeklyGoal: (val: number) => void;
  editingGoal: boolean;
  setEditingGoal: (val: boolean) => void;
}

export default function WeeklyGoal({
  weeklyGoal,
  setWeeklyGoal,
  editingGoal,
  setEditingGoal,
}: Props) {
  return (
    <section className="mb-6 bg-white p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">週間目標</h2>
      {editingGoal ? (
        <div>
          <input
            type="number"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value))}
            className="border p-2 rounded mr-2"
          />
          <button
            onClick={() => setEditingGoal(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            設定
          </button>
        </div>
      ) : (
        <div>
          <p className="text-lg font-semibold">今週の目標：{weeklyGoal}時間</p>
          <button
            onClick={() => setEditingGoal(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded mt-2"
          >
            目標を変更
          </button>
        </div>
      )}
    </section>
  );
}
