"use client";

import CodeBlock from "./CodeBlock";

interface Block {
  type: "text" | "code";
  lang?: string;
  content: string;
}

function parseBlocks(input: string): Block[] {
  if (!input) return [];
  const blocks: Block[] = [];
  const fenceRe = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(input)) !== null) {
    if (m.index > lastIndex) {
      blocks.push({ type: "text", content: input.slice(lastIndex, m.index) });
    }
    blocks.push({ type: "code", lang: m[1] || "", content: m[2].replace(/\n$/, "") });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < input.length) {
    blocks.push({ type: "text", content: input.slice(lastIndex) });
  }
  return blocks;
}

function InlineText({ text }: { text: string }) {
  const parts: Array<{ type: "text" | "code"; value: string }> = [];
  const inlineRe = /`([^`\n]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    parts.push({ type: "code", value: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });

  return (
    <>
      {parts.map((p, i) =>
        p.type === "code" ? (
          <code
            key={i}
            className="px-1 py-0.5 rounded text-[11px] font-mono bg-[var(--card-border)] text-[var(--accent)]"
          >
            {p.value}
          </code>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </>
  );
}

export default function MarkdownText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const blocks = parseBlocks(text);
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <CodeBlock key={i} code={b.content} language={b.lang} />
        ) : (
          <div key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            <InlineText text={b.content} />
          </div>
        )
      )}
    </div>
  );
}
