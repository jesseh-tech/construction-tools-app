"use client";

import { useState } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type Task, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";
const FILTERS = ["All", "Open", "In Progress", "Done"] as const;

const stMeta = (s: string) => (s === "Done" ? { bg: "#e8f3ec", color: "#1f7a44" } : s === "In Progress" ? { bg: "#e3edf6", color: "#2c5d86" } : { bg: "#fbf1dd", color: "#9a6a13" });
const prMeta = (p: string) => (p === "High" ? { bg: "#f6e7e3", color: "#b3402f" } : p === "Low" ? { bg: "#efeee9", color: "#6b6457" } : { bg: "#fbf1dd", color: "#9a6a13" });

export default function TasksPage() {
  const { job, setJob } = useProject();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const list = job.tasks;
  const shown = filter === "All" ? list : list.filter((t) => t.status === filter);

  const setList = (n: Task[]) => setJob({ ...job, tasks: n });
  const setItem = (id: string, patch: Partial<Task>) => setList(list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const add = () => setList([...list, { id: newId(), title: "", assignee: "GC", due: TODAY, priority: "Medium", status: "Open" }]);

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const tab = (on: boolean): React.CSSProperties => ({ border: "none", background: "transparent", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 18px", cursor: "pointer", color: on ? "#f4f3f0" : "#7f8c99", borderBottom: `3px solid ${on ? ACCENT : "transparent"}` });
  const open = list.filter((t) => t.status !== "Done").length;

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="TASKS" subtitle={`${job.meta.name} · ACTION ITEMS`}>
        <ToolBarButton label="+ NEW TASK" onClick={add} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "0 22px", display: "flex", alignItems: "stretch", flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        {FILTERS.map((f) => (<button key={f} onClick={() => setFilter(f)} style={tab(filter === f)}>{f}</button>))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", padding: "0 6px", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#9aa6b2" }}>{open} open · {list.length} total</div>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 820 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>Task</div>
              <div style={{ width: 160, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Owner</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Due</div>
              <div style={{ width: 110, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Priority</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>
            {shown.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No tasks{filter !== "All" ? ` (${filter})` : ""}</div>
            ) : shown.map((t) => {
              const sm = stMeta(t.status), pm = prMeta(t.priority);
              const overdue = t.status !== "Done" && t.due && t.due < TODAY;
              return (
                <div key={t.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                  <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", paddingLeft: 4 }}>
                    <input value={t.title} onChange={(e) => setItem(t.id, { title: e.target.value })} placeholder="What needs doing…" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 160, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={t.assignee} onChange={(e) => setItem(t.id, { assignee: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 130, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={t.due} onChange={(e) => setItem(t.id, { due: e.target.value })} type="date" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 11, color: overdue ? "#b3402f" : "#5a6470", height: 48, outline: "none", padding: "0 8px" }} />
                  </div>
                  <div style={{ width: 110, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    <select value={t.priority} onChange={(e) => setItem(t.id, { priority: e.target.value as Task["priority"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: pm.bg, color: pm.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 28, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Low", "Medium", "High"].map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={t.status} onChange={(e) => setItem(t.id, { status: e.target.value as Task["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: sm.bg, color: sm.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Open", "In Progress", "Done"].map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => setList(list.filter((x) => x.id !== t.id))} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>Action items and to-dos. Ask the assistant: &ldquo;add a task to order door hardware, assign to the PM, high priority.&rdquo;</div>
      </div>
    </div>
  );
}
