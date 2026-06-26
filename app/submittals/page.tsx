"use client";

import { useState } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type TrackItem, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const SUB_STATUS = ["Draft", "Submitted", "Under Review", "Revise & Resubmit", "Approved as Noted", "Approved", "Closed"];
const RFI_STATUS = ["Open", "Submitted", "Answered", "Closed"];
const CLOSED = ["Approved", "Answered", "Closed", "Approved as Noted"];

const statusMeta = (s: string) => {
  if (CLOSED.includes(s)) return { bg: "#e8f3ec", color: "#1f7a44", bar: "#1f7a44", open: false };
  if (s === "Revise & Resubmit") return { bg: "#f6e7e3", color: "#b3402f", bar: "#b3402f", open: true };
  return { bg: "#fbf1dd", color: "#9a6a13", bar: "#e0a93b", open: true };
};

export default function SubmittalsPage() {
  const { job, setJob } = useProject();
  const [tab, setTab] = useState<"submittals" | "rfis">("submittals");
  const isSub = tab === "submittals";
  const list = isSub ? job.submittals : job.rfis;
  const statusOptions = isSub ? SUB_STATUS : RFI_STATUS;
  const today = "2026-06-25";

  const setList = (next: TrackItem[]) => setJob({ ...job, [isSub ? "submittals" : "rfis"]: next });
  const setItem = (id: string, patch: Partial<TrackItem>) => setList(list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id: string) => setList(list.filter((it) => it.id !== id));
  const addItem = () => {
    const prefix = isSub ? "SUB-" : "RFI-";
    setList([...list, { id: newId(), refNo: `${prefix}${String(list.length + 1).padStart(3, "0")}`, title: "", court: "GC", due: today, status: isSub ? "Draft" : "Open" }]);
  };

  let openCount = 0, overdueCount = 0, closedCount = 0;
  list.forEach((it) => {
    const st = statusMeta(it.status);
    if (st.open) openCount++; else closedCount++;
    if (st.open && it.due && it.due < today) overdueCount++;
  });

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const tabBtn = (on: boolean): React.CSSProperties => ({ border: "none", background: "transparent", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 20px", cursor: "pointer", color: on ? "#f4f3f0" : "#7f8c99", borderBottom: `3px solid ${on ? ACCENT : "transparent"}` });
  const stat = (label: string, val: number, color = "#f4f3f0") => (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color }}>{val}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="SUBMITTALS & RFIs" subtitle={`${job.meta.name} · ${job.meta.bidNo}`}>
        <ToolBarButton label={`+ NEW ${isSub ? "SUBMITTAL" : "RFI"}`} onClick={addItem} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "0 22px", display: "flex", alignItems: "stretch", flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <button onClick={() => setTab("submittals")} style={tabBtn(isSub)}>Submittals <span style={{ opacity: 0.7 }}>({job.submittals.length})</span></button>
        <button onClick={() => setTab("rfis")} style={tabBtn(!isSub)}>RFIs <span style={{ opacity: 0.7 }}>({job.rfis.length})</span></button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 4px" }}>
          {stat("Open", openCount, ACCENT)}
          {stat("Overdue", overdueCount, overdueCount > 0 ? "#e3705c" : "#f4f3f0")}
          {stat("Closed", closedCount)}
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb" }}>
          <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
            <div style={{ width: 88, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>{isSub ? "Sub #" : "RFI #"}</div>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>{isSub ? "Submittal Description" : "Question"}</div>
            <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Ball in Court</div>
            <div style={{ width: 124, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Due</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
            <div style={{ width: 46, flex: "none" }} />
          </div>

          {list.length === 0 ? (
            <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", color: "#9a9488", textTransform: "uppercase" }}>No {isSub ? "submittals" : "RFIs"} logged</div>
            </div>
          ) : list.map((it) => {
            const st = statusMeta(it.status);
            const overdue = st.open && it.due && it.due < today;
            return (
              <div key={it.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9", borderLeft: `4px solid ${overdue ? "#b3402f" : st.bar}` }}>
                <div style={{ width: 84, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                  <input value={it.refNo} onChange={(e) => setItem(it.id, { refNo: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", height: 48, outline: "none", padding: 0 }} />
                </div>
                <div style={{ flex: 1, minWidth: 200, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={it.title} onChange={(e) => setItem(it.id, { title: e.target.value })} placeholder="Description…" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                </div>
                <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <select value={it.court} onChange={(e) => setItem(it.id, { court: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 12, color: "#1c2b3a", textAlign: "center", textAlignLast: "center", height: 48, outline: "none", cursor: "pointer", padding: "0 4px" }}>
                    {["GC", "Architect", "Owner", "Engineer", "Sub"].map((o) => (<option key={o}>{o}</option>))}
                  </select>
                </div>
                <div style={{ width: 124, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={it.due} onChange={(e) => setItem(it.id, { due: e.target.value })} type="date" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 11, color: overdue ? "#b3402f" : "#5a6470", height: 48, outline: "none", padding: "0 8px" }} />
                </div>
                <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                  <select value={it.status} onChange={(e) => setItem(it.id, { status: e.target.value })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                    {statusOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div style={{ width: 46, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => removeItem(it.id)} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Track {isSub ? "submittals" : "RFIs"} with ball-in-court and due dates. Rows past their due date while still open are flagged <b style={{ color: "#b3402f" }}>overdue</b>. Switch tabs to manage submittals and RFIs separately.</div>
      </div>
    </div>
  );
}
