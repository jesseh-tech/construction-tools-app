"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { AddRow } from "../AddControls";
import { type Observation, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TYPES = ["Safety", "Quality", "Commissioning", "Warranty", "Environmental"] as const;
const TODAY = "2026-06-25";

export default function ObservationsPage() {
  const { job, setJob } = useProject();
  const list = job.observations;

  const setList = (n: Observation[]) => setJob({ ...job, observations: n });
  const setItem = (id: string, patch: Partial<Observation>) => setList(list.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const add = () => setList([...list, { id: newId(), number: `OBS-${String(list.length + 1).padStart(3, "0")}`, type: "Safety", title: "", location: "", assignee: "GC", date: TODAY, status: "Open" }]);

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const open = list.filter((o) => o.status === "Open").length;
  const safety = list.filter((o) => o.type === "Safety" && o.status === "Open").length;

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="OBSERVATIONS" subtitle={`${job.meta.name} · SAFETY & QUALITY`}>
        <ToolBarButton label="+ NEW OBSERVATION" onClick={add} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>{list.length} observation{list.length === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Open Safety</div><div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: safety > 0 ? "#e3705c" : "#f4f3f0" }}>{safety}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Open</div><div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: ACCENT }}>{open}</div></div>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 980 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ width: 90, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>#</div>
              <div style={{ width: 140, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Type</div>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Observation</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Location</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Assignee</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Date</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>
            {list.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No observations logged</div>
            ) : list.map((o) => {
              const st = o.status === "Closed" ? { bg: "#e8f3ec", color: "#1f7a44", bar: "#1f7a44" } : { bg: "#fbf1dd", color: "#9a6a13", bar: "#e0a93b" };
              return (
                <div key={o.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9", borderLeft: `4px solid ${o.type === "Safety" ? "#b3402f" : st.bar}` }}>
                  <div style={{ width: 86, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <input value={o.number} onChange={(e) => setItem(o.id, { number: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", height: 48, outline: "none", padding: 0 }} />
                  </div>
                  <div style={{ width: 140, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    <select value={o.type} onChange={(e) => setItem(o.id, { type: e.target.value as Observation["type"] })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 12, color: "#1c2b3a", textAlign: "center", textAlignLast: "center", height: 48, outline: "none", cursor: "pointer" }}>
                      {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 220, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={o.title} onChange={(e) => setItem(o.id, { title: e.target.value })} placeholder="What did you observe…" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 130, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={o.location} onChange={(e) => setItem(o.id, { location: e.target.value })} placeholder="Area" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={o.assignee} onChange={(e) => setItem(o.id, { assignee: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={o.date} onChange={(e) => setItem(o.id, { date: e.target.value })} type="date" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#5a6470", height: 48, outline: "none", padding: "0 8px" }} />
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={o.status} onChange={(e) => setItem(o.id, { status: e.target.value as Observation["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Open", "Closed"].map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => setList(list.filter((x) => x.id !== o.id))} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <AddRow label="+ Log an observation" onClick={add} />
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>Log field observations — safety hazards, quality issues, warranty items. Safety observations are flagged red. Ask the assistant to log one.</div>
      </div>
    </div>
  );
}
