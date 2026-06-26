"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type Milestone, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";
const parse = (d: string) => { const n = Date.parse(d); return Number.isFinite(n) ? n : NaN; };
const stColor = (s: string) => (s === "Complete" ? "#1f7a44" : s === "In Progress" ? ACCENT : "#5b768f");
const stMeta = (s: string) => (s === "Complete" ? { bg: "#e8f3ec", color: "#1f7a44" } : s === "In Progress" ? { bg: "#fbf1dd", color: "#9a6a13" } : { bg: "#efeee9", color: "#6b6457" });

export default function SchedulePage() {
  const { job, setJob } = useProject();
  const list = job.milestones;

  const setList = (n: Milestone[]) => setJob({ ...job, milestones: n });
  const setItem = (id: string, patch: Partial<Milestone>) => setList(list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const add = () => setList([...list, { id: newId(), title: "New milestone", start: TODAY, end: TODAY, status: "Not Started", phase: "Construction" }]);

  // timeline span
  const valid = list.filter((m) => !Number.isNaN(parse(m.start)) && !Number.isNaN(parse(m.end)));
  const min = valid.length ? Math.min(...valid.map((m) => parse(m.start))) : 0;
  const max = valid.length ? Math.max(...valid.map((m) => parse(m.end))) : 1;
  const span = Math.max(1, max - min);
  const sorted = [...list].sort((a, b) => (parse(a.start) || 0) - (parse(b.start) || 0));
  const todayPct = ((parse(TODAY) - min) / span) * 100;

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const dInput: React.CSSProperties = { border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#5a6470", height: 44, outline: "none", padding: "0 8px", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="SCHEDULE" subtitle={`${job.meta.name} · MILESTONES`}>
        <ToolBarButton label="+ NEW MILESTONE" onClick={add} />
      </ToolBar>

      {/* timeline */}
      <div style={{ padding: 22 }}>
        <div style={{ background: "#15212d", color: "#f4f3f0", padding: "16px 20px 20px" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Project Timeline</div>
          {valid.length === 0 ? (
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#7f8c99" }}>Add milestones with start &amp; end dates to see the timeline.</div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* today marker */}
              {todayPct >= 0 && todayPct <= 100 && (
                <div style={{ position: "absolute", left: `calc(200px + (100% - 200px) * ${todayPct / 100})`, top: 0, bottom: 0, width: 2, background: "#e3705c", zIndex: 2 }}>
                  <span style={{ position: "absolute", top: -16, left: -16, fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#e3705c" }}>TODAY</span>
                </div>
              )}
              {sorted.map((m) => {
                const s = parse(m.start), e = parse(m.end);
                const left = Number.isNaN(s) ? 0 : ((s - min) / span) * 100;
                const width = Number.isNaN(s) || Number.isNaN(e) ? 1 : Math.max(1.5, ((e - s) / span) * 100);
                const milestone = m.start === m.end;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 200, flex: "none", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 12, color: "#dfe4e9", paddingRight: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                    <div style={{ flex: 1, position: "relative", height: 22, background: "#0e1a24", borderRadius: 2 }}>
                      {milestone ? (
                        <div title={m.start} style={{ position: "absolute", left: `${left}%`, top: 1, width: 18, height: 18, transform: "translateX(-9px) rotate(45deg)", background: stColor(m.status) }} />
                      ) : (
                        <div title={`${m.start} → ${m.end}`} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 3, height: 16, background: stColor(m.status), borderRadius: 2, minWidth: 4 }} />
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", marginLeft: 200, marginTop: 8, justifyContent: "space-between", fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#7f8c99" }}>
                <span>{new Date(min).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
                <span>{new Date(max).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
              </div>
            </div>
          )}
        </div>

        {/* editable list */}
        <div className="xscroll" style={{ marginTop: 18 }}>
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 820 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 46 }}>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>Milestone</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Phase</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Start</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>End</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>
            {list.map((m) => {
              const sm = stMeta(m.status);
              return (
                <div key={m.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9", borderLeft: `4px solid ${stColor(m.status)}` }}>
                  <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 4 }}>
                    <input value={m.title} onChange={(e) => setItem(m.id, { title: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#15212d", height: 44, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={m.phase} onChange={(e) => setItem(m.id, { phase: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#5a6470", height: 44, outline: "none", padding: "0 12px" }} />
                  </div>
                  <div style={{ width: 130, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input type="date" value={m.start} onChange={(e) => setItem(m.id, { start: e.target.value })} style={dInput} />
                  </div>
                  <div style={{ width: 130, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input type="date" value={m.end} onChange={(e) => setItem(m.id, { end: e.target.value })} style={dInput} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={m.status} onChange={(e) => setItem(m.id, { status: e.target.value as Milestone["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: sm.bg, color: sm.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Not Started", "In Progress", "Complete"].map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => setList(list.filter((x) => x.id !== m.id))} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>Milestones and phases on a live timeline — same-day items show as diamonds, durations as bars, colored by status. The red line marks today.</div>
      </div>
    </div>
  );
}
