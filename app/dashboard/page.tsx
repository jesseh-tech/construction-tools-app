"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProject } from "../ProjectProvider";
import { APPS, type AppEntry, type AppPhase, compute, money0 } from "@/lib/store";

const ACCENT = "#f5a623";

type DocFile = { id: string; name: string; size: number; addedAt: number; url: string };
const fileExt = (name: string) => (/\.([a-z0-9]+)$/i.exec(name)?.[1].toUpperCase() ?? "FILE");
const fileSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} KB` : `${(b / 1048576).toFixed(b < 10485760 ? 1 : 0)} MB`);

export default function DashboardPage() {
  const { job, reset } = useProject();
  const c = compute(job);
  const [files, setFiles] = useState<DocFile[]>([]);
  const [dragging, setDragging] = useState(false);

  const activeCount = APPS.filter((a) => a.active).length;

  const statFor = (app: AppEntry): { stat: string; label: string } => {
    if (app.id === "estimate") return { stat: money0(c.total), label: "TOTAL BID" };
    if (app.id === "sov") return { stat: money0(c.adjustedContract), label: "SCHEDULED VALUE" };
    if (app.id === "proposal") return { stat: money0(c.total), label: "PROPOSAL PRICE" };
    if (app.id === "changeorders") {
      const n = job.changeOrders.length;
      return { stat: n ? `${n} ${n === 1 ? "CO" : "COs"}` : "NONE", label: "LOGGED" };
    }
    return { stat: app.active ? "READY" : "SOON", label: "STATUS" };
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ id: `${Date.now()}-${f.name}`, name: f.name, size: f.size, addedAt: Date.now(), url: URL.createObjectURL(f) }));
    setFiles((prev) => [...next, ...prev]);
  };

  const Tile = ({ app }: { app: AppEntry }) => {
    const { stat, label } = statFor(app);
    const inner = (
      <div className="tile" style={{ display: "block", background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${app.active ? ACCENT : "#c4c0b6"}`, padding: "16px 17px 15px", cursor: app.active ? "pointer" : "default", opacity: app.active ? 1 : 0.66, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
          <div style={{ flex: "none", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, borderRadius: 2, background: app.active ? "#15212d" : "#e7e5dd", color: app.active ? ACCENT : "#a59f92" }}>{app.no}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 19, letterSpacing: "0.02em", textTransform: "uppercase", color: "#15212d", lineHeight: 1 }}>{app.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9.5, letterSpacing: "0.08em", color: ACCENT, marginTop: 5 }}>{app.feeds}</div>
          </div>
          <div style={{ flex: "none", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", padding: "4px 7px", borderRadius: 2, ...(app.active ? { background: "#e8f3ec", color: "#1f7a44" } : { background: "#efeee9", color: "#a59f92", border: "1px solid #d6d3cb" }) }}>{app.active ? "ACTIVE" : "SOON"}</div>
        </div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#5a6470", lineHeight: 1.45, marginTop: 12, minHeight: 38 }}>{app.desc}</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid #e7e5dd" }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", color: "#9a9488", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 18, color: "#15212d", marginTop: 2 }}>{stat}</div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", color: app.active ? "#15212d" : "#a59f92", textTransform: "uppercase" }}>{app.active ? "Open →" : "Planned"}</div>
        </div>
      </div>
    );
    return app.active ? <Link href={app.route} style={{ textDecoration: "none" }}>{inner}</Link> : <div>{inner}</div>;
  };

  const Section = ({ title, sub, phase }: { title: string; sub: string; phase: AppPhase }) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 14px" }}>
        <h2 style={{ margin: 0, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1c2b3a" }}>{title}</h2>
        <div style={{ flex: 1, height: 2, background: "#cfccc2" }} />
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", letterSpacing: "0.05em" }}>{sub}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 16 }}>
        {APPS.filter((a) => a.tag === phase).map((a) => (<Tile key={a.id} app={a} />))}
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      {/* top app bar */}
      <div style={{ display: "flex", alignItems: "stretch", height: 74, background: "#15212d", color: "#f4f3f0", borderBottom: `3px solid ${ACCENT}` }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 13, padding: "0 22px", borderRight: "1px solid rgba(255,255,255,0.08)", flex: "none", textDecoration: "none", color: "inherit" }}>
          <Image src="/brand/10cent-lockup-white.png" alt="10 Cent Investments" width={46} height={46} style={{ objectFit: "contain" }} />
          <div style={{ lineHeight: 0.94 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 22, letterSpacing: "0.04em" }}>10 CENT</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.26em", color: ACCENT }}>INVESTMENTS</div>
          </div>
        </Link>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", minWidth: 0 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 21, letterSpacing: "0.04em" }}>CONSTRUCTION TOOLS</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#7f8c99", letterSpacing: "0.04em", marginTop: 2 }}>GENERAL CONTRACTING · PRECONSTRUCTION → FIELD</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", background: "#1c2b3a", padding: "0 26px", textAlign: "right" }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.22em", color: "#7f8c99" }}>ACTIVE TOOLS</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 30, color: ACCENT, lineHeight: 1, marginTop: 2 }}>{activeCount}</div>
          </div>
        </div>
      </div>

      {/* job banner */}
      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "20px 22px", display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.18em", color: ACCENT, textTransform: "uppercase" }}>Active Job</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 24, letterSpacing: "0.01em", marginTop: 3, lineHeight: 1.05 }}>{job.meta.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#9aa6b2", marginTop: 6, letterSpacing: "0.02em" }}>{job.meta.client} · {job.meta.location} · BID {job.meta.bidNo}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", border: "1px solid #314252" }}>
          {[["Contract Value", money0(c.adjustedContract), ACCENT], ["Direct Cost", money0(c.direct), "#f4f3f0"], ["Margin", `${c.margin.toFixed(1)}%`, "#f4f3f0"], ["Line Items", String(c.lineCount), "#f4f3f0"]].map(([l, v, col], i) => (
            <div key={l} style={{ padding: "12px 22px", borderRight: i < 3 ? "1px solid #314252" : "none" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 22, marginTop: 3, color: col as string }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tool sections */}
      <div style={{ padding: "14px 22px 56px" }}>
        <Section title="Preconstruction" sub="ESTIMATE · SOV · PROPOSAL · LEVELING · TAKEOFF" phase="PRECONSTRUCTION" />
        <Section title="Project Controls" sub="CHANGE ORDERS · PAY APPS · SUBMITTALS" phase="PROJECT CONTROLS" />
        <Section title="Field" sub="DAILY REPORTS" phase="FIELD" />

        {/* project documents */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "34px 0 14px" }}>
          <h2 style={{ margin: 0, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1c2b3a" }}>Project Documents</h2>
          <div style={{ flex: 1, height: 2, background: "#cfccc2" }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", letterSpacing: "0.05em" }}>BLUEPRINTS · PLANS · SPECS · PERMITS</span>
        </div>
        <div style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${ACCENT}` }}>
          <label
            onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            style={{ display: "flex", alignItems: "center", gap: 16, margin: 14, padding: 20, border: `2px dashed ${dragging ? ACCENT : "#c9c5b8"}`, borderRadius: 3, cursor: "pointer", background: dragging ? "#fbf3e3" : "#faf9f5" }}
          >
            <input type="file" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
            <div style={{ flex: "none", width: 46, height: 46, border: "1.5px solid #c4c0b6", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "#a59f92", fontSize: 22, background: "#faf9f5" }}>⬚</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "#15212d" }}>Drop blueprints, plans &amp; project files here</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", marginTop: 4, letterSpacing: "0.02em" }}>or click to browse — PDF · DWG · images · specs · permits.</div>
            </div>
          </label>

          {files.length === 0 ? (
            <div style={{ borderTop: "1px solid #e7e5dd", padding: 16, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#a59f92", letterSpacing: "0.02em" }}>No documents yet — everything you drop here stays attached to this project.</div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", height: 38, background: "#15212d", color: "#7f8c99", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase" }}>
                <div style={{ width: 64, flex: "none", textAlign: "center" }}>Type</div>
                <div style={{ flex: 1, minWidth: 0 }}>File Name</div>
                <div style={{ width: 90, flex: "none", textAlign: "right" }}>Size</div>
                <div style={{ width: 148, flex: "none" }} />
              </div>
              {files.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", minHeight: 50, borderTop: "1px solid #e7e5dd" }}>
                  <div style={{ width: 64, flex: "none", display: "flex", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 10, letterSpacing: "0.04em", color: "#15212d", background: "#efeee9", border: "1px solid #d6d3cb", borderRadius: 2, padding: "3px 6px" }}>{fileExt(f.name)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14, color: "#15212d", paddingRight: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ width: 90, flex: "none", textAlign: "right", fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470" }}>{fileSize(f.size)}</div>
                  <div style={{ width: 148, flex: "none", display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 16px 0 14px" }}>
                    <button onClick={() => window.open(f.url, "_blank")} style={{ background: "transparent", border: "1.5px solid #1c2b3a", color: "#1c2b3a", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", cursor: "pointer", borderRadius: 2 }}>Open</button>
                    <button onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))} title="Remove file" style={{ width: 28, height: 28, flex: "none", background: "transparent", border: "1px solid #d6d3cb", color: "#a59f92", cursor: "pointer", borderRadius: 2, fontSize: 13, lineHeight: 1 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ marginTop: 40, padding: "16px 18px", background: "#15212d", color: "#7f8c99", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flex: "none" }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.02em", lineHeight: 1.5 }}>One shared job record links every tool — edit the estimate and the SOV, proposal, change orders &amp; pay app re-price live.</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => { if (window.confirm("Reset all tools to the demo job? This clears your current data.")) reset(); }} style={{ background: "transparent", border: "1px solid #3a4a5b", color: "#9aa6b2", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 13px", cursor: "pointer", borderRadius: 2 }}>Reset Demo Data</button>
        </div>
      </div>
    </div>
  );
}
