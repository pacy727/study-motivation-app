"use client";

import Calendar from "react-calendar";

interface Props {
  calendarData: Record<string, number>;
}

export default function MyCalendar({ calendarData }: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4">勉強時間カレンダー</h2>
      <div className="bg-white p-4 rounded shadow text-center max-w-xl mx-auto">
        <Calendar
          tileContent={({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            const minutes = calendarData[dateStr] || 0;
            return (
              <div className="text-center">
                <div className="text-base font-semibold text-blue-600 whitespace-nowrap">
                  {minutes > 0 ? `${minutes}分` : ""}
                </div>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
