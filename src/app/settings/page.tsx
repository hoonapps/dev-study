"use client";

import { useState, useEffect } from "react";
import { getApiKey, setApiKey, clearAllProgress } from "@/lib/storage";

export default function SettingsPage() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKey(getApiKey());
  }, []);

  const handleSave = () => {
    setApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (confirm("Are you sure? This will clear all your study progress.")) {
      clearAllProgress();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Claude API Key</h3>
          <p className="text-sm text-[var(--muted)] mb-3">
            Set your Anthropic API key to enable AI-powered feedback on short answer questions.
            The key is stored only in your browser&apos;s localStorage.
          </p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full p-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button onClick={handleSave} className="btn-primary">
          {saved ? "Saved!" : "Save API Key"}
        </button>
      </div>

      <div className="card space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Clear Progress</h3>
          <p className="text-sm text-[var(--muted)]">
            Reset all quiz results and flashcard progress. This cannot be undone.
          </p>
        </div>
        <button onClick={handleClear} className="px-4 py-2 rounded-lg bg-[var(--error)] text-white font-medium">
          Clear All Progress
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">How AI Feedback Works</h3>
        <ul className="text-sm text-[var(--muted)] space-y-2 list-disc list-inside">
          <li>Short answer questions are evaluated by Claude AI</li>
          <li>Instead of just &quot;wrong&quot;, AI explains how to think about the topic</li>
          <li>AI acts as a senior developer mentor, guiding your thought process</li>
          <li>Your API key is sent directly to Anthropic - never stored on any server</li>
        </ul>
      </div>
    </div>
  );
}
