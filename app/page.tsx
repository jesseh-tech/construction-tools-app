import Link from "next/link";
import Image from "next/image";

const CRANE_SVG = `
<svg viewBox="0 0 760 820" style="width:92%;height:92%;overflow:visible;">
  <line x1="40" y1="720" x2="730" y2="720" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
  <g stroke="rgba(255,255,255,0.16)" stroke-width="1">
    <line x1="60" y1="730" x2="40" y2="748"/><line x1="120" y1="730" x2="100" y2="748"/><line x1="180" y1="730" x2="160" y2="748"/><line x1="240" y1="730" x2="220" y2="748"/><line x1="300" y1="730" x2="280" y2="748"/>
  </g>
  <g stroke="rgba(255,255,255,0.22)" stroke-width="1.6" fill="none">
    <line x1="95" y1="720" x2="95" y2="430"/><line x1="180" y1="720" x2="180" y2="430"/><line x1="265" y1="720" x2="265" y2="470"/>
    <line x1="95" y1="720" x2="265" y2="720"/><line x1="95" y1="650" x2="265" y2="650"/><line x1="95" y1="580" x2="265" y2="580"/><line x1="95" y1="510" x2="265" y2="510"/><line x1="95" y1="470" x2="180" y2="470"/>
  </g>
  <g stroke="rgba(245,166,35,0.18)" stroke-width="1">
    <line x1="100" y1="715" x2="175" y2="655"/><line x1="120" y1="715" x2="195" y2="655"/><line x1="140" y1="715" x2="215" y2="655"/><line x1="160" y1="715" x2="235" y2="655"/><line x1="185" y1="715" x2="260" y2="655"/>
  </g>
  <g stroke="#f5a623" stroke-width="2.4" fill="none" stroke-linecap="square" stroke-linejoin="round">
    <line x1="430" y1="720" x2="430" y2="158"/><line x1="466" y1="720" x2="466" y2="158"/>
    <line x1="430" y1="720" x2="466" y2="666"/><line x1="466" y1="720" x2="430" y2="666"/><line x1="430" y1="666" x2="466" y2="612"/><line x1="466" y1="666" x2="430" y2="612"/><line x1="430" y1="612" x2="466" y2="558"/><line x1="466" y1="612" x2="430" y2="558"/><line x1="430" y1="558" x2="466" y2="504"/><line x1="466" y1="558" x2="430" y2="504"/><line x1="430" y1="504" x2="466" y2="450"/><line x1="466" y1="504" x2="430" y2="450"/><line x1="430" y1="450" x2="466" y2="396"/><line x1="466" y1="450" x2="430" y2="396"/><line x1="430" y1="396" x2="466" y2="342"/><line x1="466" y1="396" x2="430" y2="342"/><line x1="430" y1="342" x2="466" y2="288"/><line x1="466" y1="342" x2="430" y2="288"/><line x1="430" y1="288" x2="466" y2="234"/><line x1="466" y1="288" x2="430" y2="234"/><line x1="430" y1="234" x2="466" y2="180"/><line x1="466" y1="234" x2="430" y2="180"/>
    <line x1="430" y1="666" x2="466" y2="666"/><line x1="430" y1="558" x2="466" y2="558"/><line x1="430" y1="450" x2="466" y2="450"/><line x1="430" y1="342" x2="466" y2="342"/><line x1="430" y1="234" x2="466" y2="234"/>
    <rect x="420" y="150" width="56" height="14"/>
    <line x1="430" y1="150" x2="448" y2="70"/><line x1="466" y1="150" x2="448" y2="70"/>
    <rect x="466" y="150" width="40" height="40"/>
    <line x1="420" y1="166" x2="118" y2="190"/><line x1="420" y1="190" x2="150" y2="206"/><line x1="118" y1="190" x2="150" y2="206"/>
    <line x1="390" y1="168" x2="378" y2="192"/><line x1="330" y1="172" x2="318" y2="195"/><line x1="270" y1="177" x2="258" y2="198"/><line x1="210" y1="181" x2="198" y2="201"/>
    <line x1="476" y1="166" x2="640" y2="180"/><line x1="476" y1="190" x2="612" y2="200"/><line x1="640" y1="180" x2="612" y2="200"/>
    <rect x="600" y="176" width="48" height="46" fill="rgba(245,166,35,0.14)"/>
    <line x1="448" y1="70" x2="130" y2="190"/><line x1="448" y1="70" x2="636" y2="180"/>
  </g>
  <g style="transform-box:fill-box;transform-origin:230px 178px;animation:hookSway 5.5s ease-in-out infinite;">
    <line x1="230" y1="178" x2="230" y2="470" stroke="#f5a623" stroke-width="1.6"/>
    <path d="M222 470 q8 16 16 0" stroke="#f5a623" stroke-width="2.4" fill="none"/>
    <rect x="178" y="486" width="104" height="16" stroke="#f5a623" stroke-width="2.4" fill="rgba(245,166,35,0.12)"/>
    <line x1="200" y1="470" x2="178" y2="486" stroke="#f5a623" stroke-width="1.4"/><line x1="260" y1="470" x2="282" y2="486" stroke="#f5a623" stroke-width="1.4"/>
  </g>
  <rect x="216" y="171" width="28" height="11" stroke="#f5a623" stroke-width="2" fill="#15212d"/>
  <g stroke="rgba(154,166,178,0.55)" stroke-width="1">
    <line x1="700" y1="158" x2="700" y2="720"/><line x1="694" y1="158" x2="706" y2="158"/><line x1="694" y1="720" x2="706" y2="720"/>
  </g>
  <text x="712" y="442" fill="rgba(154,166,178,0.8)" font-family="'JetBrains Mono',monospace" font-size="15" transform="rotate(90 712 442)" text-anchor="middle">210'-0"</text>
  <g stroke="rgba(154,166,178,0.55)" stroke-width="1">
    <line x1="95" y1="762" x2="265" y2="762"/><line x1="95" y1="756" x2="95" y2="768"/><line x1="265" y1="756" x2="265" y2="768"/>
  </g>
  <text x="180" y="784" fill="rgba(154,166,178,0.8)" font-family="'JetBrains Mono',monospace" font-size="15" text-anchor="middle">48'-0"</text>
  <g>
    <circle cx="95" cy="404" r="13" stroke="rgba(154,166,178,0.6)" stroke-width="1" fill="#15212d"/>
    <text x="95" y="409" fill="rgba(154,166,178,0.85)" font-family="'JetBrains Mono',monospace" font-size="13" text-anchor="middle">A</text>
  </g>
</svg>`;

const corner = (pos: React.CSSProperties): React.CSSProperties => ({
  position: "absolute", width: 18, height: 18, ...pos,
});

export default function TitlePage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", background: "radial-gradient(120% 120% at 78% 12%, #1b2f3e 0%, #15212d 46%, #0e1a24 100%)", fontFamily: "'Barlow',sans-serif", color: "#f4f3f0" }}>
      {/* blueprint grids */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,166,35,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(245,166,35,0.045) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "160px 160px" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 70% at 30% 55%, transparent 40%, rgba(8,14,20,0.55) 100%)" }} />

      {/* corner registration marks */}
      <div style={corner({ top: 26, left: 26, borderLeft: "2px solid rgba(245,166,35,0.5)", borderTop: "2px solid rgba(245,166,35,0.5)" })} />
      <div style={corner({ top: 26, right: 26, borderRight: "2px solid rgba(245,166,35,0.5)", borderTop: "2px solid rgba(245,166,35,0.5)" })} />
      <div style={corner({ bottom: 26, left: 26, borderLeft: "2px solid rgba(245,166,35,0.5)", borderBottom: "2px solid rgba(245,166,35,0.5)" })} />
      <div style={corner({ bottom: 26, right: 26, borderRight: "2px solid rgba(245,166,35,0.5)", borderBottom: "2px solid rgba(245,166,35,0.5)" })} />

      {/* crane drawing */}
      <div
        className="cover-crane"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", minWidth: 560, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
        dangerouslySetInnerHTML={{ __html: CRANE_SVG }}
      />

      {/* foreground content */}
      <div style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(40px,7vw,110px)", maxWidth: 780 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34 }}>
          <Image src="/brand/10cent-lockup-white.png" alt="10 Cent Investments" width={52} height={52} style={{ objectFit: "contain" }} />
          <div style={{ lineHeight: 0.96 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 25, letterSpacing: "0.05em" }}>10 CENT</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: "0.3em", color: "#f5a623" }}>INVESTMENTS</div>
          </div>
        </div>

        <div className="cover-rise" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{ width: 38, height: 2, background: "#f5a623" }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, letterSpacing: "0.26em", color: "#9aa6b2", textTransform: "uppercase" }}>General Contracting · AI-Native Platform</span>
        </div>

        <h1 className="cover-rise" style={{ margin: 0, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "clamp(58px,8.4vw,118px)", lineHeight: 0.9, letterSpacing: "0.005em", textTransform: "uppercase" }}>
          Construction<br /><span style={{ color: "#f5a623" }}>Tools</span>
        </h1>

        <p className="cover-rise-2" style={{ margin: "26px 0 0", maxWidth: 460, fontSize: 17, lineHeight: 1.55, color: "#c4ccd4" }}>
          Nineteen integrated tools with a built-in AI assistant — from first takeoff to final closeout. One project, one source of truth, preconstruction straight through to the field.
        </p>

        <Link href="/dashboard" className="cover-cta cover-rise-3" style={{ display: "inline-flex", alignItems: "stretch", width: "fit-content", marginTop: 44, border: "1px solid #f5a623", background: "#f5a623", color: "#15212d" }}>
          <span style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px 30px" }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 26, letterSpacing: "0.08em", lineHeight: 1, textTransform: "uppercase" }}>Enter Dashboard</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.16em", marginTop: 5, color: "#5a3d05" }}>LAUNCH THE PROJECT WORKSPACE</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", borderLeft: "1px solid rgba(21,33,45,0.25)", fontSize: 30, fontWeight: 600 }}>→</span>
        </Link>

        <div className="cover-rise-4" style={{ display: "flex", flexWrap: "wrap", gap: "8px 10px", marginTop: 40 }}>
          {["ESTIMATE", "TAKEOFF", "CHANGE ORDERS", "PAY APP", "SUBMITTALS", "SCHEDULE", "SAFETY", "+12 MORE"].map((t) => (
            <span key={t} style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.08em", color: "#7f8c99", border: "1px solid rgba(127,140,153,0.3)", padding: "5px 10px" }}>{t}</span>
          ))}
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.08em", color: "#15212d", background: "#f5a623", padding: "5px 10px", fontWeight: 700 }}>✨ AI ASSISTANT</span>
        </div>
      </div>

      {/* drawing title block */}
      <div className="cover-titleblock" style={{ position: "absolute", right: 46, bottom: 46, zIndex: 6, width: 330, background: "rgba(15,26,36,0.82)", border: "1px solid rgba(154,166,178,0.35)", backdropFilter: "blur(2px)", fontFamily: "'JetBrains Mono'" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid rgba(154,166,178,0.25)" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#f5a623" }}>10 CENT INVESTMENTS</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, letterSpacing: "0.14em", color: "#7f8c99" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5a623", animation: "blink 2.4s steps(1) infinite" }} />READY</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[["SHEET", "G-001"], ["SCALE", "NTS"], ["DISCIPLINE", "GENERAL"], ["REV", "3.0"]].map(([k, v], i) => (
            <div key={k} style={{ padding: "9px 12px", borderRight: i % 2 === 0 ? "1px solid rgba(154,166,178,0.2)" : "none", borderBottom: i < 2 ? "1px solid rgba(154,166,178,0.2)" : "none" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "#5f6b77" }}>{k}</div>
              <div style={{ fontSize: 14, color: "#e7e5df", marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(154,166,178,0.25)", fontSize: 9, letterSpacing: "0.12em", color: "#7f8c99" }}>COVER SHEET — PROJECT WORKSPACE</div>
      </div>
    </div>
  );
}
