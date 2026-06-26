"use client";

import { useState } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarLink } from "../ToolBar";
import { newId } from "@/lib/store";

const ACCENT = "#f5a623";
const N = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const fmt = (x: number) => (Math.round(x * 100) / 100).toLocaleString("en-US");

type Field = { key: string; label: string; unit: string };
type Calc = { tag: string; div: string; divName: string; name: string; formula: string; fields: Field[]; result: (f: Record<string, string>) => number; resultLabel: string; resultUnit: string; desc: string; unit: string };

const CALCS: Calc[] = [
  { tag: "09", div: "09", divName: "Finishes", name: "Wall Framing / GWB", formula: "LENGTH × HEIGHT", fields: [{ key: "wallLen", label: "Wall run length", unit: "LF" }, { key: "wallHt", label: "Wall height", unit: "FT" }], result: (f) => N(f.wallLen) * N(f.wallHt), resultLabel: "Wall Area", resultUnit: "SF", desc: "Wall framing & GWB — takeoff", unit: "SF" },
  { tag: "03", div: "03", divName: "Concrete", name: "Concrete Slab", formula: "L × W × (T÷12) ÷ 27", fields: [{ key: "slabLen", label: "Slab length", unit: "FT" }, { key: "slabWid", label: "Slab width", unit: "FT" }, { key: "slabThk", label: "Thickness", unit: "IN" }], result: (f) => (N(f.slabLen) * N(f.slabWid) * (N(f.slabThk) / 12)) / 27, resultLabel: "Concrete Volume", resultUnit: "CY", desc: "Concrete slab — takeoff", unit: "CY" },
  { tag: "09", div: "09", divName: "Finishes", name: "Paint", formula: "AREA × COATS ÷ COVERAGE", fields: [{ key: "paintArea", label: "Surface area", unit: "SF" }, { key: "paintCoats", label: "Coats", unit: "#" }, { key: "paintCov", label: "Coverage / gal", unit: "SF" }], result: (f) => (N(f.paintCov) > 0 ? (N(f.paintArea) * N(f.paintCoats)) / N(f.paintCov) : 0), resultLabel: "Paint Required", resultUnit: "GAL", desc: "Paint — takeoff", unit: "GAL" },
  { tag: "09", div: "09", divName: "Finishes", name: "Floor Tile", formula: "AREA ÷ 4 SF (24″ tile)", fields: [{ key: "floorLen", label: "Room length", unit: "FT" }, { key: "floorWid", label: "Room width", unit: "FT" }], result: (f) => (N(f.floorLen) * N(f.floorWid)) / 4, resultLabel: "Tiles (24″×24″)", resultUnit: "EA", desc: "Floor tile — takeoff", unit: "EA" },
  { tag: "23", div: "23", divName: "HVAC", name: "Ductwork", formula: "MEASURED RUN", fields: [{ key: "ductLen", label: "Total duct run", unit: "LF" }], result: (f) => N(f.ductLen), resultLabel: "Ductwork", resultUnit: "LF", desc: "Ductwork — takeoff", unit: "LF" },
  { tag: "09", div: "09", divName: "Finishes", name: "Acoustical Ceiling", formula: "AREA ÷ 4 SF (2×2 tile)", fields: [{ key: "ceilArea", label: "Ceiling area", unit: "SF" }], result: (f) => N(f.ceilArea) / 4, resultLabel: "Ceiling Tiles (2×2)", resultUnit: "EA", desc: "Acoustical ceiling — takeoff", unit: "EA" },
];

export default function TakeoffPage() {
  const { job, setJob } = useProject();
  const [fields, setFields] = useState<Record<string, string>>({ wallLen: "120", wallHt: "9", slabLen: "40", slabWid: "30", slabThk: "6", paintArea: "4200", paintCoats: "2", paintCov: "350", floorLen: "85", floorWid: "80", ductLen: "240", ceilArea: "8500" });
  const [pushed, setPushed] = useState<string | null>(null);

  const setField = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const pushLine = (divCode: string, divName: string, desc: string, qty: number, unit: string) => {
    const rounded = Math.round(qty * 100) / 100;
    const line = { id: newId(), desc, qty: rounded, unit, m: 0, l: 0, e: 0, s: 0 };
    const divs = job.divisions.map((d) => ({ ...d, items: [...d.items] }));
    const idx = divs.findIndex((d) => d.code === divCode);
    if (idx >= 0) divs[idx].items.push(line);
    else {
      divs.push({ id: newId(), code: divCode, name: divName, collapsed: false, items: [line] });
      divs.sort((a, b) => (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));
    }
    setJob({ ...job, divisions: divs });
    setPushed(desc);
    setTimeout(() => setPushed((p) => (p === desc ? null : p)), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="QUANTITY TAKEOFF" subtitle={`${job.meta.name} · ${job.meta.bidNo}`}>
        <ToolBarLink href="/estimate" label="ESTIMATE →" />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#9aa6b2", padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flex: "none" }} />
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.02em", lineHeight: 1.5 }}>Calculate material quantities from field dimensions, then push the result straight into an estimate line item. Building area: <b style={{ color: "#f4f3f0" }}>{job.meta.sf.toLocaleString("en-US")} SF</b>.</span>
      </div>

      <div style={{ padding: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 18 }}>
        {CALCS.map((cc) => {
          const res = cc.result(fields);
          return (
            <div key={cc.name} style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${ACCENT}`, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #efeee9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: "none", width: 34, height: 34, background: "#15212d", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, borderRadius: 2 }}>{cc.tag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 17, letterSpacing: "0.02em", textTransform: "uppercase", color: "#15212d", lineHeight: 1 }}>{cc.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9.5, color: "#9a9488", letterSpacing: "0.04em", marginTop: 3 }}>{cc.formula}</div>
                </div>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {cc.fields.map((inp) => (
                  <div key={inp.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ flex: 1, fontFamily: "'Barlow'", fontWeight: 500, fontSize: 13, color: "#5a6470" }}>{inp.label}</label>
                    <input value={fields[inp.key]} onFocus={(e) => e.target.select()} onChange={(e) => setField(inp.key, e.target.value)} inputMode="decimal" style={{ width: 96, border: "1px solid #cfccc2", background: "#faf9f6", fontFamily: "'JetBrains Mono'", fontWeight: 600, fontSize: 13, color: "#15212d", textAlign: "right", outline: "none", padding: "7px 9px", borderRadius: 2 }} />
                    <span style={{ width: 30, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#9a9488" }}>{inp.unit}</span>
                  </div>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ marginTop: 6, paddingTop: 12, borderTop: "1px solid #efeee9" }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", color: "#9a9488", textTransform: "uppercase" }}>{cc.resultLabel}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 22, color: "#15212d", marginTop: 2 }}>{fmt(res)} <span style={{ fontSize: 13, color: "#9a9488" }}>{cc.resultUnit}</span></div>
                </div>
                <button onClick={() => pushLine(cc.div, cc.divName, cc.desc, res, cc.unit)} style={{ background: "#15212d", border: "none", color: ACCENT, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", padding: 10, cursor: "pointer", borderRadius: 2 }}>+ Add to Estimate · Div {cc.div}</button>
                {pushed === cc.desc && <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, color: "#1f7a44", textAlign: "center", letterSpacing: "0.02em" }}>✓ Added to estimate</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
