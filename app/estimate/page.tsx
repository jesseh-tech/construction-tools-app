"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEstimate } from "../EstimateProvider";
import {
  type Project,
  type Markups,
  type LineItem,
  UNITS,
  CSI_CATALOG,
  divisionTotals,
  estimateTotals,
  money,
} from "@/lib/estimate";

const ACCENT = "#f5a623";
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `c${Math.random()}`;

export default function EstimatePage() {
  const { estimate, setEstimate } = useEstimate();
  const [addOpen, setAddOpen] = useState(false);
  const t = estimateTotals(estimate);

  // ---- mutations ----
  const setProjectStr = (field: keyof Project, value: string) =>
    setEstimate({ ...estimate, project: { ...estimate.project, [field]: value } });
  const setSf = (value: number) =>
    setEstimate({ ...estimate, project: { ...estimate.project, sf: value } });
  const setMarkup = (field: keyof Markups, value: number) =>
    setEstimate({ ...estimate, markups: { ...estimate.markups, [field]: value } });

  const mapDiv = (did: string, fn: (d: import("@/lib/estimate").Division) => import("@/lib/estimate").Division) =>
    setEstimate({ ...estimate, divisions: estimate.divisions.map((d) => (d.id === did ? fn(d) : d)) });

  const setItem = (did: string, id: string, patch: Partial<LineItem>) =>
    mapDiv(did, (d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const removeItem = (did: string, id: string) =>
    mapDiv(did, (d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));
  const addLine = (did: string) =>
    mapDiv(did, (d) => ({
      ...d,
      items: [...d.items, { id: newId(), desc: "New line item", qty: 0, unit: "EA", m: 0, l: 0, e: 0, s: 0 }],
    }));
  const toggleDiv = (did: string) => mapDiv(did, (d) => ({ ...d, collapsed: !d.collapsed }));
  const removeDiv = (did: string) =>
    setEstimate({ ...estimate, divisions: estimate.divisions.filter((d) => d.id !== did) });
  const setAll = (collapsed: boolean) =>
    setEstimate({ ...estimate, divisions: estimate.divisions.map((d) => ({ ...d, collapsed })) });

  const csiToggle = (code: string, name: string) => {
    if (estimate.divisions.some((d) => d.code === code)) {
      setEstimate({ ...estimate, divisions: estimate.divisions.filter((d) => d.code !== code) });
      return;
    }
    const next = [...estimate.divisions, { id: newId(), code, name, collapsed: false, items: [] }];
    next.sort((a, b) => (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));
    setEstimate({ ...estimate, divisions: next });
  };
  const addBlankDivision = () =>
    setEstimate({
      ...estimate,
      divisions: [
        ...estimate.divisions,
        { id: newId(), code: "00", name: "New Division", collapsed: false, items: [] },
      ],
    });

  const usedCodes = new Set(estimate.divisions.map((d) => d.code));

  // ---- shared inline styles ----
  const headBtn: React.CSSProperties = {
    background: "transparent",
    border: "1.5px solid #1c2b3a",
    color: "#1c2b3a",
    fontFamily: "'Barlow Condensed'",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "8px 13px",
    cursor: "pointer",
    borderRadius: 2,
  };
  const pctBox: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginRight: 22,
    background: "#f4f3f0",
    border: "1.5px solid #cfccc2",
    padding: "5px 9px",
    borderRadius: 2,
  };
  const pctInput: React.CSSProperties = {
    width: 46,
    border: "none",
    background: "transparent",
    fontFamily: "'JetBrains Mono'",
    fontWeight: 700,
    fontSize: 14,
    textAlign: "right",
    color: "#1c2b3a",
    outline: "none",
    padding: 0,
  };
  const costCell: React.CSSProperties = {
    width: 104,
    flex: "none",
    borderLeft: "1px solid #efeee9",
    display: "flex",
    alignItems: "center",
  };
  const costInput: React.CSSProperties = {
    width: "100%",
    border: "none",
    background: "transparent",
    fontFamily: "'JetBrains Mono'",
    fontWeight: 500,
    fontSize: 13,
    color: "#1c2b3a",
    textAlign: "right",
    height: 40,
    outline: "none",
    padding: "0 12px",
  };
  const subCol = (w: number): React.CSSProperties => ({
    width: w,
    flex: "none",
    borderLeft: "1px solid #d8d5cc",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 12px",
    fontFamily: "'JetBrains Mono'",
    fontWeight: 500,
    fontSize: 12,
    color: "#5a6470",
  });
  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <div className="est" style={{ minHeight: "100vh", background: "#e7e5df" }}>
      {/* TOP APP BAR */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 60, display: "flex", alignItems: "stretch",
          height: 74, background: "#15212d", color: "#f4f3f0", borderBottom: `3px solid ${ACCENT}`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 13, padding: "0 22px",
            borderRight: "1px solid rgba(255,255,255,0.08)", flex: "none", textDecoration: "none", color: "inherit",
          }}
        >
          <Image src="/brand/10cent-icon.png" alt="10 Cent Investments" width={46} height={46} style={{ objectFit: "contain" }} />
          <div style={{ lineHeight: 0.94 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 22, letterSpacing: "0.04em" }}>10 CENT</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.26em", color: ACCENT }}>INVESTMENTS</div>
          </div>
        </Link>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", minWidth: 0, gap: 3 }}>
          <input
            className="est-underline"
            value={estimate.project.name}
            onChange={(e) => setProjectStr("name", e.target.value)}
            style={{ width: "100%", background: "transparent", border: "none", color: "#f4f3f0", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 21, outline: "none", padding: 0 }}
          />
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a96a3", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {estimate.project.client}&nbsp;&nbsp;·&nbsp;&nbsp;BID {estimate.project.bidNo}&nbsp;&nbsp;·&nbsp;&nbsp;{estimate.project.location}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", background: "#1c2b3a" }}>
          <div style={{ padding: "0 22px", textAlign: "right", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.22em", color: ACCENT }}>BID DUE</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 16, color: "#f4f3f0", marginTop: 2 }}>{estimate.project.dueLabel}</div>
          </div>
          <div style={{ padding: "0 26px", textAlign: "right" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.22em", color: "#7f8c99" }}>TOTAL BID PRICE</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 30, color: ACCENT, lineHeight: 1, marginTop: 2 }}>{money(t.total)}</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#7f8c99", marginTop: 3 }}>MARGIN {t.margin.toFixed(1)}%&nbsp;·&nbsp;${t.costPerSF.toFixed(2)}/SF</div>
          </div>
        </div>
      </div>

      {/* SUMMARY BAND */}
      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "18px 22px", display: "flex", alignItems: "center", gap: 34, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        {[
          ["Direct Cost", money(t.direct)],
          ["Line Items", String(t.lineCount)],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 21 }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>Building Area</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <input
              value={estimate.project.sf}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setSf(num(e.target.value))}
              inputMode="numeric"
              style={{ width: 76, background: "transparent", border: "none", borderBottom: "2px solid #3a4a5b", color: "#f4f3f0", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 21, outline: "none", padding: "0 0 1px" }}
            />
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 13, color: "#7f8c99" }}>SF</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>Cost / SF</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 21 }}>${t.costPerSF.toFixed(2)}</span>
        </div>

        {/* cost mix */}
        <div style={{ flex: 1, minWidth: 300, paddingLeft: 8 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase", marginBottom: 7 }}>Direct Cost Mix</div>
          <div style={{ display: "flex", height: 16, width: "100%", background: "#0e1820", overflow: "hidden" }}>
            <div style={{ width: `${t.matPct}%`, background: ACCENT }} />
            <div style={{ width: `${t.labPct}%`, background: "#5b768f" }} />
            <div style={{ width: `${t.eqPct}%`, background: "#8a94a0" }} />
            <div style={{ width: `${t.subPct}%`, background: "#c2802f" }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 9, flexWrap: "wrap" }}>
            {[
              ["Material", ACCENT, money(t.mat), t.matPct],
              ["Labor", "#5b768f", money(t.lab), t.labPct],
              ["Equip.", "#8a94a0", money(t.eq), t.eqPct],
              ["Subs", "#c2802f", money(t.sub), t.subPct],
            ].map(([name, color, val, pct]) => (
              <span key={name as string} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, background: color as string }} />
                <span style={{ color: "#c4ccd4" }}>{name}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 500 }}>{val}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", color: "#7f8c99" }}>{(pct as number).toFixed(0)}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "0 22px 48px" }}>
        {/* toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 0 14px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 23, letterSpacing: "0.05em", textTransform: "uppercase", color: "#1c2b3a" }}>Estimate Worksheet</h2>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", letterSpacing: "0.05em", borderLeft: "2px solid #c9c5b8", paddingLeft: 14 }}>CSI MASTERFORMAT · UNIT-PRICE METHOD</span>
          <div style={{ flex: 1 }} />
          <button style={headBtn} onClick={() => setAll(true)}>Collapse All</button>
          <button style={headBtn} onClick={() => setAll(false)}>Expand All</button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setAddOpen((o) => !o)}
              style={{ ...headBtn, background: ACCENT, border: `1.5px solid ${ACCENT}`, padding: "8px 15px" }}
            >
              + / − Divisions
            </button>
            {addOpen && (
              <>
                <div onClick={() => setAddOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 70 }} />
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 80, width: 430, maxHeight: 472, background: "#1c2b3a", border: "1px solid #0e1820", boxShadow: "0 20px 54px rgba(0,0,0,0.42)", display: "flex", flexDirection: "column", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "15px 16px 13px", background: "#15212d", borderBottom: "1px solid #0e1820" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase", color: "#f4f3f0" }}>CSI MasterFormat Divisions</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, color: "#8a96a3", marginTop: 3 }}>Click a division to add or remove it</div>
                    </div>
                    <button onClick={() => setAddOpen(false)} style={{ width: 26, height: 26, background: "transparent", border: "1px solid #3a4a5b", color: "#9aa6b2", cursor: "pointer", borderRadius: 2, fontSize: 12 }}>✕</button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {CSI_CATALOG.map(([code, name]) => {
                      const added = usedCodes.has(code);
                      return (
                        <div key={code} onClick={() => csiToggle(code, name)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", cursor: "pointer", borderBottom: "1px solid #243646" }}>
                          <span style={{ width: 40, flex: "none", height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, borderRadius: 2, background: added ? ACCENT : "#2c3e50", color: added ? "#1c2b3a" : "#8a96a3" }}>{code}</span>
                          <span style={{ flex: 1, fontFamily: "'Barlow'", fontWeight: 500, fontSize: 13, color: "#dfe4e9", lineHeight: 1.25 }}>{name}</span>
                          <span style={{ flex: "none", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: added ? "#e3705c" : ACCENT }}>{added ? "− REMOVE" : "+ ADD"}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={addBlankDivision} style={{ flex: "none", background: "#15212d", border: "none", borderTop: "1px solid #0e1820", color: "#9aa6b2", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", padding: 12, cursor: "pointer", textAlign: "center" }}>+ Add Blank Custom Division</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* table panel */}
        <div style={{ background: "#fff", border: "1px solid #d6d3cb" }}>
          {/* column header */}
          <div style={{ position: "sticky", top: 74, zIndex: 40, display: "flex", alignItems: "stretch", height: 50, background: "#15212d", color: "#9aa6b2", textTransform: "uppercase" }}>
            <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", paddingLeft: 16, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.13em" }}>Division / Line Item</div>
            <div style={{ width: 76, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>Qty</div>
            <div style={{ width: 80, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>Unit</div>
            {["Material", "Labor", "Equip.", "Subs"].map((h) => (
              <div key={h} style={{ width: 104, flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em" }}>{h}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5e6b78", letterSpacing: "0.08em" }}>$ / UNIT</span>
              </div>
            ))}
            <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>Line Total</div>
            <div style={{ width: 44, flex: "none" }} />
          </div>

          {/* divisions */}
          {estimate.divisions.map((grp) => {
            const dt = divisionTotals(grp);
            return (
              <div key={grp.id}>
                {/* division header */}
                <div style={{ display: "flex", alignItems: "center", height: 46, background: "#1c2b3a", color: "#f4f3f0", paddingLeft: 10, borderTop: "2px solid #0e1820" }}>
                  <button onClick={() => toggleDiv(grp.id)} style={{ width: 24, height: 24, background: "none", border: "none", color: ACCENT, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{grp.collapsed ? "▸" : "▾"}</button>
                  <input value={grp.code} onChange={(e) => mapDiv(grp.id, (d) => ({ ...d, code: e.target.value }))} style={{ width: 46, height: 28, background: ACCENT, color: "#1c2b3a", border: "none", textAlign: "center", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, margin: "0 12px 0 4px", outline: "none", borderRadius: 2 }} />
                  <input className="est-underline" value={grp.name} onChange={(e) => mapDiv(grp.id, (d) => ({ ...d, name: e.target.value }))} style={{ flex: 1, minWidth: 60, background: "transparent", border: "none", color: "#f4f3f0", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.03em", textTransform: "uppercase", outline: "none", padding: 0 }} />
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a96a3", marginRight: 14, whiteSpace: "nowrap" }}>{grp.items.length} ITEMS</span>
                  <button onClick={() => addLine(grp.id)} style={{ background: "transparent", border: "1px solid #3a4a5b", color: "#c4ccd4", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", padding: "5px 10px", marginRight: 8, cursor: "pointer", borderRadius: 2 }}>+ Line</button>
                  <button onClick={() => removeDiv(grp.id)} style={{ width: 26, height: 26, background: "transparent", border: "none", color: "#5e6b78", fontSize: 12, cursor: "pointer", marginRight: 6, borderRadius: 2 }}>✕</button>
                  <div style={{ width: 150, flex: "none", textAlign: "right", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, color: ACCENT, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>{money(dt.subtotal)}</div>
                  <div style={{ width: 44, flex: "none" }} />
                </div>

                {/* line items */}
                {!grp.collapsed &&
                  grp.items.map((ln) => (
                    <div key={ln.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                      <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", paddingLeft: 16 }}>
                        <input className="est-underline" value={ln.desc} onChange={(e) => setItem(grp.id, ln.id, { desc: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#1c2b3a", height: 40, outline: "none", padding: 0 }} />
                      </div>
                      <div style={{ width: 76, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                        <input className="est-cost" value={ln.qty} onFocus={(e) => e.target.select()} onChange={(e) => setItem(grp.id, ln.id, { qty: num(e.target.value) })} inputMode="decimal" style={{ ...costInput }} />
                      </div>
                      <div style={{ width: 80, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                        <select value={ln.unit} onChange={(e) => setItem(grp.id, ln.id, { unit: e.target.value })} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#1c2b3a", textAlign: "center", textAlignLast: "center", height: 40, outline: "none", cursor: "pointer", padding: "0 4px" }}>
                          {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
                        </select>
                      </div>
                      {(["m", "l", "e", "s"] as const).map((field) => (
                        <div key={field} style={costCell}>
                          <input className="est-cost" value={ln[field]} onFocus={(e) => e.target.select()} onChange={(e) => setItem(grp.id, ln.id, { [field]: num(e.target.value) })} inputMode="decimal" style={costInput} />
                        </div>
                      ))}
                      <div style={{ width: 150, flex: "none", borderLeft: "1px solid #e3e1da", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", background: "#faf9f6" }}>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: "#1c2b3a" }}>{money(ln.qty * (ln.m + ln.l + ln.e + ln.s))}</span>
                      </div>
                      <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <button onClick={() => removeItem(grp.id, ln.id)} style={{ width: 26, height: 26, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 12, borderRadius: 2 }}>✕</button>
                      </div>
                    </div>
                  ))}

                {/* division subtotal */}
                <div style={{ display: "flex", alignItems: "stretch", background: "#eceae3", borderTop: "2px solid #1c2b3a" }}>
                  <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1c2b3a" }}>Div {grp.code} · {grp.name} — Subtotal</div>
                  <div style={{ width: 76, flex: "none", borderLeft: "1px solid #d8d5cc" }} />
                  <div style={{ width: 80, flex: "none", borderLeft: "1px solid #d8d5cc" }} />
                  <div style={subCol(104)}>{money(dt.m)}</div>
                  <div style={subCol(104)}>{money(dt.l)}</div>
                  <div style={subCol(104)}>{money(dt.e)}</div>
                  <div style={subCol(104)}>{money(dt.s)}</div>
                  <div style={{ width: 150, flex: "none", borderLeft: "1px solid #cfccc2", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: "#1c2b3a" }}>{money(dt.subtotal)}</div>
                  <div style={{ width: 44, flex: "none" }} />
                </div>
              </div>
            );
          })}

          {/* grand direct-cost row */}
          <div style={{ display: "flex", alignItems: "stretch", background: "#1c2b3a", color: "#f4f3f0", borderTop: `3px solid ${ACCENT}` }}>
            <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Direct Cost</div>
            <div style={{ width: 76, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)" }} />
            <div style={{ width: 80, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)" }} />
            {[money(t.mat), money(t.lab), money(t.eq), money(t.sub)].map((v, i) => (
              <div key={i} style={{ width: 104, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px", height: 48, fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 12, color: "#9aa6b2" }}>{v}</div>
            ))}
            <div style={{ width: 150, flex: "none", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 16, color: ACCENT }}>{money(t.direct)}</div>
            <div style={{ width: 44, flex: "none" }} />
          </div>
        </div>

        {/* BID BUILD-UP + TOTAL */}
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 22, alignItems: "stretch" }}>
          {/* ladder */}
          <div style={{ flex: "1 1 520px", minWidth: 360, background: "#fff", border: "1px solid #d6d3cb", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#15212d", color: "#f4f3f0", padding: "14px 22px", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>Bid Build-Up</div>
            <div style={{ padding: "4px 22px 18px" }}>
              {/* direct */}
              <LadderRow title="Direct Cost" sub={`M ${money(t.mat)} · L ${money(t.lab)} · E ${money(t.eq)} · S ${money(t.sub)}`} badge="BASE" value={money(t.direct)} />
              {/* insurance */}
              <LadderRow title="Insurance & Bonding" sub="General liability, builder's risk & bonds" value={money(t.ins)}
                pct={{ v: estimate.markups.ins, on: (n) => setMarkup("ins", n) }} pctBox={pctBox} pctInput={pctInput} />
              {/* overhead */}
              <LadderRow title="Overhead & G&A" sub="Allocated indirect & office cost" value={money(t.oh)}
                pct={{ v: estimate.markups.oh, on: (n) => setMarkup("oh", n) }} pctBox={pctBox} pctInput={pctInput} />
              {/* cost basis */}
              <div style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "2px solid #1c2b3a", background: "#faf9f6" }}>
                <div style={{ flex: 1, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5a6470", paddingLeft: 2 }}>Cost Basis</div>
                <div style={{ width: 140, textAlign: "right", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 16, color: "#1c2b3a", paddingRight: 2 }}>{money(t.basis)}</div>
              </div>
              {/* contingency */}
              <LadderRow title="Contingency" sub="Allowance for overruns & waste" value={money(t.cont)}
                pct={{ v: estimate.markups.cont, on: (n) => setMarkup("cont", n) }} pctBox={pctBox} pctInput={pctInput} />
              {/* profit */}
              <LadderRow title="Profit / Fee" sub="Contractor margin on cost basis" value={money(t.profit)} last
                pct={{ v: estimate.markups.profit, on: (n) => setMarkup("profit", n) }} pctBox={pctBox} pctInput={pctInput} />
            </div>
          </div>

          {/* total card */}
          <div style={{ flex: "1 1 320px", minWidth: 300, background: "#1c2b3a", color: "#f4f3f0", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 8, background: "repeating-linear-gradient(45deg,#1c2b3a 0 10px,#f5a623 10px 20px)" }} />
            <div style={{ padding: "26px 26px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 12, letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase" }}>Total Bid Price</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 42, color: ACCENT, lineHeight: 1, marginTop: 8 }}>{money(t.total)}</div>
              <div style={{ display: "flex", marginTop: 26, borderTop: "1px solid #314252", borderBottom: "1px solid #314252" }}>
                {[["Cost / SF", `$${t.costPerSF.toFixed(2)}`], ["Margin", `${t.margin.toFixed(1)}%`], ["Items", String(t.lineCount)]].map(([l, v], i) => (
                  <div key={l} style={{ flex: 1, padding: i === 0 ? "14px 0" : "14px 0 14px 16px", borderRight: i < 2 ? "1px solid #314252" : "none" }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#7f8c99", lineHeight: 1.6, marginTop: 18 }}>Direct cost {money(t.direct)} plus insurance, overhead, contingency &amp; fee. Adjust percentages at left to re-price live.</div>
              <div style={{ flex: 1 }} />
              <button onClick={() => window.print()} style={{ width: "100%", marginTop: 22, background: ACCENT, border: "none", color: "#1c2b3a", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", padding: 14, cursor: "pointer", borderRadius: 2 }}>Print / Export Bid →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LadderRow({
  title, sub, value, badge, last, pct, pctBox, pctInput,
}: {
  title: string; sub: string; value: string; badge?: string; last?: boolean;
  pct?: { v: number; on: (n: number) => void };
  pctBox?: React.CSSProperties; pctInput?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: last ? "14px 0 4px" : "14px 0", borderBottom: last ? "none" : "1px solid #ecebe5" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, letterSpacing: "0.03em", textTransform: "uppercase", color: "#1c2b3a" }}>{title}</div>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, color: "#8a8578", marginTop: 3 }}>{sub}</div>
      </div>
      {badge && <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "#8a8578", background: "#f0eee8", padding: "4px 9px", marginRight: 22, borderRadius: 2 }}>{badge}</div>}
      {pct && (
        <div style={pctBox}>
          <input value={pct.v} onFocus={(e) => e.target.select()} onChange={(e) => pct.on(parseFloat(e.target.value) || 0)} inputMode="decimal" style={pctInput} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#8a8578" }}>%</span>
        </div>
      )}
      <div style={{ width: 140, textAlign: "right", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 16, color: "#1c2b3a" }}>{value}</div>
    </div>
  );
}
