import { Activity, Github } from "lucide-react";
import { useMeetings } from "../context/MeetingContext";

export default function Footer() {
  const { analytics } = useMeetings();

  return (
    <footer className="mt-auto border-t border-slate-200/80 px-6 py-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span>SynapNotes Core online</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Activity size={14} />
            {analytics?.total_meetings ?? 0} meetings · {analytics?.total_actions ?? 0} actions
          </span>
          <a href="https://github.com" className="inline-flex items-center gap-1 hover:text-violet-500">
            <Github size={14} />
            Docs
          </a>
          <span>© {new Date().getFullYear()} SynapNotes AI</span>
        </div>
      </div>
    </footer>
  );
}
