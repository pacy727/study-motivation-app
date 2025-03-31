"use client";

// interface RankingInfo {
//   [key: string]: number;
// }

interface Props {
  // e.g. [[username, {time:number}], ...]
  sortedRanking: [string, number][];
}

export default function RankingSection({ sortedRanking }: Props) {
  return (
    <section className="mb-8">
      <h3 className="text-2xl font-semibold mb-4">🏅 学習時間ランキング</h3>
      <ol className="list-decimal list-inside space-y-1">
        {sortedRanking.map(([name, time], idx) => (
          <li key={idx}>
            {name}：{time}分
          </li>
        ))}
      </ol>
    </section>
  );
}
