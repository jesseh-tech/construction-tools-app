"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarLink, ToolBarButton } from "../ToolBar";
import { compute, sov, money0 } from "@/lib/store";

const ACCENT = "#f5a623";
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

export default function SovPage() {
  const { job, setJob } = useProject();
  const c = compute(job);
  const s = sov(job, c);

  const setPct = (id: string, v: number) => setJob({ ...job, billing: { ...job.billing, pct: { ...job.billing.pct, [id]: v } } });
  const setRetainage = (v: number) => setJob({ ...job, billing: { ...job.billing, retainage: v } });

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const summaryItem = (label: string, val: string, accent = false) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 21, color: accent ? ACCENT : "#f4f3f0" }}>{val}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="SCHEDULE OF VALUES" subtitle={`${job.meta.name} · BID ${job.meta.bidNo}`}>
        <ToolBarLink href="/estimate" label="← ESTIMATE" />
        <ToolBarButton label="PRINT / PDF →" onClick={() => window.print()} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "18px 22px", display: "flex", alignItems: "center", gap: 34, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        {summaryItem("Scheduled Value", money0(s.schedTotal), true)}
        {summaryItem("Completed to Date", money0(s.completedTotal))}
        {summaryItem("Balance to Finish", money0(s.balanceTotal))}
        {summaryItem("% Billed", `${s.pctBilled.toFixed(1)}%`)}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#15212d", border: "1px solid #314252", padding: "9px 14px", borderRadius: 2 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", color: "#7f8c99", textTransform: "uppercase" }}>Retainage</span>
          <input value={job.billing.retainage} onFocus={(e) => e.target.select()} onChange={(e) => setRetainage(num(e.target.value))} inputMode="decimal" style={{ width: 44, background: "#0e1820", border: "1px solid #314252", color: "#f4f3f0", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, textAlign: "right", outline: "none", padding: "4px 6px", borderRadius: 2 }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#7f8c99" }}>%</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: ACCENT, marginLeft: 6 }}>{money0(s.retainTotal)}</span>
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb" }}>
          <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 50 }}>
            <div style={{ width: 60, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th, borderLeft: "none" }}>Item</div>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", paddingLeft: 14, ...th }}>Description of Work</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Scheduled Value</div>
            <div style={{ width: 96, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>% Compl.</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Completed</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Balance</div>
            <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Retainage</div>
          </div>

          {s.rows.map((r) => (
            <div key={r.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
              <div style={{ width: 60, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d" }}>{r.code}</div>
              <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", paddingLeft: 14, borderLeft: "1px solid #efeee9", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#1c2b3a" }}>{r.name}</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 13, color: "#1c2b3a" }}>{money0(r.sched)}</div>
              <div style={{ width: 96, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                <input className="est-cost" value={r.pct} onFocus={(e) => e.target.select()} onChange={(e) => setPct(r.id, num(e.target.value))} inputMode="decimal" style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#1c2b3a", textAlign: "center", height: 42, outline: "none", padding: "0 6px" }} />
              </div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d", background: "#faf9f6" }}>{money0(r.completed)}</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 13, color: "#5a6470" }}>{money0(r.balance)}</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 13, color: "#5a6470" }}>{money0(r.retain)}</div>
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}`, height: 54 }}>
            <div style={{ width: 60, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Grand Total</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: ACCENT }}>{money0(s.schedTotal)}</div>
            <div style={{ width: 96, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13 }}>{s.pctBilled.toFixed(1)}%</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: ACCENT }}>{money0(s.completedTotal)}</div>
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14 }}>{money0(s.balanceTotal)}</div>
            <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14 }}>{money0(s.retainTotal)}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Scheduled values are the estimate&apos;s division subtotals grossed up to the total bid price. Enter % complete per division to build a draw; edit the estimate to re-price the whole schedule.</div>
      </div>
    </div>
  );
}
