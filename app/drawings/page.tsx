"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar } from "../ToolBar";
import { type DrawingRec, type DrawingPin, drawingsAll, drawingsAdd, drawingUpdate, drawingDelete } from "@/lib/fileVault";
import { newId } from "@/lib/store";

const ACCENT = "#f5a623";

export default function DrawingsPage() {
  const { job, currentId } = useProject();
  const [draws, setDraws] = useState<DrawingRec[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [selId, setSelId] = useState<string | null>(null);
  const [markup, setMarkup] = useState(false);
  const [dragging, setDragging] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const reload = useCallback(async () => {
    const recs = await drawingsAll(currentId);
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    const map: Record<string, string> = {};
    recs.forEach((r) => { map[r.id] = URL.createObjectURL(r.blob); });
    urlsRef.current = Object.values(map);
    setUrls(map);
    setDraws(recs);
  }, [currentId]);

  useEffect(() => {
    reload();
    return () => { urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, [reload]);

  const addFiles = (list: FileList | null) => { if (list && list.length) drawingsAdd(list, currentId).then(reload); };
  const sel = draws.find((d) => d.id === selId) || null;
  const isImg = (d: DrawingRec) => d.type.startsWith("image/");

  const patch = (id: string, p: Partial<Pick<DrawingRec, "name" | "sheet" | "pins">>) => {
    setDraws((ds) => ds.map((d) => (d.id === id ? { ...d, ...p } : d)));
    drawingUpdate(id, p);
  };
  const setPins = (id: string, pins: DrawingPin[]) => patch(id, { pins });
  const remove = (id: string) => { if (selId === id) setSelId(null); drawingDelete(id).then(reload); };

  const onImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!markup || !sel) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPins(sel.id, [...sel.pins, { id: newId(), x, y, note: "" }]);
  };

  const fileBtn = (label: string, big = false): React.ReactNode => (
    <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: ACCENT, color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: big ? 15 : 13, letterSpacing: "0.08em", padding: big ? "12px 22px" : "0 22px", cursor: "pointer", borderRadius: big ? 3 : 0, height: big ? "auto" : "100%" }}>
      {label}
      <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
    </label>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="DRAWINGS" subtitle={`${job.meta.name} · PLANS & SHEETS`}>
        {fileBtn("+ ADD SHEETS")}
      </ToolBar>

      {!sel ? (
        <div style={{ padding: 22 }}>
          <label
            onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, border: `2px dashed ${dragging ? ACCENT : "#c9c5b8"}`, borderRadius: 3, cursor: "pointer", background: dragging ? "#fbf3e3" : "#fff", marginBottom: 18 }}
          >
            <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
            <div style={{ flex: "none", width: 46, height: 46, border: "1.5px solid #c4c0b6", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "#a59f92", fontSize: 22, background: "#faf9f5" }}>▦</div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "#15212d" }}>Drop plan sheets here, or tap to upload</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", marginTop: 4 }}>PDF or image sheets. Open an image sheet to drop pin markups with notes.</div>
            </div>
          </label>

          {draws.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #d6d3cb", padding: "46px 20px", textAlign: "center", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No drawings yet</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
              {draws.map((d) => (
                <div key={d.id} className="tile" style={{ background: "#fff", border: "1px solid #d6d3cb", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }} onClick={() => { setSelId(d.id); setMarkup(false); }}>
                  <div style={{ height: 150, background: "#15212d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {isImg(d) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={urls[d.id]} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ textAlign: "center", color: "#7f8c99" }}><div style={{ fontSize: 32 }}>📄</div><div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, marginTop: 4 }}>PDF</div></div>
                    )}
                    {d.pins.length > 0 && (
                      <span style={{ position: "absolute", top: 8, right: 8, background: ACCENT, color: "#15212d", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>📍 {d.pins.length}</span>
                    )}
                  </div>
                  <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Barlow'", fontWeight: 600, fontSize: 13, color: "#15212d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#8a8578", marginTop: 2 }}>{d.sheet || "— no sheet #"}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(d.id); }} style={{ border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 12 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 22 }}>
          {/* viewer header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <button onClick={() => setSelId(null)} style={{ background: "transparent", border: "1px solid #15212d", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 13px", cursor: "pointer", borderRadius: 2 }}>← All Sheets</button>
            <input value={sel.name} onChange={(e) => patch(sel.id, { name: e.target.value })} style={{ flex: 1, minWidth: 200, border: "1px solid #d6d3cb", background: "#fff", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#15212d", padding: "8px 12px", borderRadius: 2, outline: "none", textTransform: "uppercase" }} />
            <input value={sel.sheet} onChange={(e) => patch(sel.id, { sheet: e.target.value })} placeholder="Sheet # (A-101)" style={{ width: 150, border: "1px solid #d6d3cb", background: "#fff", fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#15212d", padding: "9px 12px", borderRadius: 2, outline: "none" }} />
            {isImg(sel) && (
              <button onClick={() => setMarkup((m) => !m)} style={{ background: markup ? ACCENT : "transparent", border: `1px solid ${markup ? ACCENT : "#15212d"}`, color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 14px", cursor: "pointer", borderRadius: 2 }}>{markup ? "📍 Markup: ON" : "📍 Markup"}</button>
            )}
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* sheet */}
            <div style={{ flex: "1 1 520px", minWidth: 300, background: "#15212d", border: "1px solid #0e1820", padding: 10 }}>
              {isImg(sel) ? (
                <div onClick={onImageClick} style={{ position: "relative", lineHeight: 0, cursor: markup ? "crosshair" : "default" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urls[sel.id]} alt={sel.name} style={{ width: "100%", display: "block", userSelect: "none" }} draggable={false} />
                  {sel.pins.map((p, i) => (
                    <div key={p.id} title={p.note} onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
                      <span style={{ background: ACCENT, color: "#15212d", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 11, width: 22, height: 22, borderRadius: "50% 50% 50% 0", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}><span style={{ transform: "rotate(-45deg)" }}>{i + 1}</span></span>
                    </div>
                  ))}
                </div>
              ) : (
                <iframe src={urls[sel.id]} title={sel.name} style={{ width: "100%", height: "76vh", border: "none", background: "#fff" }} />
              )}
            </div>

            {/* markup rail */}
            <div style={{ width: 300, flex: "none", background: "#fff", border: "1px solid #d6d3cb" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #efeee9", display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#15212d" }}>Markups</div>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#5a6470" }}>{sel.pins.length}</span>
              </div>
              {!isImg(sel) ? (
                <div style={{ padding: "18px 16px", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#a59f92", lineHeight: 1.6 }}>Pin markups work on image sheets. PDFs are shown for viewing — upload a JPG/PNG of a sheet to mark it up.</div>
              ) : sel.pins.length === 0 ? (
                <div style={{ padding: "18px 16px", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#a59f92", lineHeight: 1.6 }}>Turn on <b>Markup</b> and click the drawing to drop a numbered pin, then type a note here.</div>
              ) : sel.pins.map((p, i) => (
                <div key={p.id} style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: "1px solid #efeee9" }}>
                  <span style={{ flex: "none", background: ACCENT, color: "#15212d", fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 11, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <textarea value={p.note} onChange={(e) => setPins(sel.id, sel.pins.map((x) => (x.id === p.id ? { ...x, note: e.target.value } : x)))} placeholder="Note…" rows={2} style={{ flex: 1, border: "1px solid #e7e5dd", resize: "vertical", fontFamily: "'Barlow'", fontSize: 13, color: "#33404c", outline: "none", background: "#faf9f6", padding: 7, borderRadius: 2 }} />
                  <button onClick={() => setPins(sel.id, sel.pins.filter((x) => x.id !== p.id))} style={{ flex: "none", border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 12, height: 20 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
