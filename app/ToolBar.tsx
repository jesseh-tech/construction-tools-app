"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

const ACCENT = "#f5a623";

// Shared sticky top bar for the sub-tools (SOV, change orders, pay app, …).
export function ToolBar({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="noprint" style={{ position: "sticky", top: 0, zIndex: 60, display: "flex", alignItems: "stretch", height: 74, background: "#15212d", color: "#f4f3f0", borderBottom: `3px solid ${ACCENT}` }}>
      <Link href="/dashboard" title="Back to dashboard" style={{ display: "flex", alignItems: "center", gap: 13, padding: "0 22px", borderRight: "1px solid rgba(255,255,255,0.08)", flex: "none", textDecoration: "none", color: "inherit" }}>
        <Image src="/brand/10cent-lockup-white.png" alt="10 Cent Investments" width={46} height={46} style={{ objectFit: "contain" }} />
        <div style={{ lineHeight: 0.94 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 22, letterSpacing: "0.04em" }}>10 CENT</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: "0.26em", color: ACCENT }}>INVESTMENTS</div>
        </div>
      </Link>
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", padding: "0 18px", borderRight: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", color: "#9aa6b2", flex: "none", textDecoration: "none" }}>← DASHBOARD</Link>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 21, letterSpacing: "0.03em" }}>{title}</div>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#7f8c99", letterSpacing: "0.03em", marginTop: 2 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

export function ToolBarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", padding: "0 18px", borderLeft: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", color: "#9aa6b2", textDecoration: "none" }}>
      {label}
    </Link>
  );
}

export function ToolBarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: "none", background: ACCENT, color: "#15212d", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", padding: "0 22px", cursor: "pointer" }}>
      {label}
    </button>
  );
}
