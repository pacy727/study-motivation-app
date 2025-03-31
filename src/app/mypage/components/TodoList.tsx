"use client";

interface Task {
  id: string;
  subject: string;
  topic: string;
  completed: boolean;
}

interface Props {
  tasks: Task[];
  newSubject: string;
  setNewSubject: (val: string) => void;
  newTopic: string;
  setNewTopic: (val: string) => void;
  handleAddTask: () => void;
  handleToggleComplete: (task: Task) => void;
}

export default function TodoList({
  tasks,
  newSubject,
  setNewSubject,
  newTopic,
  setNewTopic,
  handleAddTask,
  handleToggleComplete,
}: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4">StudyToDoリスト</h2>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">新しいToDoを追加</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="科目"
            className="border p-2 rounded w-full sm:w-1/3"
          />
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="単元"
            className="border p-2 rounded w-full sm:w-2/3"
          />
        </div>
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded">
          追加
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.filter((t) => !t.completed).map((task) => (
          <li key={task.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={task.completed} onChange={() => handleToggleComplete(task)} />
              {task.subject} - {task.topic}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
