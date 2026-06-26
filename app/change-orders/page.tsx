"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { AddRow } from "../AddControls";
import { type ChangeOrder, compute, money0, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

const statusStyle = (s: string) =>
  s === "approved" ? { bg: "#e8f3ec", color: "#1f7a44", bar: "#1f7a44" }
  : s === "rejected" ? { bg: "#f6e7e3", color: "#b3402f", bar: "#b3402f" }
  : { bg: "#fbf1dd", color: "#9a6a13", bar: "#e0a93b" };

export default function ChangeOrdersPage() {
  const { job, setJob } = useProject();
  const c = compute(job);

  const setCO = (id: string, patch: Partial<ChangeOrder>) =>
    setJob({ ...job, changeOrders: job.changeOrders.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const removeCO = (id: string) => setJob({ ...job, changeOrders: job.changeOrders.filter((x) => x.id !== id) });
  const addCO = () => {
    const n = job.changeOrders.length + 1;
    setJob({ ...job, changeOrders: [...job.changeOrders, { id: newId(), no: `CO-${String(n).padStart(3, "0")}`, date: new Date().toISOString().slice(0, 10), desc: "", status: "pending", amount: 0 }] });
  };

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const band = (label: string, val: string, color: string) => (
    <div style={{ padding: "6px 26px 6px 0", borderRight: "1px solid #314252", marginRight: 26 }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 22, marginTop: 4, color }}>{val}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="CHANGE ORDER LOG" subtitle={`${job.meta.name} · BID ${job.meta.bidNo}`}>
        <ToolBarButton label="+ NEW CHANGE ORDER" onClick={addCO} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "18px 22px", display: "flex", alignItems: "stretch", flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        {band("Original Contract", money0(c.total), "#f4f3f0")}
        {band("Approved Changes", `${c.coApproved >= 0 ? "+" : ""}${money0(c.coApproved)}`, c.coApproved > 0 ? "#5fbf86" : c.coApproved < 0 ? "#e3705c" : "#f4f3f0")}
        {band("Pending", `${c.coPending >= 0 ? "+" : ""}${money0(c.coPending)}`, "#e0a93b")}
        <div style={{ flex: 1 }} />
        <div style={{ background: "#15212d", border: `1px solid ${ACCENT}`, padding: "10px 26px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: ACCENT, textTransform: "uppercase" }}>Revised Contract</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 26, marginTop: 3, color: ACCENT }}>{money0(c.adjustedContract)}</div>
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb" }}>
          <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 50 }}>
            <div style={{ width: 108, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>CO #</div>
            <div style={{ width: 124, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Date</div>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Description</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Status</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Amount</div>
            <div style={{ width: 46, flex: "none" }} />
          </div>

          {job.changeOrders.length === 0 ? (
            <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", color: "#9a9488", textTransform: "uppercase" }}>No change orders yet</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#b0aa9c", marginTop: 6 }}>Click &ldquo;+ New Change Order&rdquo; to log a contract modification.</div>
            </div>
          ) : job.changeOrders.map((co) => {
            const st = statusStyle(co.status);
            return (
              <div key={co.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                <div style={{ width: 108, flex: "none", display: "flex", alignItems: "center", paddingLeft: 16, borderLeft: `4px solid ${st.bar}` }}>
                  <input value={co.no} onChange={(e) => setCO(co.id, { no: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d", height: 46, outline: "none", padding: 0 }} />
                </div>
                <div style={{ width: 124, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={co.date} onChange={(e) => setCO(co.id, { date: e.target.value })} type="date" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#1c2b3a", height: 46, outline: "none", padding: "0 8px" }} />
                </div>
                <div style={{ flex: 1, minWidth: 200, borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={co.desc} onChange={(e) => setCO(co.id, { desc: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 46, outline: "none", padding: "0 12px" }} />
                </div>
                <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                  <select value={co.status} onChange={(e) => setCO(co.id, { status: e.target.value as ChangeOrder["status"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: st.bg, color: st.color, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", background: "#faf9f6" }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#8a8578", paddingLeft: 14 }}>$</span>
                  <input value={co.amount} onFocus={(e) => e.target.select()} onChange={(e) => setCO(co.id, { amount: num(e.target.value) })} inputMode="decimal" style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d", textAlign: "right", height: 46, outline: "none", padding: "0 14px 0 4px" }} />
                </div>
                <div style={{ width: 46, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => removeCO(co.id)} style={{ width: 26, height: 26, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 12, borderRadius: 2 }}>✕</button>
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}`, height: 54 }}>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Net Change (Approved)</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#7f8c99" }}>{job.changeOrders.length} TOTAL</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, color: ACCENT }}>{money0(c.coApproved)}</div>
            <div style={{ width: 46, flex: "none" }} />
          </div>
        </div>
        <AddRow label="+ New change order" onClick={addCO} />
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Only <b>approved</b> change orders adjust the contract value. The revised contract flows to the dashboard and pay application; pending items are tracked but not yet billed.</div>
      </div>
    </div>
  );
}
