"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { AddRow } from "../AddControls";
import { type Timecard, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

export default function TimesheetsPage() {
  const { job, setJob } = useProject();
  const list = job.timesheets;

  const setList = (n: Timecard[]) => setJob({ ...job, timesheets: n });
  const setItem = (id: string, patch: Partial<Timecard>) => setList(list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const add = () => setList([{ id: newId(), date: TODAY, worker: "", company: "", costCode: "", hours: "8" }, ...list]);

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const cell: React.CSSProperties = { border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 14, color: "#1c2b3a", height: 46, outline: "none", padding: "0 12px", width: "100%" };
  const totalHrs = list.reduce((a, t) => a + num(t.hours), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="TIMESHEETS" subtitle={`${job.meta.name} · LABOR`}>
        <ToolBarButton label="+ NEW TIMECARD" onClick={add} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>{list.length} timecard{list.length === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Total Hours</div><div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 20, color: ACCENT }}>{totalHrs}</div></div>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 860 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>Date</div>
              <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Worker / Crew</div>
              <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Company</div>
              <div style={{ width: 170, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Cost Code</div>
              <div style={{ width: 100, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", ...th }}>Hours</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>
            {list.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No timecards logged</div>
            ) : list.map((t) => (
              <div key={t.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center" }}>
                  <input type="date" value={t.date} onChange={(e) => setItem(t.id, { date: e.target.value })} style={{ ...cell, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#5a6470", paddingLeft: 14 }} />
                </div>
                <div style={{ flex: 1, minWidth: 180, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={t.worker} onChange={(e) => setItem(t.id, { worker: e.target.value })} placeholder="Name or crew" style={{ ...cell, fontWeight: 600 }} />
                </div>
                <div style={{ flex: 1, minWidth: 160, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={t.company} onChange={(e) => setItem(t.id, { company: e.target.value })} placeholder="Company" style={cell} />
                </div>
                <div style={{ width: 170, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={t.costCode} onChange={(e) => setItem(t.id, { costCode: e.target.value })} placeholder="e.g. 09-Drywall" style={{ ...cell, fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470" }} />
                </div>
                <div style={{ width: 100, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={t.hours} onFocus={(e) => e.target.select()} onChange={(e) => setItem(t.id, { hours: e.target.value })} inputMode="decimal" style={{ ...cell, fontFamily: "'JetBrains Mono'", fontWeight: 700, textAlign: "right" }} />
                </div>
                <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => setList(list.filter((x) => x.id !== t.id))} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <AddRow label="+ Add a timecard" onClick={add} />
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>Track field labor by worker, company and cost code. Ask the assistant: &ldquo;log 8 hours for Mike on 09-Drywall today.&rdquo;</div>
      </div>
    </div>
  );
}
