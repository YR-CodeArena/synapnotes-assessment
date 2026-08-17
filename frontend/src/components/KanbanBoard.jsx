import { useState } from "react";
import ActionItemCard from "./ActionItemCard";

const COLUMNS = [
  { key: "Open", accent: "border-slate-400" },
  { key: "In Progress", accent: "border-amber-400" },
  { key: "Blocked", accent: "border-rose-400" },
  { key: "Completed", accent: "border-emerald-400" },
];

export default function KanbanBoard({ items, onStatusChange, onSelect }) {
  const [draggingId, setDraggingId] = useState(null);

  const handleDrop = (status) => {
    const item = items.find((entry) => entry.id === draggingId);
    if (item && item.status !== status) {
      onStatusChange(item, status);
    }
    setDraggingId(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((column) => (
        <section
          key={column.key}
          className={`rounded-2xl border-t-4 bg-slate-100/70 p-3 dark:bg-slate-900/40 ${column.accent}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(column.key)}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{column.key}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs dark:bg-[#111622]">
              {items.filter((item) => item.status === column.key).length}
            </span>
          </div>
          <div className="space-y-3">
            {items
              .filter((item) => item.status === column.key)
              .map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  draggable
                  onDragStart={(_, current) => setDraggingId(current.id)}
                  onStatusChange={onStatusChange}
                  onSelect={onSelect}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
