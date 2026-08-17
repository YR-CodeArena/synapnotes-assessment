import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import TranscriptUploader from "../components/TranscriptUploader";
import { useMeetings } from "../context/MeetingContext";

const TYPES = [
  "Client Meeting",
  "Sales Meeting",
  "Project Meeting",
  "Internal Meeting",
  "Requirement Discussion",
  "Retrospective",
  "Other",
];

export const SAMPLE_DISCOVERY_TRANSCRIPT = `Project Discovery and MVP Planning Meeting (Customer Support Automation Platform)

Date: 12 March 2026
Attendees: Maria (Product Lead), James (Engineering), Neha (Operations), Arjun (Knowledge / CX), Riya (Delivery)

Maria: Welcome everyone. Today's goal is to lock the MVP for the Customer Support Automation Platform. We have a six-week window and we cannot boil the ocean. James, can you recap the integration constraint?

James: Zendesk stays the system of record. We should not write tickets directly from the bot runtime. I recommend an adapter layer that maps our intents to Zendesk tickets, comments, and tags. That keeps us portable if we add Freshdesk later.

Neha: Operations agrees. Agents already live in Zendesk. If we bypass it, reporting breaks. One hard rule from finance: refunds above €50 must stay human-in-the-loop. Smaller refunds can auto-process if we keep an audit log.

Arjun: The knowledge base is the real risk. Top 50 intents are decent in English, but policy pages for partial refunds and multi-currency are incomplete. If we automate too early we will send wrong answers.

Riya: Delivery-wise, six weeks is aggressive but doable if we freeze scope. I propose weekly stakeholder checkpoints and a gated production rollout, not a big-bang cutover.

Maria: Scope freeze then. MVP channels are email and chat only. Voice, WhatsApp, and social are out. James, can the adapter spike land in week two?

James: Yes. I will spike tickets, comments, and tags against the Zendesk sandbox in week two. Latency under peak volume is still an unanswered question.

Neha: I will map the refund policy this week, including the €50 threshold and the edge cases. Legal still needs to confirm automated refunds under €50 across EU markets.

Arjun: I will audit the knowledge base for the top 50 ticket intents by week two and publish a gap list. Who owns the content freeze before the first production cohort?

Riya: I will own the checkpoint cadence and the success metrics dashboard in week one. We also need an acceptable false-automation rate for the first two weeks — that is still open.

Maria: Decisions for the notes: Zendesk via adapter, MVP is email and chat, six-week target, human-in-the-loop for refunds greater than €50. I will draft the MVP PRD covering channels, refunds, and adapter contracts by end of week one.

James: Agreed. Please include which Zendesk custom fields must be preserved for reporting. That is still unanswered.

Neha: Approved on the refunds guardrail. I will chase legal on the timeline.

Arjun: Agreed, with the knowledge-base risk called out explicitly.

Riya: Locked. Weekly checkpoints start next Monday. Let's ship a usable MVP, not a perfect one.
`;

export default function CreateMeetingPage() {
  const navigate = useNavigate();
  const { createMeeting } = useMeetings();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    meeting_date: new Date().toISOString().slice(0, 10),
    meeting_type: "Requirement Discussion",
    participants: "Maria, James, Neha, Arjun, Riya",
    raw_transcript: "",
  });

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      const created = await createMeeting({
        title: form.title,
        meeting_date: form.meeting_date,
        meeting_type: form.meeting_type,
        participants: form.participants.split(",").map((item) => item.trim()).filter(Boolean),
        raw_transcript: form.raw_transcript,
      });
      navigate(`/meetings/${created.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to process meeting.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">New meeting</h1>
        <p className="mt-1 text-sm text-slate-500">Step {step} of 2 — metadata, then transcript intelligence.</p>
      </div>
      {step === 1 && (
        <div className="sn-card space-y-4 p-6">
          <label className="block text-sm font-medium">
            Meeting title
            <input className="sn-input mt-1" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Date
              <input className="sn-input mt-1" type="date" value={form.meeting_date} onChange={(event) => setForm({ ...form, meeting_date: event.target.value })} />
            </label>
            <label className="block text-sm font-medium">
              Type
              <select className="sn-input mt-1" value={form.meeting_type} onChange={(event) => setForm({ ...form, meeting_type: event.target.value })}>
                {TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Participants (comma-separated)
            <input className="sn-input mt-1" value={form.participants} onChange={(event) => setForm({ ...form, participants: event.target.value })} />
          </label>
          <button type="button" className="sn-btn-primary" disabled={!form.title.trim()} onClick={() => setStep(2)}>
            Continue to transcript
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="sn-card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Transcript input</h2>
            <button
              type="button"
              className="sn-btn-ghost"
              onClick={() =>
                setForm({
                  ...form,
                  title: form.title || "Project Discovery and MVP Planning Meeting (Customer Support Automation Platform)",
                  raw_transcript: SAMPLE_DISCOVERY_TRANSCRIPT,
                })
              }
            >
              Load Sample Discovery Meeting Transcript
            </button>
          </div>
          <TranscriptUploader
            value={form.raw_transcript}
            onChange={(raw_transcript) => setForm({ ...form, raw_transcript })}
            placeholder="Paste the meeting transcript…"
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="sn-btn-ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="sn-btn-primary" disabled={busy || !form.raw_transcript.trim()} onClick={generate}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {busy ? "Extracting notes & actions…" : "Generate AI Notes & Extract Actions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
