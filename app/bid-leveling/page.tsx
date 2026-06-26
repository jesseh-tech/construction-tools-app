"use client";

import { useEffect } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar } from "../ToolBar";
import { type BidLeveling, bidLevelingDefaults, money0, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

export default function BidLevelingPage() {
  const { job, setJob } = useProject();

  // Seed bid-leveling data if a saved job predates it.
  useEffect(() => {
    if (!job.bidLeveling) setJob({ ...job, bidLeveling: bidLevelingDefaults() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.bidLeveling]);

  const bl = job.bidLeveling;
  if (!bl) return null;

  const setBl = (next: BidLeveling) => setJob({ ...job, bidLeveling: next });
  const setTrade = (v: string) => setBl({ ...bl, trade: v });
  const setScopeLabel = (id: string, v: string) => setBl({ ...bl, scope: bl.scope.map((s) => (s.id === id ? { ...s, label: v } : s)) });
  const removeScope = (id: string) => setBl({ ...bl, scope: bl.scope.filter((s) => s.id !== id) });
  const addScope = () => setBl({ ...bl, scope: [...bl.scope, { id: newId(), label: "New scope line" }] });
  const setSubName = (id: string, v: string) => setBl({ ...bl, subs: bl.subs.map((s) => (s.id === id ? { ...s, name: v } : s)) });
  const removeSub = (id: string) => setBl({ ...bl, subs: bl.subs.filter((s) => s.id !== id) });
  const addSub = () => setBl({ ...bl, subs: [...bl.subs, { id: newId(), name: "New Bidder", prices: {} }] });
  const setPrice = (subId: string, scopeId: string, v: string) =>
    setBl({ ...bl, subs: bl.subs.map((s) => (s.id === subId ? { ...s, prices: { ...s.prices, [scopeId]: v } } : s)) });

  const subTotals = bl.subs.map((sub) => bl.scope.reduce((t, sc) => t + num(sub.prices[sc.id]), 0));
  const valid = subTotals.filter((t) => t > 0);
  const low = valid.length ? Math.min(...valid) : 0;
  const lowIdx = subTotals.indexOf(low);

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="BID LEVELING" subtitle={`${job.meta.name} · SUBCONTRACTOR COMPARISON`}>
        <button onClick={addScope} style={{ border: "none", background: "transparent", color: "#9aa6b2", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", padding: "0 18px", cursor: "pointer" }}>+ SCOPE LINE</button>
        <button onClick={addSub} style={{ border: "none", background: ACCENT, color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", padding: "0 22px", cursor: "pointer" }}>+ ADD BIDDER</button>
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>Trade Package</span>
        <input value={bl.trade} onChange={(e) => setTrade(e.target.value)} style={{ flex: 1, minWidth: 200, maxWidth: 440, background: "transparent", border: "none", borderBottom: "1px solid #314252", color: "#f4f3f0", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", outline: "none", padding: "2px 0" }} />
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>Low Bidder</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: ACCENT, marginTop: 2 }}>{lowIdx >= 0 && low > 0 ? `${bl.subs[lowIdx].name} · ${money0(low)}` : "—"}</div>
        </div>
      </div>

      <div style={{ padding: 22, overflowX: "auto" }}>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 680 }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#f4f3f0" }}>
            <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", padding: "0 16px", height: 62, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa6b2" }}>Scope Item</div>
            {bl.subs.map((sub, i) => {
              const isLow = subTotals[i] === low && subTotals[i] > 0;
              return (
                <div key={sub.id} style={{ width: 178, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", padding: "9px 12px", display: "flex", flexDirection: "column", justifyContent: "center", background: isLow ? "#1f3326" : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input value={sub.name} onChange={(e) => setSubName(sub.id, e.target.value)} style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: "#f4f3f0", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em", outline: "none", padding: 0 }} />
                    <button onClick={() => removeSub(sub.id)} style={{ width: 20, height: 20, flex: "none", border: "none", background: "none", color: "#5e6b78", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                  </div>
                  {isLow && <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: "#15212d", background: ACCENT, padding: "2px 6px", borderRadius: 2, marginTop: 5, alignSelf: "flex-start" }}>LOW BID</div>}
                </div>
              );
            })}
          </div>

          {/* scope rows */}
          {bl.scope.map((sc) => (
            <div key={sc.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
              <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", paddingLeft: 16, gap: 8 }}>
                <input value={sc.label} onChange={(e) => setScopeLabel(sc.id, e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 44, outline: "none", padding: 0 }} />
                <button onClick={() => removeScope(sc.id)} style={{ width: 22, height: 22, flex: "none", border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2, marginRight: 6 }}>✕</button>
              </div>
              {bl.subs.map((sub) => {
                const blank = !sub.prices[sc.id] || num(sub.prices[sc.id]) === 0;
                return (
                  <div key={sub.id} style={{ width: 178, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", background: blank ? "#fbf1dd" : undefined }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#9a9488", paddingLeft: 12 }}>$</span>
                    <input value={sub.prices[sc.id] || ""} onFocus={(e) => e.target.select()} onChange={(e) => setPrice(sub.id, sc.id, e.target.value)} inputMode="decimal" placeholder="—" style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 13, color: "#1c2b3a", textAlign: "right", height: 44, outline: "none", padding: "0 12px 0 4px" }} />
                  </div>
                );
              })}
            </div>
          ))}

          {/* totals */}
          <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}` }}>
            <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 16, height: 54, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Base Bid Total</div>
            {bl.subs.map((sub, i) => {
              const isLow = subTotals[i] === low && subTotals[i] > 0;
              const delta = subTotals[i] - low;
              return (
                <div key={sub.id} style={{ width: 178, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", padding: "0 12px", background: isLow ? "#1f3326" : undefined }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, color: isLow ? ACCENT : "#f4f3f0" }}>{money0(subTotals[i])}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#7f8c99", marginTop: 2 }}>{subTotals[i] === 0 ? "no bid" : isLow ? "▼ low bid" : `+${money0(delta)}`}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Enter each bidder&apos;s price per scope line. The lowest base-bid column is flagged automatically; deltas show each bidder&apos;s spread above the low bid. Leave a cell blank to flag a <b>scope gap</b>.</div>
      </div>
    </div>
  );
}
