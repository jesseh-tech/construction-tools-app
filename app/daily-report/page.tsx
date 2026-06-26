"use client";

import { useState } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { type DailyReport, type Crew, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

const blank = (): DailyReport => ({
  id: "",
  date: "2026-06-25",
  weather: "Clear",
  temp: "72",
  delays: "",
  crews: [
    { id: "c1", company: "10 Cent — Carpentry", count: "4", hours: "8" },
    { id: "c2", company: "Front Range Drywall", count: "6", hours: "8" },
  ],
  work: "",
  notes: "",
});

export default function DailyReportPage() {
  const { job, setJob } = useProject();
  const [cur, setCur] = useState<DailyReport>(blank);

  const setField = <K extends keyof DailyReport>(key: K, val: DailyReport[K]) => setCur((c) => ({ ...c, [key]: val }));
  const setCrew = (id: string, patch: Partial<Crew>) => setCur((c) => ({ ...c, crews: c.crews.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const addCrew = () => setCur((c) => ({ ...c, crews: [...c.crews, { id: newId(), company: "", count: "0", hours: "8" }] }));
  const removeCrew = (id: string) => setCur((c) => ({ ...c, crews: c.crews.filter((x) => x.id !== id) }));

  const headcount = cur.crews.reduce((a, c) => a + num(c.count), 0);

  const saveReport = () => {
    const rep: DailyReport = { ...cur, id: cur.id || newId() };
    const exists = job.dailyReports.some((r) => r.id === rep.id);
    const reports = exists ? job.dailyReports.map((r) => (r.id === rep.id ? rep : r)) : [rep, ...job.dailyReports];
    reports.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setJob({ ...job, dailyReports: reports });
    setCur(blank());
  };
  const loadReport = (id: string) => {
    const rep = job.dailyReports.find((r) => r.id === id);
    if (rep) setCur(JSON.parse(JSON.stringify(rep)));
  };
  const removeReport = (id: string) => setJob({ ...job, dailyReports: job.dailyReports.filter((r) => r.id !== id) });

  const cap = (t: string): React.CSSProperties => ({ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", color: "#9a9488", textTransform: "uppercase", marginBottom: 5 });
  const field: React.CSSProperties = { width: "100%", border: "1px solid #cfccc2", background: "#faf9f6", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#15212d", outline: "none", padding: "8px 10px", borderRadius: 2 };
  const sectionH: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#15212d" };
  const area: React.CSSProperties = { width: "100%", border: "1px solid #e7e5dd", resize: "vertical", fontFamily: "'Barlow'", fontSize: 14, lineHeight: 1.6, color: "#33404c", outline: "none", background: "#faf9f6", padding: 12, borderRadius: 2 };

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="DAILY FIELD REPORT" subtitle={`${job.meta.name} · ${job.meta.location}`}>
        <button onClick={() => window.print()} style={{ border: "none", background: "transparent", color: "#9aa6b2", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", padding: "0 18px", cursor: "pointer" }}>PRINT</button>
        <ToolBarButton label="SAVE REPORT" onClick={saveReport} />
      </ToolBar>

      <div style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* main form */}
        <div style={{ flex: 1, minWidth: 340, padding: 22 }}>
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${ACCENT}`, padding: "18px 20px" }}>
            <div style={{ ...sectionH, marginBottom: 14 }}>Site Conditions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
              <div>
                <div style={cap("Date")}>Date</div>
                <input value={cur.date} onChange={(e) => setField("date", e.target.value)} type="date" style={field} />
              </div>
              <div>
                <div style={cap("Weather")}>Weather</div>
                <select value={cur.weather} onChange={(e) => setField("weather", e.target.value)} style={{ ...field, fontFamily: "'Barlow'", fontWeight: 500, cursor: "pointer" }}>
                  {["Clear", "Partly Cloudy", "Overcast", "Rain", "Snow", "Windy", "Hot", "Freezing"].map((o) => (<option key={o}>{o}</option>))}
                </select>
              </div>
              <div>
                <div style={cap("Temp")}>Temp °F</div>
                <input value={cur.temp} onFocus={(e) => e.target.select()} onChange={(e) => setField("temp", e.target.value)} inputMode="numeric" style={{ ...field, textAlign: "right", fontWeight: 600 }} />
              </div>
              <div>
                <div style={cap("Delays")}>Delays / Lost Time</div>
                <input value={cur.delays} onChange={(e) => setField("delays", e.target.value)} placeholder="None" style={{ ...field, fontFamily: "'Barlow'", fontWeight: 500 }} />
              </div>
            </div>
          </div>

          {/* crews */}
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #efeee9" }}>
              <div style={{ flex: 1, ...sectionH }}>Crews on Site</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470", marginRight: 16 }}>{headcount} workers</div>
              <button onClick={addCrew} style={{ background: "transparent", border: "1px solid #15212d", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", padding: "6px 11px", cursor: "pointer", borderRadius: 2 }}>+ Crew</button>
            </div>
            {cur.crews.map((cw) => (
              <div key={cw.id} className="est-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: "1px solid #efeee9" }}>
                <input value={cw.company} onChange={(e) => setCrew(cw.id, { company: e.target.value })} placeholder="Company / trade" style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#1c2b3a", height: 46, outline: "none" }} />
                <input value={cw.count} onFocus={(e) => e.target.select()} onChange={(e) => setCrew(cw.id, { count: e.target.value })} inputMode="numeric" style={{ width: 70, border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: "#15212d", textAlign: "right", height: 46, outline: "none" }} />
                <span style={{ width: 46, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#9a9488" }}>crew</span>
                <input value={cw.hours} onFocus={(e) => e.target.select()} onChange={(e) => setCrew(cw.id, { hours: e.target.value })} inputMode="decimal" style={{ width: 60, border: "none", background: "transparent", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: "#15212d", textAlign: "right", height: 46, outline: "none" }} />
                <span style={{ width: 36, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#9a9488" }}>hrs</span>
                <button onClick={() => removeCrew(cw.id)} style={{ width: 24, height: 24, flex: "none", border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
              </div>
            ))}
          </div>

          {/* work + notes */}
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", marginTop: 18, padding: "18px 20px" }}>
            <div style={{ ...sectionH, marginBottom: 10 }}>Work Performed Today</div>
            <textarea value={cur.work} onChange={(e) => setField("work", e.target.value)} rows={5} placeholder="Describe work completed by area and trade…" style={area} />
            <div style={{ ...sectionH, margin: "18px 0 10px" }}>Notes / Issues / Deliveries</div>
            <textarea value={cur.notes} onChange={(e) => setField("notes", e.target.value)} rows={4} placeholder="Inspections, RFIs, safety incidents, material deliveries, visitors…" style={area} />
          </div>
        </div>

        {/* saved reports rail */}
        <div style={{ width: 300, flex: "none", padding: "22px 22px 22px 0" }}>
          <div style={{ background: "#15212d", color: "#f4f3f0", border: "1px solid #0e1820" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #243646", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Report Log</div>
            {job.dailyReports.length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#7f8c99", lineHeight: 1.6 }}>No saved reports yet. Fill in today&apos;s report and tap Save.</div>
            ) : job.dailyReports.map((r) => {
              const d = (r.date || "").split("-");
              const hc = r.crews.reduce((a, c) => a + num(c.count), 0);
              const hrs = r.crews.reduce((a, c) => a + num(c.count) * num(c.hours), 0);
              return (
                <div key={r.id} onClick={() => loadReport(r.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #243646", cursor: "pointer" }}>
                  <div style={{ flex: "none", width: 40, height: 40, background: "#243646", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14, color: ACCENT, lineHeight: 1 }}>{d[2] || "—"}</span>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#7f8c99", letterSpacing: "0.05em" }}>{MONTHS[parseInt(d[1], 10) - 1] || ""}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 13, color: "#f4f3f0" }}>{r.weather} · {r.temp}°</div>
                    <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#9aa6b2", marginTop: 2 }}>{hc} workers · {hrs} hrs</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeReport(r.id); }} style={{ width: 22, height: 22, flex: "none", border: "none", background: "none", color: "#5e6b78", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
