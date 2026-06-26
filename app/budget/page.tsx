"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar } from "../ToolBar";
import { type BudgetLine, compute, money0 } from "@/lib/store";

const ACCENT = "#f5a623";

export default function BudgetPage() {
  const { job, setJob } = useProject();
  const c = compute(job);
  const divs = c.divisions.filter((d) => d.subtotal > 0);

  const lineFor = (code: string): BudgetLine => job.budget.find((b) => b.code === code) ?? { code, committed: 0, actual: 0 };
  const setLine = (code: string, patch: Partial<BudgetLine>) => {
    const exists = job.budget.some((b) => b.code === code);
    const next = exists
      ? job.budget.map((b) => (b.code === code ? { ...b, ...patch } : b))
      : [...job.budget, { code, committed: 0, actual: 0, ...patch }];
    setJob({ ...job, budget: next });
  };
  const num = (v: string) => { const n = parseFloat(v.replace(/[^0-9.-]/g, "")); return Number.isFinite(n) ? n : 0; };

  const totBudget = divs.reduce((a, d) => a + d.subtotal, 0);
  const totCommitted = divs.reduce((a, d) => a + lineFor(d.code).committed, 0);
  const totActual = divs.reduce((a, d) => a + lineFor(d.code).actual, 0);
  const totVar = totBudget - totActual;

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const moneyInput: React.CSSProperties = { width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 13, color: "#1c2b3a", textAlign: "right", height: 44, outline: "none", padding: "0 14px" };

  const Stat = ({ label, val, color }: { label: string; val: string; color?: string }) => (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 20, color: color ?? "#f4f3f0", marginTop: 2 }}>{val}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="BUDGET VS ACTUAL" subtitle={`${job.meta.name} · COST CONTROL`}>
        <button onClick={() => window.print()} style={{ border: "none", background: "transparent", color: "#9aa6b2", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", padding: "0 18px", cursor: "pointer" }}>PRINT</button>
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cost Control</span>
        <div style={{ flex: 1 }} />
        <Stat label="Budget" val={money0(totBudget)} color={ACCENT} />
        <Stat label="Committed" val={money0(totCommitted)} />
        <Stat label="Actual" val={money0(totActual)} />
        <Stat label="Variance" val={money0(totVar)} color={totVar < 0 ? "#e3705c" : "#5fb98a"} />
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 980 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>Division</div>
              <div style={{ width: 140, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Budget</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Committed</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Actual</div>
              <div style={{ width: 140, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", ...th }}>Variance</div>
              <div style={{ width: 92, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>% Spent</div>
            </div>
            {divs.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>Add line items in the Estimate to build a budget</div>
            ) : divs.map((d) => {
              const bl = lineFor(d.code);
              const variance = d.subtotal - bl.actual;
              const pct = d.subtotal > 0 ? (bl.actual / d.subtotal) * 100 : 0;
              const over = variance < 0;
              return (
                <div key={d.code} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9", borderLeft: `4px solid ${over ? "#b3402f" : "#e7e5dd"}` }}>
                  <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 10, paddingLeft: 16 }}>
                    <span style={{ flex: "none", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", background: "#efeee9", borderRadius: 2, padding: "2px 7px" }}>{d.code}</span>
                    <span style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#1c2b3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                  </div>
                  <div style={{ width: 140, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d" }}>{money0(d.subtotal)}</div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={bl.committed || ""} onFocus={(e) => e.target.select()} onChange={(e) => setLine(d.code, { committed: num(e.target.value) })} inputMode="numeric" placeholder="0" style={moneyInput} />
                  </div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                    <input value={bl.actual || ""} onFocus={(e) => e.target.select()} onChange={(e) => setLine(d.code, { actual: num(e.target.value) })} inputMode="numeric" placeholder="0" style={moneyInput} />
                  </div>
                  <div style={{ width: 140, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: over ? "#b3402f" : "#1f7a44" }}>{money0(variance)}</div>
                  <div style={{ width: 92, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "0 10px" }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: pct > 100 ? "#b3402f" : "#5a6470" }}>{pct.toFixed(0)}%</span>
                    <div style={{ width: "100%", height: 5, background: "#f0eee8", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: pct > 100 ? "#b3402f" : pct > 85 ? ACCENT : "#5fb98a" }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {divs.length > 0 && (
              <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}` }}>
                <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", paddingLeft: 16, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", height: 50 }}>Total</div>
                <div style={{ width: 140, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: ACCENT }}>{money0(totBudget)}</div>
                <div style={{ width: 150, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14 }}>{money0(totCommitted)}</div>
                <div style={{ width: 150, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14 }}>{money0(totActual)}</div>
                <div style={{ width: 140, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: totVar < 0 ? "#e3705c" : "#5fb98a" }}>{money0(totVar)}</div>
                <div style={{ width: 92, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Budget is pulled live from the Estimate&apos;s direct cost per division. Enter committed (subcontracts/POs) and actual cost-to-date to track variance. A <b style={{ color: "#b3402f" }}>red</b> row is over budget. Ask the assistant: &ldquo;set division 09 actual to 60,000.&rdquo;</div>
      </div>
    </div>
  );
}
