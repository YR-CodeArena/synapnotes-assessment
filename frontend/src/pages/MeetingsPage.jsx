import { useEffect, useState } from "react";
import MeetingCard from "../components/MeetingCard";
import { useMeetings } from "../context/MeetingContext";

const TYPES = [
  "All",
  "Client Meeting",
  "Sales Meeting",
  "Project Meeting",
  "Internal Meeting",
  "Requirement Discussion",
  "Retrospective",
  "Other",
];

export default function MeetingsPage() {
  const { meetings, refreshMeetings, deleteMeeting } = useMeetings();
  const [search, setSearch] = useState("");
  const [meetingType, setMeetingType] = useState("All");

  useEffect(() => {
    const handle = setTimeout(() => {
      refreshMeetings({
        search: search || undefined,
        meeting_type: meetingType === "All" ? undefined : meetingType,
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [search, meetingType, refreshMeetings]);

  const onDelete = async (meeting) => {
    if (window.confirm(`Delete “${meeting.title}”?`)) {
      await deleteMeeting(meeting.id);
      await refreshMeetings({
        search: search || undefined,
        meeting_type: meetingType === "All" ? undefined : meetingType,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Meetings</h1>
        <p className="mt-1 text-sm text-slate-500">Search by title, participant, or transcript keywords.</p>
      </div>
      <input
        className="sn-input max-w-xl"
        placeholder="Search meetings…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setMeetingType(type)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              meetingType === type
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-[#111622] dark:text-slate-300 dark:ring-slate-700"
            }`}
          >
            {type === "Project Meeting" ? "Project" : type}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} onDelete={onDelete} />
        ))}
      </div>
      {!meetings.length && <p className="text-sm text-slate-500">No meetings match those filters.</p>}
    </div>
  );
}
