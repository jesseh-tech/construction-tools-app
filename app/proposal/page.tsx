"use client";

import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarLink, ToolBarButton } from "../ToolBar";
import { type Proposal, compute, sov, money0, proposalDefaults } from "@/lib/store";

const ACCENT = "#f5a623";

export default function ProposalPage() {
  const { job, setJob } = useProject();
  const c = compute(job);
  const s = sov(job, c);
  const prop = job.proposal ?? proposalDefaults();
  const sf = job.meta.sf || 1;

  const setField = (key: keyof Proposal, value: string) =>
    setJob({ ...job, proposal: { ...(job.proposal ?? proposalDefaults()), [key]: value } });

  const area: React.CSSProperties = { width: "100%", border: "none", resize: "vertical", fontFamily: "'Barlow'", fontSize: 13, lineHeight: 1.7, color: "#33404c", marginTop: 8, outline: "none", background: "transparent" };
  const cap = (color = "#9a9488"): React.CSSProperties => ({ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", color, textTransform: "uppercase" });

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif", paddingBottom: 40 }}>
      <ToolBar title="BID PROPOSAL" subtitle={`${job.meta.name} · ${job.meta.bidNo}`}>
        <ToolBarLink href="/estimate" label="← ESTIMATE" />
        <ToolBarButton label="PRINT / PDF →" onClick={() => window.print()} />
      </ToolBar>

      <div className="sheet" style={{ width: 850, maxWidth: "calc(100% - 44px)", margin: "28px auto 0", background: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }}>
        {/* letterhead */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#15212d", color: "#f4f3f0", padding: "26px 40px", borderBottom: `4px solid ${ACCENT}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/10cent-lockup-white.png" alt="" style={{ width: 58, height: 58, objectFit: "contain", flex: "none" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 28, letterSpacing: "0.04em", lineHeight: 0.96 }}>10 CENT INVESTMENTS</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#9aa6b2", letterSpacing: "0.06em", marginTop: 5 }}>GENERAL CONTRACTING · GOLDEN, COLORADO</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", color: ACCENT }}>PROPOSAL</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#dfe4e9", marginTop: 4 }}>{job.meta.bidNo}</div>
          </div>
        </div>

        <div style={{ padding: "34px 40px 40px" }}>
          {/* meta row */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", borderBottom: "1px solid #e7e5dd", paddingBottom: 20 }}>
            <div style={{ minWidth: 240 }}>
              <div style={cap()}>Prepared For</div>
              <div style={{ fontFamily: "'Barlow'", fontWeight: 700, fontSize: 17, color: "#15212d", marginTop: 5 }}>{job.meta.client}</div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: "#5a6470", marginTop: 3 }}>RE: {job.meta.name}</div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: "#5a6470" }}>{job.meta.location}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={cap()}>Date</div>
              <input value={prop.date} onChange={(e) => setField("date", e.target.value)} placeholder="—" className="est-underline" style={{ textAlign: "right", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 15, color: "#15212d", outline: "none", marginTop: 4, width: 180 }} />
              <div style={{ ...cap(), marginTop: 12 }}>Bid Due</div>
              <div style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 15, color: "#15212d", marginTop: 4 }}>{job.meta.dueLabel}</div>
            </div>
          </div>

          <textarea value={prop.intro} onChange={(e) => setField("intro", e.target.value)} rows={3} style={{ ...area, fontSize: 14.5, marginTop: 20 }} />

          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: "#15212d", marginTop: 22, paddingBottom: 8, borderBottom: "2px solid #15212d" }}>Scope of Work &amp; Pricing</div>
          {s.rows.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 2px", borderBottom: "1px solid #efeee9" }}>
              <div style={{ width: 42, flex: "none", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, color: ACCENT }}>{r.code}</div>
              <div style={{ flex: 1, fontFamily: "'Barlow'", fontWeight: 500, fontSize: 14.5, color: "#1c2b3a" }}>{r.name}</div>
              <div style={{ flex: "none", fontFamily: "'JetBrains Mono'", fontWeight: 600, fontSize: 14, color: "#15212d" }}>{money0(r.sched)}</div>
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#15212d", color: "#f4f3f0", padding: "16px 18px", marginTop: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 17, letterSpacing: "0.08em", textTransform: "uppercase" }}>Total Lump-Sum Bid Price</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 26, color: ACCENT }}>{money0(c.total)}</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", marginTop: 7, textAlign: "right" }}>${(c.total / sf).toFixed(2)} / SF over {job.meta.sf.toLocaleString("en-US")} SF · {c.lineCount} line items across {c.divCount} CSI divisions</div>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 26 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ ...cap("#1f7a44"), paddingBottom: 6, borderBottom: "1px solid #e7e5dd", fontSize: 13, letterSpacing: "0.1em" }}>Inclusions</div>
              <textarea value={prop.inclusions} onChange={(e) => setField("inclusions", e.target.value)} rows={6} style={area} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ ...cap("#b3402f"), paddingBottom: 6, borderBottom: "1px solid #e7e5dd", fontSize: 13, letterSpacing: "0.1em" }}>Exclusions &amp; Clarifications</div>
              <textarea value={prop.exclusions} onChange={(e) => setField("exclusions", e.target.value)} rows={6} style={area} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 24, padding: "16px 18px", background: "#f6f5f1", borderLeft: `3px solid ${ACCENT}` }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={cap()}>Proposal Valid</div>
              <div style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#15212d", marginTop: 3 }}>
                <input value={prop.validDays} onChange={(e) => setField("validDays", e.target.value)} className="est-underline" style={{ width: 42, border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 700, fontSize: 14, color: "#15212d", outline: "none" }} /> days from date above
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={cap()}>Payment Terms</div>
              <div style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#15212d", marginTop: 3 }}>Monthly progress billing, net 30</div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={cap()}>Retainage</div>
              <div style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 14, color: "#15212d", marginTop: 3 }}>{job.billing.retainage}% per draw</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginTop: 38 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ height: 1, background: "#15212d" }} />
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", color: "#15212d", marginTop: 7, textTransform: "uppercase" }}>10 Cent Investments</div>
              <input value={prop.preparedBy} onChange={(e) => setField("preparedBy", e.target.value)} className="est-underline" style={{ border: "none", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#5a6470", outline: "none", marginTop: 3, width: "100%" }} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ height: 1, background: "#15212d" }} />
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", color: "#15212d", marginTop: 7, textTransform: "uppercase" }}>Accepted — {job.meta.client}</div>
              <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: "#9a9488", marginTop: 3 }}>Signature / Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
