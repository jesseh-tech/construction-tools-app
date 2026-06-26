"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProject } from "../ProjectProvider";
import { APPS, type AppEntry, type AppPhase, compute, money0 } from "@/lib/store";
import { type FileRec, filesAll, filesAdd, filesDelete, filesGet, fileExt, fileSize } from "@/lib/fileVault";

const ACCENT = "#f5a623";

export default function DashboardPage() {
  const { job, reset, projects, currentId, switchProject, newProject, deleteProject } = useProject();
  const c = compute(job);
  const [files, setFiles] = useState<FileRec[]>([]);
  const [dragging, setDragging] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [briefing, setBriefing] = useState(false);

  const briefMe = async () => {
    setBriefing(true);
    setBrief(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Give me a brief executive status of this project in 3-4 sentences: total bid price, margin, billing % to date, change orders, and anything overdue or risky. Do not make any edits — just summarize." }],
          job,
        }),
      });
      const data = await res.json();
      setBrief(res.ok ? data.reply || "No summary available." : data.error || "Couldn't generate a summary.");
    } catch {
      setBrief("Couldn't reach the assistant.");
    } finally {
      setBriefing(false);
    }
  };

  const reloadFiles = useCallback(() => { filesAll(currentId).then(setFiles); }, [currentId]);
  useEffect(() => { reloadFiles(); }, [reloadFiles]);

  const activeCount = APPS.filter((a) => a.active).length;

  const statFor = (app: AppEntry): { stat: string; label: string } => {
    if (app.id === "estimate") return { stat: money0(c.total), label: "TOTAL BID" };
    if (app.id === "sov") return { stat: money0(c.adjustedContract), label: "SCHEDULED VALUE" };
    if (app.id === "proposal") return { stat: money0(c.total), label: "PROPOSAL PRICE" };
    if (app.id === "changeorders") {
      const n = job.changeOrders.length;
      return { stat: n ? `${n} ${n === 1 ? "CO" : "COs"}` : "NONE", label: "LOGGED" };
    }
    if (app.id === "punch") return { stat: String(job.punchList.filter((p) => p.status !== "Closed").length), label: "OPEN ITEMS" };
    if (app.id === "directory") return { stat: String(job.directory.length), label: "CONTACTS" };
    if (app.id === "commitments") return { stat: money0(job.commitments.reduce((a, x) => a + x.amount, 0)), label: "COMMITTED" };
    if (app.id === "inspections") return { stat: String(job.inspections.length), label: "INSPECTIONS" };
    return { stat: app.active ? "READY" : "SOON", label: "STATUS" };
  };

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    filesAdd(list, currentId).then(reloadFiles);
  };
  const openFile = (id: string) => filesGet(id).then((r) => { if (r) window.open(URL.createObjectURL(r.blob), "_blank"); });
  const deleteFile = (id: string) => filesDelete(id).then(reloadFiles);

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

      {/* project switcher */}
      <div style={{ background: "#0e1a24", color: "#9aa6b2", padding: "10px 22px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7f8c99" }}>Project</span>
        <select
          value={currentId}
          onChange={(e) => switchProject(e.target.value)}
          style={{ background: "#15212d", color: "#f4f3f0", border: "1px solid #314252", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 13, padding: "6px 10px", borderRadius: 2, outline: "none", cursor: "pointer", maxWidth: 360 }}
        >
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#5e6b78" }}>{projects.length} job{projects.length === 1 ? "" : "s"}</span>
        <div style={{ flex: 1 }} />
        <button onClick={briefMe} disabled={briefing} style={{ background: "transparent", border: `1px solid ${ACCENT}`, color: ACCENT, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer", borderRadius: 2, opacity: briefing ? 0.6 : 1 }}>{briefing ? "Briefing…" : "✨ Brief Me"}</button>
        <button onClick={() => { const n = window.prompt("Name this project:", "New Project"); if (n !== null) newProject(n); }} style={{ background: ACCENT, border: "none", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer", borderRadius: 2 }}>+ New Project</button>
        <button
          onClick={() => { if (window.confirm(`Delete project "${job.meta.name}"? This can't be undone.`)) deleteProject(currentId); }}
          style={{ background: "transparent", border: "1px solid #3a4a5b", color: "#9aa6b2", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer", borderRadius: 2 }}
        >
          Delete
        </button>
      </div>

      {/* AI brief */}
      {(brief || briefing) && (
        <div style={{ background: "#15212d", color: "#f4f3f0", borderBottom: `3px solid ${ACCENT}`, padding: "16px 22px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: ACCENT, textTransform: "uppercase", flex: "none", paddingTop: 2 }}>✨ Brief</span>
          <p style={{ flex: 1, margin: 0, fontFamily: "'Barlow'", fontSize: 14, lineHeight: 1.55, color: "#dfe4e9" }}>{briefing ? "Generating a status summary…" : brief}</p>
          {!briefing && <button onClick={() => setBrief(null)} style={{ flex: "none", background: "transparent", border: "1px solid #3a4a5b", color: "#9aa6b2", cursor: "pointer", borderRadius: 2, width: 24, height: 24, fontSize: 12 }}>✕</button>}
        </div>
      )}

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
        {/* cost by division */}
        {(() => {
          const divs = c.divisions.filter((d) => d.subtotal > 0).sort((a, b) => b.subtotal - a.subtotal);
          const max = divs[0]?.subtotal || 1;
          if (divs.length === 0) return null;
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 14px" }}>
                <h2 style={{ margin: 0, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1c2b3a" }}>Cost by Division</h2>
                <div style={{ flex: 1, height: 2, background: "#cfccc2" }} />
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", letterSpacing: "0.05em" }}>DIRECT COST · {divs.length} DIVISIONS</span>
              </div>
              <div style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${ACCENT}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 9 }}>
                {divs.map((d, i) => (
                  <div key={d.ref.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 34, flex: "none", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 12, color: "#15212d", textAlign: "center", background: "#efeee9", borderRadius: 2, padding: "2px 0" }}>{d.code}</span>
                    <span style={{ width: 150, flex: "none", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 13, color: "#1c2b3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                    <div style={{ flex: 1, height: 18, background: "#f0eee8", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(2, (d.subtotal / max) * 100)}%`, height: "100%", background: i === 0 ? ACCENT : "#3a4a5b", transition: "width .3s ease" }} />
                    </div>
                    <span style={{ width: 96, flex: "none", textAlign: "right", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: "#15212d" }}>{money0(d.subtotal)}</span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        <Section title="Preconstruction" sub="ESTIMATE · SOV · PROPOSAL · LEVELING · TAKEOFF" phase="PRECONSTRUCTION" />
        <Section title="Project Controls" sub="CHANGE ORDERS · PAY APPS · SUBMITTALS" phase="PROJECT CONTROLS" />
        <Section title="Field" sub="DAILY REPORTS" phase="FIELD" />
        <Section title="Quality & Closeout" sub="PUNCH LIST · INSPECTIONS & SAFETY" phase="QUALITY & CLOSEOUT" />

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
                    <button onClick={() => openFile(f.id)} style={{ background: "transparent", border: "1.5px solid #1c2b3a", color: "#1c2b3a", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", cursor: "pointer", borderRadius: 2 }}>Open</button>
                    <button onClick={() => deleteFile(f.id)} title="Remove file" style={{ width: 28, height: 28, flex: "none", background: "transparent", border: "1px solid #d6d3cb", color: "#a59f92", cursor: "pointer", borderRadius: 2, fontSize: 13, lineHeight: 1 }}>✕</button>
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
