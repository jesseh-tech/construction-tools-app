"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarLink, ToolBarButton } from "../ToolBar";
import { compute, sov, money0 } from "@/lib/store";

const ACCENT = "#f5a623";
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

export default function PayAppPage() {
  const { job, setJob } = useProject();
  const c = compute(job);
  const s = sov(job, c);
  const retPct = job.billing.retainage;

  const origContract = c.total;
  const contractSum = origContract + c.coApproved;
  const pctBilled = c.total > 0 ? s.completedTotal / c.total : 0;
  const totalCompleted = s.completedTotal + c.coApproved * pctBilled;
  const totalRetain = (totalCompleted * retPct) / 100;
  const earnedLessRetain = totalCompleted - totalRetain;
  const priorPayments = earnedLessRetain * (job.payapp.priorPct || 0);
  const due = earnedLessRetain - priorPayments;

  const setBilling = (v: number) => setJob({ ...job, billing: { ...job.billing, retainage: v } });
  const setPayApp = (patch: Partial<typeof job.payapp>) => setJob({ ...job, payapp: { ...job.payapp, ...patch } });

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", borderLeft: "1px solid rgba(255,255,255,0.06)" };

  const summary: [string, string, string, number, string][] = [
    ["1", "Original Contract Sum", money0(origContract), 500, ""],
    ["2", "Net Change by Change Orders", `${c.coApproved >= 0 ? "+" : ""}${money0(c.coApproved)}`, 500, ""],
    ["3", "Contract Sum to Date", money0(contractSum), 700, "#faf9f6"],
    ["4", "Total Completed & Stored to Date", money0(totalCompleted), 500, ""],
    ["5", `Retainage (${retPct.toFixed(1)}%)`, `(${money0(totalRetain)})`, 500, ""],
    ["6", "Total Earned Less Retainage", money0(earnedLessRetain), 700, "#faf9f6"],
    ["7", "Less Previous Certificates for Payment", `(${money0(priorPayments)})`, 500, ""],
  ];
  const payRows: [string, string, number, string][] = [
    ["Total Earned Less Retainage", money0(earnedLessRetain), 500, "#5a6470"],
    ["Less Previous Payments", `(${money0(priorPayments)})`, 500, "#5a6470"],
    ["Current Payment Due", money0(due), 700, "#15212d"],
    ["Balance to Finish (incl. retainage)", money0(contractSum - earnedLessRetain), 500, "#5a6470"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="PAY APPLICATION" subtitle={`${job.meta.name} · APP #${job.payapp.appNo}`}>
        <ToolBarLink href="/sov" label="← SOV" />
        <ToolBarButton label="PRINT / PDF →" onClick={() => window.print()} />
      </ToolBar>

      {/* meta strip */}
      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Application #</span>
          <input value={job.payapp.appNo} onChange={(e) => setPayApp({ appNo: e.target.value })} style={{ width: 48, background: "#15212d", border: "1px solid #314252", color: "#f4f3f0", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, textAlign: "center", outline: "none", padding: 5, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>Period To</span>
          <input value={job.payapp.periodTo} onChange={(e) => setPayApp({ periodTo: e.target.value })} type="date" style={{ background: "#15212d", border: "1px solid #314252", color: "#f4f3f0", fontFamily: "'JetBrains Mono'", fontSize: 12, outline: "none", padding: "5px 8px", borderRadius: 2 }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#15212d", border: "1px solid #314252", padding: "7px 14px", borderRadius: 2 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", color: "#7f8c99", textTransform: "uppercase" }}>Retainage</span>
          <input value={retPct} onFocus={(e) => e.target.select()} onChange={(e) => setBilling(num(e.target.value))} inputMode="decimal" style={{ width: 42, background: "#0e1820", border: "1px solid #314252", color: "#f4f3f0", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, textAlign: "right", outline: "none", padding: "4px 6px", borderRadius: 2 }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#7f8c99" }}>%</span>
        </div>
      </div>

      {/* G702 summary */}
      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb" }}>
          <div style={{ background: "#15212d", color: "#f4f3f0", padding: "12px 18px", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase" }}>Application &amp; Certificate for Payment</div>
          {summary.map(([no, label, val, weight, bg]) => (
            <div key={no} style={{ display: "flex", alignItems: "center", padding: "11px 18px", borderBottom: "1px solid #efeee9", background: bg || undefined }}>
              <div style={{ width: 38, flex: "none", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#9a9488" }}>{no}</div>
              <div style={{ flex: 1, fontFamily: "'Barlow'", fontWeight: weight, fontSize: 14, color: label.startsWith("Retainage") || label.startsWith("Less Previous") ? "#b3402f" : "#1c2b3a" }}>{label}</div>
              <div style={{ width: 170, textAlign: "right", fontFamily: "'JetBrains Mono'", fontWeight: weight, fontSize: 15, color: val.startsWith("(") ? "#b3402f" : "#1c2b3a" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* G703 continuation */}
      <div style={{ padding: 22 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1c2b3a", marginBottom: 10 }}>Continuation Sheet — Work Completed by Division</div>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
            <div style={{ width: 56, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th, borderLeft: "none" }}>Div</div>
            <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Description</div>
            <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", ...th }}>Scheduled</div>
            <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", ...th }}>Completed</div>
            <div style={{ width: 78, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>%</div>
            <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", ...th }}>Balance</div>
            <div style={{ width: 110, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", ...th }}>Retainage</div>
          </div>
          {s.rows.map((r) => (
            <div key={r.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
              <div style={{ width: 56, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d" }}>{r.code}</div>
              <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", paddingLeft: 12, borderLeft: "1px solid #efeee9", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 13, color: "#1c2b3a" }}>{r.name}</div>
              <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470" }}>{money0(r.sched)}</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", background: "#faf9f6" }}>{money0(r.completed)}</div>
              <div style={{ width: 78, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d" }}>{r.pct.toFixed(0)}%</div>
              <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470" }}>{money0(r.balance)}</div>
              <div style={{ width: 110, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid #efeee9", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470" }}>{money0(r.retain)}</div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}`, height: 50 }}>
            <div style={{ width: 56, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Totals</div>
            <div style={{ width: 130, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: ACCENT }}>{money0(s.schedTotal)}</div>
            <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: ACCENT }}>{money0(s.completedTotal)}</div>
            <div style={{ width: 78, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12 }}>{(pctBilled * 100).toFixed(0)}%</div>
            <div style={{ width: 120, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13 }}>{money0(s.balanceTotal)}</div>
            <div style={{ width: 110, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13 }}>{money0(s.retainTotal)}</div>
          </div>
        </div>

        {/* payment due */}
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 22 }}>
          <div style={{ flex: 1, minWidth: 300, background: "#fff", border: "1px solid #d6d3cb", padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1c2b3a", marginBottom: 12 }}>This Application</div>
            {payRows.map(([label, val, weight, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #efeee9" }}>
                <span style={{ fontFamily: "'Barlow'", fontWeight: weight, fontSize: 14, color }}>{label}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: weight, fontSize: 15, color: val.startsWith("(") ? "#b3402f" : color }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 300, background: "#1c2b3a", color: "#f4f3f0", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 8, background: "repeating-linear-gradient(45deg,#1c2b3a 0 10px,#f5a623 10px 20px)" }} />
            <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 12, letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase" }}>Current Payment Due</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 40, color: ACCENT, lineHeight: 1, marginTop: 8 }}>{money0(due)}</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#7f8c99", lineHeight: 1.6, marginTop: 16 }}>Work completed to date less retainage and prior payments. Adjust % complete in the Schedule of Values; approved change orders flow in automatically.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
