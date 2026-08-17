import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Plus, Table as TableIcon } from "lucide-react";
import KanbanBoard from "../components/KanbanBoard";
import { actionsApi, meetingsApi } from "../services/api";
import { useMeetings } from "../context/MeetingContext";

export default function ActionTrackerPage() {
  const { actions, meetings, refreshActions, refreshMeetings, updateAction } = useMeetings();
  const [view, setView] = useState("kanban");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [owner, setOwner] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    meeting_id: "",
    task_description: "",
    owner: "Unassigned",
    due_date: "Not specified",
    priority: "Medium",
    status: "Open",
  });

  useEffect(() => {
    refreshMeetings();
  }, [refreshMeetings]);

  useEffect(() => {
    refreshActions({
      status: status || undefined,
      priority: priority || undefined,
      owner: owner || undefined,
      overdue: overdueOnly || undefined,
    });
  }, [status, priority, owner, overdueOnly, refreshActions]);

  const meetingOptions = useMemo(() => meetings, [meetings]);

  const onStatusChange = async (item, nextStatus) => {
    await updateAction(item.id, { status: nextStatus });
    await refreshActions({
      status: status || undefined,
      priority: priority || undefined,
      owner: owner || undefined,
      overdue: overdueOnly || undefined,
    });
  };

  const addAction = async (event) => {
    event.preventDefault();
    await actionsApi.create({ ...draft, meeting_id: Number(draft.meeting_id) });
    setModalOpen(false);
    await refreshActions({
      status: status || undefined,
      priority: priority || undefined,
      owner: owner || undefined,
      overdue: overdueOnly || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Action Tracker</h1>
          <p className="text-sm text-slate-500">Central hub across every meeting.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={`sn-btn ${view === "kanban" ? "sn-btn-primary" : "sn-btn-ghost"}`} onClick={() => setView("kanban")}>
            <LayoutGrid size={16} />
            Kanban
          </button>
          <button type="button" className={`sn-btn ${view === "table" ? "sn-btn-primary" : "sn-btn-ghost"}`} onClick={() => setView("table")}>
            <TableIcon size={16} />
            Table
          </button>
          <button type="button" className="sn-btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Action Item
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select className="sn-input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {["Open", "In Progress", "Blocked", "Completed"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select className="sn-input" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">All priorities</option>
          {["High", "Medium", "Low"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input className="sn-input" placeholder="Owner search" value={owner} onChange={(event) => setOwner(event.target.value)} />
        <label className="sn-card flex items-center gap-2 px-4 text-sm">
          <input type="checkbox" checked={overdueOnly} onChange={(event) => setOverdueOnly(event.target.checked)} />
          Show overdue only
        </label>
      </div>

      {view === "kanban" ? (
        <KanbanBoard items={actions} onStatusChange={onStatusChange} />
      ) : (
        <div className="overflow-x-auto sn-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Meeting</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{item.task_description}</td>
                  <td className="px-4 py-3 text-violet-500">{item.meeting_title}</td>
                  <td className="px-4 py-3">{item.owner}</td>
                  <td className="px-4 py-3">{item.due_date}</td>
                  <td className="px-4 py-3">{item.priority}</td>
                  <td className="px-4 py-3">
                    <select className="sn-input" value={item.status} onChange={(event) => onStatusChange(item, event.target.value)}>
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
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form className="sn-card w-full max-w-lg space-y-3 p-6" onSubmit={addAction}>
            <h3 className="text-lg font-semibold">Add action item</h3>
            <select className="sn-input" required value={draft.meeting_id} onChange={(event) => setDraft({ ...draft, meeting_id: event.target.value })}>
              <option value="">Select meeting</option>
              {meetingOptions.map((meeting) => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.title}
                </option>
              ))}
            </select>
            <textarea className="sn-input min-h-24" required placeholder="Task description" value={draft.task_description} onChange={(event) => setDraft({ ...draft, task_description: event.target.value })} />
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
