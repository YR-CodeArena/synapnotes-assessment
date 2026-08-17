import { Calendar, Sparkles, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function estimateDuration(meeting) {
  const words = (meeting.summary?.purpose || "").split(/\s+/).length + (meeting.participants?.length || 0) * 12;
  const minutes = Math.min(90, Math.max(25, Math.round(words / 2) * 5 || 45));
  return `${minutes} min`;
}

export default function MeetingCard({ meeting, onDelete }) {
  const navigate = useNavigate();
  const snippet = meeting.summary?.purpose || "AI summary pending.";

  return (
    <article className="sn-card flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="sn-chip bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{meeting.meeting_type}</p>
          <h3 className="mt-2 text-base font-semibold leading-snug">{meeting.title}</h3>
        </div>
        {meeting.ai_processed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/10 px-2 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300">
            <Sparkles size={12} />
            AI
          </span>
        )}
      </div>
      <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{snippet}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Calendar size={13} />
          {meeting.meeting_date}
        </span>
        <span>{estimateDuration(meeting)}</span>
        <span className="inline-flex items-center gap-1">
          <Users size={13} />
          {meeting.participants?.length || 0}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(meeting.participants || []).slice(0, 5).map((person) => (
          <span key={person} className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-[10px] font-bold dark:bg-slate-800">
            {person.slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="sn-btn-primary flex-1" onClick={() => navigate(`/meetings/${meeting.id}`)}>
          View
        </button>
        <button
          type="button"
          className="sn-btn-ghost text-rose-500"
          onClick={() => onDelete(meeting)}
          aria-label="Delete meeting"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
