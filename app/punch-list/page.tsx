"use client";

import { useState } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type PunchItem, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";

const statusMeta = (s: string) =>
  s === "Closed" ? { bg: "#e8f3ec", color: "#1f7a44", bar: "#1f7a44" }
  : s === "Ready to Review" ? { bg: "#e3edf6", color: "#2c5d86", bar: "#5b768f" }
  : { bg: "#fbf1dd", color: "#9a6a13", bar: "#e0a93b" };
const prMeta = (p: string) =>
  p === "High" ? { bg: "#f6e7e3", color: "#b3402f" } : p === "Low" ? { bg: "#efeee9", color: "#6b6457" } : { bg: "#fbf1dd", color: "#9a6a13" };

const FILTERS = ["All", "Open", "Ready to Review", "Closed"] as const;

export default function PunchListPage() {
  const { job, setJob } = useProject();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = job.punchList;
  const shown = filter === "All" ? list : list.filter((p) => p.status === filter);

  const setList = (next: PunchItem[]) => setJob({ ...job, punchList: next });
  const setItem = (id: string, patch: Partial<PunchItem>) => setList(list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removeItem = (id: string) => setList(list.filter((p) => p.id !== id));
  const addItem = () =>
    setList([...list, { id: newId(), number: `PL-${String(list.length + 1).padStart(3, "0")}`, title: "", location: "", trade: "", assignee: "GC", priority: "Medium", status: "Open", due: TODAY }]);

  let open = 0, ready = 0, closed = 0, overdue = 0;
  list.forEach((p) => {
    if (p.status === "Closed") closed++; else if (p.status === "Ready to Review") ready++; else open++;
    if (p.status !== "Closed" && p.due && p.due < TODAY) overdue++;
  });

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const cellInput: React.CSSProperties = { width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" };
  const tabBtn = (on: boolean): React.CSSProperties => ({ border: "none", background: "transparent", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 18px", cursor: "pointer", color: on ? "#f4f3f0" : "#7f8c99", borderBottom: `3px solid ${on ? ACCENT : "transparent"}` });
  const stat = (label: string, val: number, color = "#f4f3f0") => (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color }}>{val}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="PUNCH LIST" subtitle={`${job.meta.name} · CLOSEOUT`}>
        <ToolBarButton label="+ NEW ITEM" onClick={addItem} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "0 22px", display: "flex", alignItems: "stretch", flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        {FILTERS.map((f) => (<button key={f} onClick={() => setFilter(f)} style={tabBtn(filter === f)}>{f}</button>))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 4px" }}>
          {stat("Open", open, ACCENT)}
          {stat("Ready", ready)}
          {stat("Overdue", overdue, overdue > 0 ? "#e3705c" : "#f4f3f0")}
          {stat("Closed", closed)}
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 1060 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ width: 76, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>#</div>
              <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Description</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Location</div>
              <div style={{ width: 110, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Trade</div>
              <div style={{ width: 140, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Assignee</div>
              <div style={{ width: 100, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Priority</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Due</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>

            {shown.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", color: "#9a9488", textTransform: "uppercase" }}>No punch items{filter !== "All" ? ` (${filter})` : ""}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#b0aa9c", marginTop: 6 }}>Click &ldquo;+ New Item&rdquo; or ask the assistant to add one.</div>
              </div>
            ) : shown.map((p) => {
              const st = statusMeta(p.status);
              const pm = prMeta(p.priority);
              const overdueRow = p.status !== "Closed" && p.due && p.due < TODAY;
              return (
                <div key={p.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9", borderLeft: `4px solid ${overdueRow ? "#b3402f" : st.bar}` }}>
                  <div style={{ width: 72, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <input value={p.number} onChange={(e) => setItem(p.id, { number: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", height: 48, outline: "none", padding: 0 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 200, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={p.title} onChange={(e) => setItem(p.id, { title: e.target.value })} placeholder="What needs fixing…" style={cellInput} />
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={p.location} onChange={(e) => setItem(p.id, { location: e.target.value })} placeholder="Area" style={{ ...cellInput, fontSize: 13 }} />
                  </div>
                  <div style={{ width: 110, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={p.trade} onChange={(e) => setItem(p.id, { trade: e.target.value })} placeholder="Trade" style={{ ...cellInput, fontSize: 13 }} />
                  </div>
                  <div style={{ width: 140, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={p.assignee} onChange={(e) => setItem(p.id, { assignee: e.target.value })} placeholder="Assignee" style={{ ...cellInput, fontSize: 13 }} />
                  </div>
                  <div style={{ width: 100, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    <select value={p.priority} onChange={(e) => setItem(p.id, { priority: e.target.value as PunchItem["priority"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: pm.bg, color: pm.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 28, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Low", "Medium", "High"].map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={p.due} onChange={(e) => setItem(p.id, { due: e.target.value })} type="date" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 11, color: overdueRow ? "#b3402f" : "#5a6470", height: 48, outline: "none", padding: "0 8px" }} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={p.status} onChange={(e) => setItem(p.id, { status: e.target.value as PunchItem["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Open", "Ready to Review", "Closed"].map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => removeItem(p.id)} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Track closeout deficiencies by location, trade and assignee. Items past their due date while still open are flagged <b style={{ color: "#b3402f" }}>overdue</b>. Try the assistant: &ldquo;add a punch item — cracked tile in the lobby, assign to the tile sub.&rdquo;</div>
      </div>
    </div>
  );
}
