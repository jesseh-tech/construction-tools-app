"use client";

const ACCENT = "#f5a623";

// A big, friendly empty-state with a primary action button.
export function EmptyState({ icon, title, hint, actionLabel, onAction }: { icon: string; title: string; hint: string; actionLabel: string; onAction: () => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #d6d3cb", borderTop: `3px solid ${ACCENT}`, padding: "44px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fbf1dd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em", color: "#15212d", textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: "#8a8578", marginTop: 6, maxWidth: 380, lineHeight: 1.5 }}>{hint}</div>
      <button onClick={onAction} style={{ marginTop: 18, background: ACCENT, border: "none", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer", borderRadius: 3 }}>{actionLabel}</button>
    </div>
  );
}

// A persistent full-width "add" bar shown below a list so adding is always obvious.
export function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="add-row"
      style={{ width: "100%", marginTop: 12, padding: "14px", background: "#fff", border: "2px dashed #c9c5b8", color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}
    >
      {label}
    </button>
  );
}
