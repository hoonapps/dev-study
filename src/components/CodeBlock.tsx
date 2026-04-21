"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import kotlin from "highlight.js/lib/languages/kotlin";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import sql from "highlight.js/lib/languages/sql";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";

let registered = false;
function registerLanguages() {
  if (registered) return;
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("kotlin", kotlin);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("js", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("ts", typescript);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("py", python);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("sh", bash);
  hljs.registerLanguage("shell", bash);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("yaml", yaml);
  hljs.registerLanguage("yml", yaml);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("go", go);
  registered = true;
}

export default function CodeBlock({
  code,
  language,
  showHeader = true,
}: {
  code: string;
  language?: string;
  showHeader?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    registerLanguages();
    if (ref.current) {
      const el = ref.current;
      delete el.dataset.highlighted;
      el.className = `language-${language || "plaintext"}`;
      try {
        if (language && hljs.getLanguage(language)) {
          el.innerHTML = hljs.highlight(code, { language }).value;
        } else {
          el.innerHTML = hljs.highlightAuto(code).value;
        }
      } catch {
        el.textContent = code;
      }
    }
  }, [code, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-[var(--card-border)]">
      {showHeader && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#3e3e42]">
          <span className="text-[10px] font-mono text-[#858585]">{language || "code"}</span>
          <button
            onClick={copy}
            className="text-[10px] px-2 py-0.5 rounded bg-[#3e3e42] hover:bg-[#505050] text-[#cccccc]"
          >
            {copied ? "✓ 복사됨" : "복사"}
          </button>
        </div>
      )}
      <pre className="bg-[#1e1e1e] p-3 text-[12px] font-mono overflow-x-auto leading-relaxed m-0">
        <code ref={ref}>{code}</code>
      </pre>
    </div>
  );
}
