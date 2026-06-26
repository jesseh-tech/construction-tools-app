"use client";

import { useState } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar, ToolBarButton } from "../ToolBar";
import { AddRow } from "../AddControls";
import { type Contact, newId } from "@/lib/store";

const ACCENT = "#f5a623";
const TYPES = ["Owner", "Architect", "Engineer", "General Contractor", "Subcontractor", "Vendor"] as const;

export default function DirectoryPage() {
  const { job, setJob } = useProject();
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const list = job.directory;
  const shown = typeFilter === "All" ? list : list.filter((c) => c.type === typeFilter);

  const setList = (next: Contact[]) => setJob({ ...job, directory: next });
  const setItem = (id: string, patch: Partial<Contact>) => setList(list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeItem = (id: string) => setList(list.filter((c) => c.id !== id));
  const addItem = () => setList([...list, { id: newId(), company: "", name: "", role: "", email: "", phone: "", type: "Subcontractor" }]);

  const th: React.CSSProperties = { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.06)" };
  const cell: React.CSSProperties = { width: "100%", border: "none", background: "transparent", fontFamily: "'Barlow'", fontWeight: 500, fontSize: 13, color: "#1c2b3a", height: 48, outline: "none", padding: "0 12px" };

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="PROJECT DIRECTORY" subtitle={`${job.meta.name} · CONTACTS`}>
        <ToolBarButton label="+ NEW CONTACT" onClick={addItem} />
      </ToolBar>

      <div style={{ background: "#1c2b3a", color: "#f4f3f0", padding: "16px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", borderBottom: "1px solid #0e1820" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", color: "#7f8c99", textTransform: "uppercase" }}>Filter</span>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ background: "#15212d", color: "#f4f3f0", border: "1px solid #314252", fontFamily: "'Barlow'", fontWeight: 600, fontSize: 13, padding: "6px 10px", borderRadius: 2, outline: "none", cursor: "pointer" }}>
          {["All", ...TYPES].map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a96a3" }}>{shown.length} of {list.length} contact{list.length === 1 ? "" : "s"}</span>
      </div>

      <div style={{ padding: 22 }}>
        <div className="xscroll">
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", minWidth: 1000 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "#15212d", color: "#9aa6b2", textTransform: "uppercase", height: 48 }}>
              <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", paddingLeft: 16, ...th, borderLeft: "none" }}>Company</div>
              <div style={{ width: 160, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Contact</div>
              <div style={{ width: 160, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Role / Trade</div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...th }}>Type</div>
              <div style={{ width: 210, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Email</div>
              <div style={{ width: 140, flex: "none", display: "flex", alignItems: "center", paddingLeft: 12, ...th }}>Phone</div>
              <div style={{ width: 44, flex: "none" }} />
            </div>

            {shown.length === 0 ? (
              <div style={{ padding: "46px 20px", textAlign: "center", borderTop: "1px solid #efeee9" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", color: "#9a9488", textTransform: "uppercase" }}>No contacts{typeFilter !== "All" ? ` (${typeFilter})` : ""}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#b0aa9c", marginTop: 6 }}>Click &ldquo;+ New Contact&rdquo; to add the owner, architect, subs and vendors.</div>
              </div>
            ) : shown.map((c) => (
              <div key={c.id} className="est-row" style={{ display: "flex", alignItems: "stretch", background: "#fff", borderTop: "1px solid #efeee9" }}>
                <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", paddingLeft: 4 }}>
                  <input value={c.company} onChange={(e) => setItem(c.id, { company: e.target.value })} placeholder="Company" style={{ ...cell, fontWeight: 600, fontSize: 14, color: "#15212d" }} />
                </div>
                <div style={{ width: 160, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={c.name} onChange={(e) => setItem(c.id, { name: e.target.value })} placeholder="Name" style={cell} />
                </div>
                <div style={{ width: 160, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={c.role} onChange={(e) => setItem(c.id, { role: e.target.value })} placeholder="Role / trade" style={cell} />
                </div>
                <div style={{ width: 150, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                  <select value={c.type} onChange={(e) => setItem(c.id, { type: e.target.value as Contact["type"] })} style={{ width: "100%", border: "1px solid #d6d3cb", background: "#f4f3f0", color: "#1c2b3a", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "center", textAlignLast: "center", height: 30, outline: "none", cursor: "pointer", borderRadius: 2 }}>
                    {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div style={{ width: 210, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={c.email} onChange={(e) => setItem(c.id, { email: e.target.value })} placeholder="email@…" style={{ ...cell, fontFamily: "'JetBrains Mono'", fontSize: 12 }} />
                </div>
                <div style={{ width: 140, flex: "none", borderLeft: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                  <input value={c.phone} onChange={(e) => setItem(c.id, { phone: e.target.value })} placeholder="000-000-0000" style={{ ...cell, fontFamily: "'JetBrains Mono'", fontSize: 12 }} />
                </div>
                <div style={{ width: 44, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => removeItem(c.id)} style={{ width: 24, height: 24, border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 11, borderRadius: 2 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <AddRow label="+ Add a contact" onClick={addItem} />
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", lineHeight: 1.6 }}>Your project contacts — owner, architect, engineers, subcontractors and vendors. Ask the assistant to add one: &ldquo;add a contact — Summit Interiors, drywall sub.&rdquo;</div>
      </div>
    </div>
  );
}
