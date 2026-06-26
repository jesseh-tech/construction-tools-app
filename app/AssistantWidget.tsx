"use client";

import { useState, useRef, useEffect } from "react";
import { useProject } from "./ProjectProvider";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantWidget() {
  const { job, setJob } = useProject();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your project assistant. I can update your estimate, SOV, change orders, pay app, submittals, daily reports and more, and answer questions about the job. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send(preset?: string) {
    const text = (preset ?? input).trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Only the real back-and-forth — skip the canned greeting.
          messages: next.slice(1),
          job,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error ?? "Something went wrong." }]);
      } else {
        if (data.job) setJob(data.job);
        setMessages((m) => [...m, { role: "assistant", content: data.reply || "Done." }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the server. Check your connection and try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-[#15212d] px-5 py-3 font-semibold text-white shadow-lg hover:bg-[#1d2c3b] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
        aria-label="Toggle estimating assistant"
      >
        {open ? "Close" : "💬 Assistant"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-[#15212d] px-4 py-3 text-white">
            <span className="font-semibold">Estimating Assistant</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-[#f5a623]" />
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-[#15212d] text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            ))}
            {messages.length === 1 && !busy && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "What's my total bid and margin?",
                  "Add 400 sq ft of drywall",
                  "Which RFIs are overdue?",
                  "Mark Finishes 60% complete",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:border-[#15212d] hover:text-[#15212d]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {busy && <div className="text-xs text-gray-400">Assistant is working…</div>}
          </div>

          <div className="flex gap-2 border-t border-gray-200 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. I have 400 sq ft of drywall"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#15212d] focus:outline-none"
              disabled={busy}
            />
            <button
              onClick={() => send()}
              disabled={busy}
              className="rounded-md bg-[#f5a623] px-3 py-2 text-sm font-semibold text-[#15212d] hover:bg-[#e0961a] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
