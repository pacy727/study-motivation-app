"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface BarData {
  day: string;
  time: number;
}

interface Props {
  barData: BarData[];
}

export default function ChartSection({ barData }: Props) {
  return (
    <section className="h-72 mb-8">
      <ResponsiveContainer>
        <BarChart data={barData}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="time" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
