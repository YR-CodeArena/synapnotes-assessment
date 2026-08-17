import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, RefreshCw, Search } from "lucide-react";
import RichTextViewer from "../components/RichTextViewer";
import { actionsApi, meetingsApi } from "../services/api";
import { useMeetings } from "../context/MeetingContext";

const TABS = ["AI Summary", "Key Decisions", "Action Items", "Risks & Questions", "Original Transcript"];

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAll } = useMeetings();
  const [meeting, setMeeting] = useState(null);
  const [tab, setTab] = useState("AI Summary");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    task_description: "",
    owner: "Unassigned",
    due_date: "Not specified",
    priority: "Medium",
    status: "Open",
  });

  const load = async () => {
    const response = await meetingsApi.get(id);
    setMeeting(response.data);
  };

  useEffect(() => {
    load().catch(() => navigate("/meetings"));
  }, [id]);

  const summary = meeting?.summary || {};
  const transcript = meeting?.raw_transcript || "";
  const filteredTranscript = useMemo(() => {
    if (!query.trim()) return transcript;
    return transcript
      .split("\n")
      .filter((line) => line.toLowerCase().includes(query.toLowerCase()))
      .join("\n");
  }, [transcript, query]);

  const reprocess = async () => {
    setBusy(true);
    try {
      const response = await meetingsApi.reprocess(id);
      setMeeting(response.data);
      await refreshAll();
    } finally {
      setBusy(false);
    }
  };

  const patchAction = async (item, payload) => {
    await actionsApi.update(item.id, payload);
    await load();
    await refreshAll();
  };

  const addTask = async (event) => {
    event.preventDefault();
    await actionsApi.create({ ...draft, meeting_id: Number(id) });
    setModalOpen(false);
    setDraft({ task_description: "", owner: "Unassigned", due_date: "Not specified", priority: "Medium", status: "Open" });
    await load();
    await refreshAll();
  };

  if (!meeting) {
    return <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sn-chip bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{meeting.meeting_type}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight">{meeting.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{meeting.meeting_date} · {(meeting.participants || []).join(", ")}</p>
        </div>
        <button type="button" className="sn-btn-primary" onClick={reprocess} disabled={busy}>
          <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
          Re-run AI Analysis
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === item ? "bg-violet-600 text-white" : "sn-card px-3 py-2"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "AI Summary" && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Executive Purpose", summary.purpose || ""],
            ["Discussion Points", (summary.key_points || []).map((line) => `- ${line}`).join("\n")],
            ["Outcomes", (summary.outcomes || []).map((line) => `- ${line}`).join("\n")],
            ["Concerns", (summary.concerns || []).map((line) => `- ${line}`).join("\n")],
            ["Next Steps", (summary.next_steps || []).map((line) => `- ${line}`).join("\n")],
          ].map(([title, content]) => (
            <RichTextViewer key={title} title={title} content={content} />
          ))}
        </div>
      )}

      {tab === "Key Decisions" && (
        <div className="grid gap-4 md:grid-cols-2">
          {(meeting.decisions || []).map((decision) => (
            <article key={decision} className="sn-card border-l-4 border-violet-500 p-5">
              <p className="text-sm leading-relaxed">{decision}</p>
            </article>
          ))}
        </div>
      )}

      {tab === "Action Items" && (
        <div className="space-y-4">
          <button type="button" className="sn-btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Task
          </button>
          <div className="overflow-x-auto sn-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(meeting.action_items || []).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{item.task_description}</td>
                    <td className="px-4 py-3">
                      <input className="sn-input" defaultValue={item.owner} onBlur={(event) => patchAction(item, { owner: event.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="sn-input" defaultValue={item.due_date} onBlur={(event) => patchAction(item, { due_date: event.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <select className="sn-input" value={item.priority} onChange={(event) => patchAction(item, { priority: event.target.value })}>
                        {["Low", "Medium", "High"].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select className="sn-input" value={item.status} onChange={(event) => patchAction(item, { status: event.target.value })}>
                        {["Open", "In Progress", "Blocked", "Completed"].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Risks & Questions" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-semibold">Risks</h2>
            {(meeting.risks || []).map((risk) => (
              <article key={risk} className="sn-card border-l-4 border-rose-500 p-4 text-sm">
                {risk}
              </article>
            ))}
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Unresolved questions</h2>
            {(meeting.unanswered_questions || []).map((question) => (
              <article key={question} className="sn-card border-l-4 border-amber-500 p-4 text-sm">
                {question}
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "Original Transcript" && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input className="sn-input pl-9" placeholder="Search transcript" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <RichTextViewer title="Transcript" content={filteredTranscript} />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form className="sn-card w-full max-w-lg space-y-3 p-6" onSubmit={addTask}>
            <h3 className="text-lg font-semibold">Add task</h3>
            <textarea className="sn-input min-h-24" required value={draft.task_description} onChange={(event) => setDraft({ ...draft, task_description: event.target.value })} />
            <input className="sn-input" value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} />
            <input className="sn-input" value={draft.due_date} onChange={(event) => setDraft({ ...draft, due_date: event.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="sn-input" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}>
                {["Low", "Medium", "High"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select className="sn-input" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                {["Open", "In Progress", "Blocked", "Completed"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="sn-btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="sn-btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
