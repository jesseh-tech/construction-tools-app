"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useProject } from "../ProjectProvider";
import { ToolBar } from "../ToolBar";
import { photosAll, photosAdd, photoUpdate, photoDelete } from "@/lib/fileVault";

const ACCENT = "#f5a623";

type PhotoView = { id: string; caption: string; location: string; addedAt: number; url: string };

export default function PhotosPage() {
  const { job, currentId } = useProject();
  const [photos, setPhotos] = useState<PhotoView[]>([]);
  const [dragging, setDragging] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const reload = useCallback(async () => {
    const recs = await photosAll(currentId);
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    const views = recs.map((r) => ({ id: r.id, caption: r.caption, location: r.location, addedAt: r.addedAt, url: URL.createObjectURL(r.blob) }));
    urlsRef.current = views.map((v) => v.url);
    setPhotos(views);
  }, [currentId]);

  useEffect(() => {
    reload();
    return () => { urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, [reload]);

  const add = (list: FileList | null) => { if (list && list.length) photosAdd(list, currentId).then(reload); };
  const save = (id: string, patch: { caption?: string; location?: string }) => {
    setPhotos((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    photoUpdate(id, patch);
  };
  const remove = (id: string) => photoDelete(id).then(reload);

  const inp: React.CSSProperties = { width: "100%", border: "none", borderBottom: "1px solid #efeee9", background: "transparent", fontFamily: "'Barlow'", fontSize: 13, color: "#1c2b3a", outline: "none", padding: "4px 0" };

  return (
    <div style={{ minHeight: "100vh", background: "#e7e5df", fontFamily: "'Barlow',sans-serif" }}>
      <ToolBar title="PHOTOS" subtitle={`${job.meta.name} · FIELD`}>
        <label style={{ display: "flex", alignItems: "center", border: "none", background: ACCENT, color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", padding: "0 22px", cursor: "pointer" }}>
          + ADD PHOTOS
          <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => { add(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
        </label>
      </ToolBar>

      <div style={{ padding: 22 }}>
        <label
          onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
          style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, border: `2px dashed ${dragging ? ACCENT : "#c9c5b8"}`, borderRadius: 3, cursor: "pointer", background: dragging ? "#fbf3e3" : "#fff", marginBottom: 18 }}
        >
          <input type="file" accept="image/*" multiple capture="environment" onChange={(e) => { add(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
          <div style={{ flex: "none", width: 46, height: 46, border: "1.5px solid #c4c0b6", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "#a59f92", fontSize: 22, background: "#faf9f5" }}>📷</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "#15212d" }}>Drop photos here, or tap to capture</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#8a8578", marginTop: 4 }}>On a phone this opens the camera. Photos are saved to this project on this device.</div>
          </div>
        </label>

        {photos.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #d6d3cb", padding: "46px 20px", textAlign: "center", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18, color: "#9a9488", textTransform: "uppercase" }}>No photos yet</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {photos.map((p) => (
              <div key={p.id} style={{ background: "#fff", border: "1px solid #d6d3cb", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption} onClick={() => window.open(p.url, "_blank")} style={{ width: "100%", height: 160, objectFit: "cover", cursor: "pointer", display: "block", background: "#0e1a24" }} />
                <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <input value={p.caption} onChange={(e) => save(p.id, { caption: e.target.value })} placeholder="Caption" style={{ ...inp, fontWeight: 600, color: "#15212d" }} />
                  <input value={p.location} onChange={(e) => save(p.id, { location: e.target.value })} placeholder="Location" style={{ ...inp, fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#5a6470" }} />
                  <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#9a9488" }}>{new Date(p.addedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "2-digit" })}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => remove(p.id)} style={{ border: "none", background: "none", color: "#bdb8ac", cursor: "pointer", fontSize: 12 }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
