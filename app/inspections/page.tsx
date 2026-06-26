"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type Inspection, type ChecklistItem, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";
const RESULTS: ChecklistItem["result"][] = ["Pass", "Fail", "N/A"];

const resColor = (r: string) => (r === "Pass" ? { bg: "#1f7a44", fg: "#fff" } : r === "Fail" ? { bg: "#b3402f", fg: "#fff" } : { bg: "#8a8578", fg: "#fff" });
const statusMeta = (s: string) => (s === "Passed" ? { bg: "#e8f3ec", color: "#1f7a44" } : s === "Failed" ? { bg: "#f6e7e3", color: "#b3402f" } : { bg: "#fbf1dd", color: "#9a6a13" });

export default function InspectionsPage() {
  const { job, setJob } = useProject();
  const list = job.inspections;

  const setList = (next: Inspection[]) => setJob({ ...job, inspections: next });
  const setInsp = (id: string, patch: Partial<Inspection>) => setList(list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeInsp = (id: string) => setList(list.filter((x) => x.id !== id));
  const addInsp = () => setList([{ id: newId(), title: "New inspection", type: "Quality", date: TODAY, inspector: "GC", status: "Open", items: [{ id: newId(), text: "", result: "" }] }, ...list]);
  const setItem = (iid: string, itemId: string, patch: Partial<ChecklistItem>) =>
    setInsp(iid, { items: (list.find((x) => x.id === iid)?.items ?? []).map((it) => (it.id === itemId ? { ...it, ...patch } : it)) });
  const addItem = (iid: string) => setInsp(iid, { items: [...(list.find((x) => x.id === iid)?.items ?? []), { id: newId(), text: "", result: "" }] });
  const removeItem = (iid: string, itemId: string) => setInsp(iid, { items: (list.find((x) => x.id === iid)?.items ?? []).filter((it) => it.id !== itemId) });

  const passed = list.filter((x) => x.status === "Passed").length;
  const failed = list.filter((x) => x.status === "Failed").length;

  const head = (label: string): React.CSSProperties => ({ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#9a9488", textTransform: "uppercase", marginBottom: 4 });
  const fld: React.CSSProperties = { border: "1px solid #cfccc2", background: "#faf9f6", fontFamily: "'Barlow'", fontSize: 13, color: "#15212d", outline: "none", padding: "7px 9px", borderRadius: 2 };
  const stat = (label: string, val: number, color = "#f4f3f0") => (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color }}>{val}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="INSPECTIONS & SAFETY" subtitle={`${job.meta.name} · QUALITY & SAFETY`}>
        <ToolBarButton label="+ NEW INSPECTION" onClick={addInsp} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>{list.length} inspection{list.length === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }} />
        {stat("Passed", passed, "#5fbf86")}
        {stat("Failed", failed, failed > 0 ? "#e3705c" : "#f4f3f0")}
        {stat("Open", list.length - passed - failed, ACCENT)}
      </div>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18, maxWidth: 920 }}>
        {list.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", padding: "46px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", color: "#9a9488", textTransform: "uppercase" }}>No inspections yet</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#b0aa9c", marginTop: 6 }}>Add a quality or safety checklist, or ask the assistant to create one.</div>
          </div>
        )}

        {list.map((insp) => {
          const st = statusMeta(insp.status);
          const isSafety = insp.type === "Safety";
          return (
            <div key={insp.id} style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${isSafety ? "#b3402f" : ACCENT}` }}>
              {/* header */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap", padding: "16px 18px", borderBottom: "1px solid #efeee9" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={head("Title")}>Title</div>
                  <input value={insp.title} onChange={(e) => setInsp(insp.id, { title: e.target.value })} style={{ ...fld, width: "100%", fontWeight: 700, fontSize: 16, fontFamily: "'Barlow Condensed'", letterSpacing: "0.02em", textTransform: "uppercase" }} />
                </div>
                <div>
                  <div style={head("Type")}>Type</div>
                  <select value={insp.type} onChange={(e) => setInsp(insp.id, { type: e.target.value as Inspection["type"] })} style={{ ...fld, cursor: "pointer" }}>
                    <option value="Quality">Quality</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
                <div>
                  <div style={head("Date")}>Date</div>
                  <input type="date" value={insp.date} onChange={(e) => setInsp(insp.id, { date: e.target.value })} style={{ ...fld, fontFamily: "'JetBrains Mono'" }} />
                </div>
                <div>
                  <div style={head("Inspector")}>Inspector</div>
                  <input value={insp.inspector} onChange={(e) => setInsp(insp.id, { inspector: e.target.value })} style={{ ...fld, width: 110 }} />
                </div>
                <div>
                  <div style={head("Status")}>Status</div>
                  <select value={insp.status} onChange={(e) => setInsp(insp.id, { status: e.target.value as Inspection["status"] })} style={{ ...fld, background: st.bg, color: st.color, fontWeight: 700, fontFamily: "'Barlow Condensed'", textTransform: "uppercase", cursor: "pointer" }}>
                    {["Open", "Passed", "Failed"].map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <button onClick={() => removeInsp(insp.id)} title="Delete inspection" style={{ width: 30, height: 30, border: "1px solid #d6d3cb", background: "transparent", color: "#a59f92", cursor: "pointer", borderRadius: 2, fontSize: 13 }}>✕</button>
              </div>

              {/* checklist */}
              <div style={{ padding: "6px 18px 14px" }}>
                {insp.items.map((it) => (
                  <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #efeee9" }}>
                    <input value={it.text} onChange={(e) => setItem(insp.id, it.id, { text: e.target.value })} placeholder="Checklist item…" style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", outline: "none" }} />
                    <div style={{ display: "flex", gap: 4, flex: "none" }}>
                      {RESULTS.map((r) => {
                        const active = it.result === r;
                        const col = resColor(r);
                        return (
                          <button
                            key={r}
                            onClick={() => setItem(insp.id, it.id, { result: active ? "" : r })}
                            style={{ minWidth: 40, padding: "5px 8px", border: "1px solid #d6d3cb", borderRadius: 2, cursor: "pointer", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", background: active ? col.bg : "#fff", color: active ? col.fg : "#8a8578" }}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => removeItem(insp.id, it.id)} style={{ width: 22, height: 22, flex: "none", border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addItem(insp.id)} style={{ marginTop: 10, background: "transparent", border: "1px solid #15212d", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", padding: "6px 11px", cursor: "pointer", borderRadius: 2 }}>+ Checklist Item</button>
              </div>
            </div>
          );
        })}
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Run quality and safety checklists with Pass / Fail / N/A per item. Ask the assistant: &ldquo;create a safety inspection with ladders tied off, PPE worn, and fire extinguisher present.&rdquo;</div>
      </div>
    </div>
  );
}
