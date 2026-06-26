"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { AddRow } from "../AddControls";
import { type Transmittal, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TODAY = "2026-06-25";
const VIA = ["Email", "Hand", "Courier", "Mail", "Upload"] as const;

export default function TransmittalsPage() {
  const { job, setJob } = useProject();
  const list = job.transmittals;

  const setList = (n: Transmittal[]) => setJob({ ...job, transmittals: n });
  const setItem = (id: string, patch: Partial<Transmittal>) => setList(list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const add = () => setList([{ id: newId(), number: `TR-${String(list.length + 1).padStart(3, "0")}`, date: TODAY, to: "", subject: "", via: "Email", status: "Sent" }, ...list]);

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const cell: React.CSSProperties = { border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 14, color: "#1c2b3a", height: 46, outline: "none", padding: "0 12px", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="TRANSMITTALS" subtitle={`${job.meta.name} · DOCUMENT LOG`}>
        <ToolBarButton label="+ NEW TRANSMITTAL" onClick={add} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>{list.length} transmittal{list.length === 1 ? "" : "s"}</span>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 940 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ width: 90, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>#</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Date</div>
              <div style={{ width: 180, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>To</div>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Subject</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Via</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>
            {list.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No transmittals logged</div>
            ) : list.map((t) => {
              const st = t.status === "Received" ? { bg: "#e8f3ec", color: "#1f7a44" } : { bg: "#e3edf6", color: "#2c5d86" };
              return (
                <div key={t.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                  <div style={{ width: 90, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <input value={t.number} onChange={(e) => setItem(t.id, { number: e.target.value })} style={{ ...cell, fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", padding: 0 }} />
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input type="date" value={t.date} onChange={(e) => setItem(t.id, { date: e.target.value })} style={{ ...cell, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#5a6470", padding: "0 8px" }} />
                  </div>
                  <div style={{ width: 180, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={t.to} onChange={(e) => setItem(t.id, { to: e.target.value })} placeholder="Recipient" style={{ ...cell, fontWeight: 600 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 220, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={t.subject} onChange={(e) => setItem(t.id, { subject: e.target.value })} placeholder="What was sent…" style={cell} />
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    <select value={t.via} onChange={(e) => setItem(t.id, { via: e.target.value as Transmittal["via"] })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 12, color: "#1c2b3a", textAlign: "center", textAlignLast: "center", height: 46, outline: "none", cursor: "pointer" }}>
                      {VIA.map((v) => (<option key={v} value={v}>{v}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 120, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={t.status} onChange={(e) => setItem(t.id, { status: e.target.value as Transmittal["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {["Sent", "Received"].map((s) => (<option key={s} value={s}>{s}</option>))}
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
        <AddRow label="+ Add a transmittal" onClick={add} />
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578" }}>A record of documents, drawings and submittals you&apos;ve sent — who got what, when and how. Ask the assistant to log one.</div>
      </div>
    </div>
  );
}
