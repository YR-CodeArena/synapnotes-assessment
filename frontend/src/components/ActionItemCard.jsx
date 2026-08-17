const priorityStyles = {
  High: "bg-rose-500/15 text-rose-500",
  Medium: "bg-amber-500/15 text-amber-500",
  Low: "bg-emerald-500/15 text-emerald-600",
};

const statusStyles = {
  Open: "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300",
  "In Progress": "border-amber-400 text-amber-500",
  Blocked: "border-rose-400 text-rose-500",
  Completed: "border-emerald-400 text-emerald-500",
};

export default function ActionItemCard({ item, onStatusChange, onSelect, draggable = false, onDragStart }) {
  return (
    <article
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, item)}
      className="sn-card cursor-pointer p-4"
      onClick={() => onSelect?.(item)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug">{item.task_description}</p>
        <span className={`sn-chip ${priorityStyles[item.priority] || priorityStyles.Medium}`}>{item.priority}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {item.owner} · {item.due_date}
      </p>
      {item.meeting_title && <p className="mt-1 truncate text-[11px] text-violet-500">{item.meeting_title}</p>}
      {onStatusChange && (
        <select
          className={`mt-3 w-full rounded-lg border bg-transparent px-2 py-1 text-xs ${statusStyles[item.status]}`}
          value={item.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onStatusChange(item, event.target.value)}
        >
          {["Open", "In Progress", "Blocked", "Completed"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      )}
    </article>
  );
}
