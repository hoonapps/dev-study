"use client";

import { useEffect, useState } from "react";
import { getMemo, setMemo } from "@/lib/storage";

export default function MemoBox({ id, placeholder = "내 메모 (실수한 포인트, 외울 포인트 등)" }: { id: string; placeholder?: string }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const m = getMemo(id);
    setValue(m);
    setOpen(!!m); // 기존 메모 있으면 자동 펼침
  }, [id]);

  const save = () => {
    setMemo(id, value);
    setSavedMsg("저장됨");
    setTimeout(() => setSavedMsg(""), 1500);
  };

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="text-[10px] text-[var(--muted)] underline"
        >
          📝 메모 추가
        </button>
      ) : (
        <div
          className="border border-[var(--card-border)] rounded-lg p-2 bg-[var(--bg)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold text-[var(--muted)]">📝 내 메모</p>
            {savedMsg && <span className="text-[10px] text-[var(--accent)]">{savedMsg}</span>}
          </div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-[var(--bg)] text-[var(--fg)] text-xs resize-none focus:outline-none leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] text-[var(--muted)]">{value.length}자</span>
            <button
              onClick={() => {
                setValue("");
                setMemo(id, "");
                setOpen(false);
              }}
              className="text-[10px] text-[var(--error)]"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
