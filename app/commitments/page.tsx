"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar } from "../ToolBar";
import { type Commitment, compute, money0, CSI_CATALOG, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const STATUS = ["Draft", "Out for Signature", "Executed", "Closed"] as const;

const statusMeta = (s: string) =>
  s === "Executed" ? { bg: "#e8f3ec", color: "#1f7a44" }
  : s === "Out for Signature" ? { bg: "#fbf1dd", color: "#9a6a13" }
  : s === "Closed" ? { bg: "#e3edf6", color: "#2c5d86" }
  : { bg: "#efeee9", color: "#6b6457" };

export default function CommitmentsPage() {
  const { job, setJob } = useProject();
  const c = compute(job);
  const list = job.commitments;

  const committed = list.reduce((a, x) => a + x.amount, 0);
  const subs = list.filter((x) => x.type === "Subcontract").reduce((a, x) => a + x.amount, 0);
  const pos = list.filter((x) => x.type === "Purchase Order").reduce((a, x) => a + x.amount, 0);
  const variance = c.direct - committed; // budget minus committed

  const setList = (next: Commitment[]) => setJob({ ...job, commitments: next });
  const setItem = (id: string, patch: Partial<Commitment>) => setList(list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeItem = (id: string) => setList(list.filter((x) => x.id !== id));
  const add = (type: Commitment["type"]) => {
    const prefix = type === "Subcontract" ? "SC" : "PO";
    const n = list.filter((x) => x.type === type).length + 1;
    setList([...list, { id: newId(), number: `${prefix}-${String(n).padStart(3, "0")}`, type, company: "", division: "09", description: "", amount: 0, status: "Draft" }]);
  };

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const cell: React.CSSProperties = { width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" };
  const summaryItem = (label: string, val: string, color = "#f4f3f0") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 20, color }}>{val}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="COMMITMENTS" subtitle={`${job.meta.name} · BUYOUT`}>
        <button onClick={() => add("Subcontract")} style={{ border: "none", background: "transparent", color: "#9aa6b2", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", padding: "0 16px", cursor: "pointer" }}>+ SUBCONTRACT</button>
        <button onClick={() => add("Purchase Order")} style={{ border: "none", background: ACCENT, color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", padding: "0 18px", cursor: "pointer" }}>+ PO</button>
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "18px 22px", display: "flex", alignItems: "center", gap: 34, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        {summaryItem("Total Committed", money0(committed), ACCENT)}
        {summaryItem("Subcontracts", money0(subs))}
        {summaryItem("Purchase Orders", money0(pos))}
        {summaryItem("Estimate Budget", money0(c.direct))}
        <div style={{ flex: 1 }} />
        <div style={{ background: "#15212d", border: `1px solid ${variance >= 0 ? "#3a4a5b" : "#7a3a32"}`, padding: "10px 22px", display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{variance >= 0 ? "Under Budget" : "Over Budget"}</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 22, color: variance >= 0 ? "#5fbf86" : "#e3705c" }}>{money0(Math.abs(variance))}</span>
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 1012 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ width: 84, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>#</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Type</div>
              <div style={{ width: 200, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Company</div>
              <div style={{ width: 64, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Div</div>
              <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Description</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Amount</div>
              <div style={{ width: 160, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>

            {list.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", color: "#9a9488", textTransform: "uppercase" }}>No commitments yet</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#b0aa9c", marginTop: 6 }}>Add subcontracts and POs to track buyout against your estimate.</div>
              </div>
            ) : list.map((x) => {
              const st = statusMeta(x.status);
              return (
                <div key={x.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                  <div style={{ width: 84, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <input value={x.number} onChange={(e) => setItem(x.id, { number: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", height: 48, outline: "none", padding: 0 }} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    <select value={x.type} onChange={(e) => setItem(x.id, { type: e.target.value as Commitment["type"] })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 12, color: "#1c2b3a", textAlign: "center", textAlignLast: "center", height: 48, outline: "none", cursor: "pointer" }}>
                      <option value="Subcontract">Subcontract</option>
                      <option value="Purchase Order">Purchase Order</option>
                    </select>
                  </div>
                  <div style={{ width: 200, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={x.company} onChange={(e) => setItem(x.id, { company: e.target.value })} placeholder="Company" style={{ ...cell, fontWeight: 600, fontSize: 14, color: "#15212d" }} />
                  </div>
                  <div style={{ width: 64, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <select value={x.division} onChange={(e) => setItem(x.id, { division: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", textAlign: "center", textAlignLast: "center", height: 48, outline: "none", cursor: "pointer" }}>
                      {CSI_CATALOG.map(([code]) => (<option key={code} value={code}>{code}</option>))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 200, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={x.description} onChange={(e) => setItem(x.id, { description: e.target.value })} placeholder="Scope" style={cell} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", background: "#faf9f6" }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#8a8578", paddingLeft: 14 }}>$</span>
                    <input value={x.amount} onFocus={(e) => e.target.select()} onChange={(e) => setItem(x.id, { amount: num(e.target.value) })} inputMode="decimal" style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d", textAlign: "right", height: 48, outline: "none", padding: "0 14px 0 4px" }} />
                  </div>
                  <div style={{ width: 160, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                    <select value={x.status} onChange={(e) => setItem(x.id, { status: e.target.value as Commitment["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                      {STATUS.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => removeItem(x.id)} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}`, height: 50 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Committed</div>
              <div style={{ width: 150, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, color: ACCENT }}>{money0(committed)}</div>
              <div style={{ width: 160, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)" }} />
              <div style={{ width: 44, flex: "none" }} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Buyout tracks your subcontracts and POs against the estimate&apos;s direct cost ({money0(c.direct)}). A positive variance means you&apos;re bought out under budget. Edit the estimate to move the budget.</div>
      </div>
    </div>
  );
}
