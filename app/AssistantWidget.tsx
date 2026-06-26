"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "./ProjectProvider";

type Message = { role: "user" | "assistant"; content: string };

// Minimal typing for the Web Speech API (not in the standard DOM lib).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export function AssistantWidget() {
  const { job, setJob } = useProject();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your project assistant. I can update your estimate, change orders, pay app, submittals, schedule, punch list, tasks and safety logs — and answer questions about the job. Type, or tap 🎤 and talk to me.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const speakOnRef = useRef(speakOn);
  speakOnRef.current = speakOn;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  // ⌘K / Ctrl-K toggles the assistant from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const speak = useCallback((text: string) => {
    if (!speakOnRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }, []);

  const send = useCallback(
    async (preset?: string) => {
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
          body: JSON.stringify({ messages: next.slice(1), job }),
        });
        const data = await res.json();
        const reply = !res.ok ? data.error ?? "Something went wrong." : data.reply || "Done.";
        if (res.ok && data.job) setJob(data.job);
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        speak(reply);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server. Check your connection and try again." }]);
      } finally {
        setBusy(false);
      }
    },
    [input, busy, messages, job, setJob, speak],
  );

  const toggleListening = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Voice input needs Chrome, Edge, or Safari. On iPhone, open this site in Safari; on Android, use Chrome. You can always type instead." },
      ]);
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript ?? "";
        if (transcript) send(transcript);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      setMessages((m) => [...m, { role: "assistant", content: "Couldn't start the microphone — please allow mic access and try again." }]);
    }
  }, [listening, send]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="noprint fixed bottom-5 right-5 z-50 rounded-full bg-[#15212d] px-5 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#1d2c3b] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
        aria-label="Toggle assistant"
      >
        {open ? "Close" : "💬 Assistant"}
      </button>

      {open && (
        <div className="assistant-pop noprint fixed bottom-20 left-3 right-3 z-50 flex h-[72vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:left-auto sm:right-5 sm:h-[28rem] sm:w-[23rem]">
          <div className="flex items-center gap-2 border-b-2 border-[#f5a623] bg-[#15212d] px-4 py-3 text-white">
            <span className="font-semibold">Project Assistant</span>
            {listening ? (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-[#f5a623]">
                <span className="h-2 w-2 animate-ping rounded-full bg-[#f5a623]" /> Listening…
              </span>
            ) : (
              <span className="ml-auto h-2 w-2 rounded-full bg-[#f5a623]" />
            )}
            <button
              onClick={() => {
                if (speakOn && typeof window !== "undefined") window.speechSynthesis?.cancel();
                setSpeakOn((s) => !s);
              }}
              title={speakOn ? "Mute spoken replies" : "Read replies aloud"}
              className="text-base leading-none opacity-80 hover:opacity-100"
            >
              {speakOn ? "🔊" : "🔈"}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  m.role === "user" ? "ml-auto bg-[#15212d] text-white" : "bg-gray-100 text-gray-800"
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
                  "Log a safety observation in the lobby",
                  "Add a task to order door hardware",
                  "Which RFIs are overdue?",
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

          <div className="flex items-center gap-2 border-t border-gray-200 p-2">
            <button
              onClick={toggleListening}
              disabled={busy}
              title={listening ? "Stop listening" : "Speak to the assistant"}
              aria-label="Voice input"
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-md text-lg disabled:opacity-50 ${
                listening ? "animate-pulse bg-red-500 text-white" : "bg-[#15212d] text-[#f5a623] hover:bg-[#1d2c3b]"
              }`}
            >
              🎤
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={listening ? "Listening…" : "Type, or tap 🎤"}
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
