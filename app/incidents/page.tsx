"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type Incident, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TYPES = ["Injury", "Near Miss", "Property Damage", "Environmental"] as const;
const SEV = ["Low", "Medium", "High", "Recordable"] as const;
const TODAY = "2026-06-25";

const sevMeta = (s: string) => (s === "Recordable" || s === "High" ? { bg: "#f6e7e3", color: "#b3402f" } : s === "Medium" ? { bg: "#fbf1dd", color: "#9a6a13" } : { bg: "#efeee9", color: "#6b6457" });
const stMeta = (s: string) => (s === "Closed" ? { bg: "#e8f3ec", color: "#1f7a44" } : s === "Under Review" ? { bg: "#e3edf6", color: "#2c5d86" } : { bg: "#fbf1dd", color: "#9a6a13" });

export default function IncidentsPage() {
  const { job, setJob } = useProject();
  const list = job.incidents;

  const setList = (n: Incident[]) => setJob({ ...job, incidents: n });
  const setItem = (id: string, patch: Partial<Incident>) => setList(list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = () => setList([{ id: newId(), number: `INC-${String(list.length + 1).padStart(3, "0")}`, date: TODAY, type: "Near Miss", severity: "Low", description: "", location: "", reportedBy: "GC", status: "Open" }, ...list]);

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const open = list.filter((x) => x.status !== "Closed").length;
  const recordable = list.filter((x) => x.severity === "Recordable").length;

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="INCIDENT REPORTS" subtitle={`${job.meta.name} · SAFETY`}>
        <ToolBarButton label="+ NEW INCIDENT" onClick={add} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>{list.length} incident{list.length === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Recordable</div><div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: recordable > 0 ? "#e3705c" : "#f4f3f0" }}>{recordable}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Open</div><div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: ACCENT }}>{open}</div></div>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 1060 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ width: 86, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>#</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Date</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Type</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Severity</div>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Description</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Location</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Reported By</div>
              <div style={{ width: 140, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>
            {list.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No incidents — keep it that way</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#b0aa9c", marginTop: 6 }}>Log injuries, near-misses or property damage here if they happen.</div>
              </div>
            ) : list.map((x) => {
              const sm = sevMeta(x.severity), st = stMeta(x.status);
              return (
                <div key={x.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9", borderLeft: `4px solid ${sm.color}` }}>
                  <div style={{ width: 82, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <input value={x.number} onChange={(e) => setItem(x.id, { number: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", height: 48, outline: "none", padding: 0 }} />
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={x.date} onChange={(e) => setItem(x.id, { date: e.target.value })} type="date" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#5a6470", height: 48, outline: "none", padding: "0 8px" }} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                    <select value={x.type} onChange={(e) => setItem(x.id, { type: e.target.value as Incident["type"] })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 12, color: "#1c2b3a", textAlign: "center", textAlignLast: "center", height: 48, outline: "none", cursor: "pointer" }}>
                      {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    <select value={x.severity} onChange={(e) => setItem(x.id, { severity: e.target.value as Incident["severity"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: sm.bg, color: sm.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 10, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 28, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {SEV.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 220, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={x.description} onChange={(e) => setItem(x.id, { description: e.target.value })} placeholder="What happened…" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 130, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={x.location} onChange={(e) => setItem(x.id, { location: e.target.value })} placeholder="Area" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 130, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={x.reportedBy} onChange={(e) => setItem(x.id, { reportedBy: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 140, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={x.status} onChange={(e) => setItem(x.id, { status: e.target.value as Incident["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Open", "Under Review", "Closed"].map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => setList(list.filter((y) => y.id !== x.id))} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>Document safety incidents with type, severity and status. &ldquo;Recordable&rdquo; and high-severity items are flagged red for OSHA tracking.</div>
      </div>
    </div>
  );
}
