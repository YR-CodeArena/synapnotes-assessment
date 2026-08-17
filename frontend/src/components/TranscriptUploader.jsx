import { useRef, useState } from "react";
import { FileUp } from "lucide-react";

export default function TranscriptUploader({ value, onChange, placeholder }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const readFile = (file) => {
    if (!file) return;
    const allowed = ["text/plain", "text/markdown", "text/x-markdown"];
    const okType = allowed.includes(file.type) || /\.(txt|md)$/i.test(file.name);
    if (!okType) {
      window.alert("Please upload a .txt or .md file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging
            ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
            : "border-slate-300 dark:border-slate-700"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          readFile(event.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp className="mb-2 text-violet-500" />
        <p className="text-sm font-medium">Drop a .txt or .md transcript, or click to upload</p>
        <p className="mt-1 text-xs text-slate-500">You can also paste directly in the editor below</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          onChange={(event) => readFile(event.target.files?.[0])}
        />
      </div>
      <textarea
        className="sn-input min-h-[280px] resize-y font-mono leading-relaxed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
