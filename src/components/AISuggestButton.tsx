"use client";

import { useState } from "react";

export function AISuggestButton({
  blockType,
  pageTitle,
  currentText,
  onApply,
}: {
  blockType: string;
  pageTitle: string;
  currentText: string;
  onApply: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function fetchSuggestions() {
    setOpen(true);
    setLoading(true);
    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockType, currentText, pageTitle }),
    });
    const data = await res.json();
    setSuggestions(data.suggestions ?? []);
    setLoading(false);
  }

  return (
    <div className="relative">
      <button onClick={fetchSuggestions} className="text-indigo-600 hover:underline">
        ✨ AI Suggest
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-72 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Suggestions</span>
            <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
              Close
            </button>
          </div>
          {loading && <p className="p-2 text-sm text-slate-400">Generating…</p>}
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => {
                    onApply(s);
                    setOpen(false);
                  }}
                  className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-indigo-50"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
