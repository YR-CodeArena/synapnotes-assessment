import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ClipboardList, FolderKanban, Plus, Sparkles } from "lucide-react";
import { useMeetings } from "../context/MeetingContext";

function Metric({ label, value, icon: Icon, urgent }) {
  return (
    <div className={`sn-card p-5 ${urgent ? "ring-2 ring-rose-500/70" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <Icon size={18} className={urgent ? "text-rose-500" : "text-violet-500"} />
      </div>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
      {urgent && <span className="mt-2 inline-block rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Urgent</span>}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { analytics, actions, refreshAll, loading } = useMeetings();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const urgent = (actions || [])
    .filter((item) => item.status !== "Completed")
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-violet-500">Workspace</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="sn-btn-primary" onClick={() => navigate("/meetings/new")}>
            <Plus size={16} />
            Create Meeting with AI
          </button>
          <button type="button" className="sn-btn-ghost" onClick={() => navigate("/actions")}>
            View Action Tracker
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total Meetings" value={analytics?.total_meetings ?? 0} icon={FolderKanban} />
        <Metric label="Total Actions" value={analytics?.total_actions ?? 0} icon={ClipboardList} />
        <Metric label="Open Tasks" value={analytics?.open_actions ?? 0} icon={Sparkles} />
        <Metric label="Completed Tasks" value={analytics?.completed_actions ?? 0} icon={CheckCircle2} />
        <Metric label="Overdue Tasks" value={analytics?.overdue_actions ?? 0} icon={AlertTriangle} urgent={(analytics?.overdue_actions || 0) > 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="sn-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent Meetings</h2>
          <div className="space-y-3">
            {(analytics?.recent_meetings || []).map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                onClick={() => navigate(`/meetings/${meeting.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{meeting.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{meeting.summary?.purpose}</p>
                  </div>
                  <span className="text-xs text-slate-400">{meeting.meeting_date}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {(meeting.participants || []).slice(0, 4).map((person) => (
                    <span key={person} className="grid h-6 w-6 place-items-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                      {person.slice(0, 2).toUpperCase()}
                    </span>
                  ))}
                </div>
              </button>
            ))}
            {!loading && !(analytics?.recent_meetings || []).length && <p className="text-sm text-slate-500">No meetings yet.</p>}
          </div>
        </section>
        <section className="sn-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Urgent Action Watchlist</h2>
          <div className="space-y-3">
            {urgent.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-sm font-semibold">{item.task_description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.owner} · {item.due_date} · {item.priority} · {item.status}
                </p>
              </div>
            ))}
            {!urgent.length && <p className="text-sm text-slate-500">No open actions.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
