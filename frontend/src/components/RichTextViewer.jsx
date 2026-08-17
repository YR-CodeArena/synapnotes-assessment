import { useState } from "react";
import { Check, Copy } from "lucide-react";

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function toHtmlBlocks(content) {
  const lines = (content || "").split("\n");
  const blocks = [];
  let list = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {list.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    list = [];
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      list.push(line.trim().slice(2));
      return;
    }
    flushList();
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={`h-${index}`} className="mb-2 mt-3 text-base font-semibold">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h-${index}`} className="mb-2 mt-3 text-lg font-semibold">
          {line.slice(3)}
        </h2>
      );
    } else if (line.trim() === "") {
      blocks.push(<div key={`sp-${index}`} className="h-2" />);
    } else {
      blocks.push(
        <p key={`p-${index}`} className="mb-2 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });
  flushList();
  return blocks;
}

export default function RichTextViewer({ title, content, className = "" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className={`sn-card p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        {title && <h3 className="text-sm font-semibold">{title}</h3>}
        <button type="button" className="sn-btn-ghost px-3 py-1.5 text-xs" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="markdown-body text-sm text-slate-700 dark:text-slate-300">{toHtmlBlocks(content)}</div>
    </section>
  );
}
