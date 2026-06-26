"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type Meeting, type ActionItem, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";
const MEETING_TYPES = ["Progress", "OAC (Owner-Architect-Contractor)", "Preconstruction", "Coordination", "Subcontractor", "Pre-Installation", "Safety / Toolbox", "Other"];

export default function MeetingsPage() {
  const { job, setJob } = useProject();
  const list = job.meetings;

  const setList = (n: Meeting[]) => setJob({ ...job, meetings: n });
  const setMtg = (id: string, patch: Partial<Meeting>) => setList(list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const addMtg = () => setList([{ id: newId(), title: "New meeting", type: "Progress", date: TODAY, time: "", location: "", attendees: "", recordedBy: "GC", notes: "", actions: [] }, ...list]);
  const itemsOf = (id: string) => list.find((m) => m.id === id)?.actions ?? [];
  const setAction = (mid: string, aid: string, patch: Partial<ActionItem>) => setMtg(mid, { actions: itemsOf(mid).map((a) => (a.id === aid ? { ...a, ...patch } : a)) });
  const addAction = (mid: string) => setMtg(mid, { actions: [...itemsOf(mid), { id: newId(), text: "", owner: "", done: false }] });
  const removeAction = (mid: string, aid: string) => setMtg(mid, { actions: itemsOf(mid).filter((a) => a.id !== aid) });

  const head = (): React.CSSProperties => ({ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#9a9488", textTransform: "uppercase", marginBottom: 4 });
  const fld: React.CSSProperties = { border: "1px solid #cfccc2", background: "#faf9f6", fontFamily: "'Barlow'", fontSize: 13, color: "#15212d", outline: "none", padding: "7px 9px", borderRadius: 2 };
  const openActions = list.reduce((a, m) => a + m.actions.filter((x) => !x.done).length, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="MEETINGS" subtitle={`${job.meta.name} · MINUTES`}>
        <ToolBarButton label="+ NEW MEETING" onClick={addMtg} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>{list.length} meeting{list.length === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}><div style={head()}>Open Actions</div><div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: ACCENT }}>{openActions}</div></div>
      </div>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18, maxWidth: 880 }}>
        {list.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", padding: "46px 20px", textAlign: "center", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No meetings yet</div>
        )}
        {list.map((m) => (
          <div key={m.id} style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${ACCENT}` }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap", padding: "16px 18px", borderBottom: "1px solid #efeee9" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={head()}>Title</div>
                <input value={m.title} onChange={(e) => setMtg(m.id, { title: e.target.value })} style={{ ...fld, width: "100%", fontWeight: 700, fontSize: 16, fontFamily: "'Barlow Condensed'", textTransform: "uppercase", letterSpacing: "0.02em" }} />
              </div>
              <div>
                <div style={head()}>Date</div>
                <input type="date" value={m.date} onChange={(e) => setMtg(m.id, { date: e.target.value })} style={{ ...fld, fontFamily: "'JetBrains Mono'" }} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={head()}>Attendees</div>
                <input value={m.attendees} onChange={(e) => setMtg(m.id, { attendees: e.target.value })} placeholder="Who attended" style={{ ...fld, width: "100%" }} />
              </div>
              <button onClick={() => setList(list.filter((x) => x.id !== m.id))} style={{ width: 30, height: 30, border: "1px solid #d6d3cb", background: "transparent", color: "#a59f92", cursor: "pointer", borderRadius: 2, fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={head()}>Meeting Type</div>
                  <select value={m.type ?? "Progress"} onChange={(e) => setMtg(m.id, { type: e.target.value })} style={{ ...fld, width: "100%", cursor: "pointer" }}>
                    {MEETING_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <div style={head()}>Time</div>
                  <input value={m.time ?? ""} onChange={(e) => setMtg(m.id, { time: e.target.value })} placeholder="e.g. 10:00 AM" style={{ ...fld, width: "100%" }} />
                </div>
                <div>
                  <div style={head()}>Location</div>
                  <input value={m.location ?? ""} onChange={(e) => setMtg(m.id, { location: e.target.value })} placeholder="Trailer, Zoom, site…" style={{ ...fld, width: "100%" }} />
                </div>
                <div>
                  <div style={head()}>Recorded By</div>
                  <input value={m.recordedBy ?? ""} onChange={(e) => setMtg(m.id, { recordedBy: e.target.value })} placeholder="Who took minutes" style={{ ...fld, width: "100%" }} />
                </div>
              </div>
              <div style={head()}>Notes / Minutes</div>
              <textarea value={m.notes} onChange={(e) => setMtg(m.id, { notes: e.target.value })} rows={3} placeholder="Discussion, decisions…" style={{ width: "100%", border: "1px solid #e7e5dd", resize: "vertical", fontFamily: "'Barlow'", fontSize: 14, lineHeight: 1.6, color: "#33404c", outline: "none", background: "#faf9f6", padding: 10, borderRadius: 2 }} />
              <div style={{ ...head(), marginTop: 14 }}>Action Items</div>
              {m.actions.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #efeee9" }}>
                  <input type="checkbox" checked={a.done} onChange={(e) => setAction(m.id, a.id, { done: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#1f7a44", flex: "none" }} />
                  <input value={a.text} onChange={(e) => setAction(m.id, a.id, { text: e.target.value })} placeholder="Action item…" style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 14, color: a.done ? "#9a9488" : "#1c2b3a", textDecoration: a.done ? "line-through" : "none", outline: "none" }} />
                  <input value={a.owner} onChange={(e) => setAction(m.id, a.id, { owner: e.target.value })} placeholder="Owner" style={{ width: 120, border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470", outline: "none", textAlign: "right" }} />
                  <button onClick={() => removeAction(m.id, a.id)} style={{ width: 22, height: 22, flex: "none", border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>
              ))}
              <button onClick={() => addAction(m.id)} style={{ marginTop: 10, background: "transparent", border: "1px solid #15212d", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", padding: "6px 11px", cursor: "pointer", borderRadius: 2 }}>+ Action Item</button>
            </div>
          </div>
        ))}
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>Record meeting minutes with attendees and trackable action items. Check off actions as they&apos;re done. Ask the assistant to draft a meeting.</div>
      </div>
    </div>
  );
}
