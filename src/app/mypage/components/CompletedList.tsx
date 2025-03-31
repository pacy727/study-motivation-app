"use client";

interface Task {
  id: string;
  subject: string;
  topic: string;
  completed: boolean;
}

interface Props {
  tasks: Task[];
}

export default function CompletedList({ tasks }: Props) {
  const completedSubjects = Array.from(new Set(tasks.filter(t => t.completed).map(t => t.subject)));

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4">習得済み知識リスト</h2>
      {completedSubjects.map((subject) => (
        <details key={subject} className="bg-white p-4 rounded shadow mb-2">
          <summary className="cursor-pointer font-semibold">{subject}</summary>
          <ul className="pl-4 list-disc">
            {tasks.filter(t => t.completed && t.subject === subject).map(t => (
              <li key={t.id}>{t.topic}</li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}
