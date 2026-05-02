"use client";

/* ─── Shared animated circuit-board background ────────────────────────────
   Usage:
     <CyberBackground intensity={1} />          // auth pages  (full)
     <CyberBackground intensity={0.18} />       // dashboard   (subtle)
   ───────────────────────────────────────────────────────────────────────── */

const C = "#00d4ff";

export function CyberBackground({ intensity = 1 }: { intensity?: number }) {
  const g = (a: number) => a * intensity;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>

      {/* ── Desktop SVG circuit traces ── */}
      <div className="hidden sm:block absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: g(0.58) }}
        >
          <defs>
            <filter id="bgLineGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left-side traces */}
          <g stroke={C} strokeWidth="1" fill="none" filter="url(#bgLineGlow)">
            <path d="M0,160 L140,160 L175,125 L340,125" />
            <path d="M0,240 L90,240 L125,205 L310,205 L345,170 L480,170" />
            <path d="M0,340 L65,340 L100,305 L230,305" />
            <path d="M0,430 L110,430 L145,395 L280,395 L315,360 L420,360" />
            <path d="M0,530 L55,530 L90,565 L240,565" />
          </g>

          {/* Right-side traces */}
          <g stroke={C} strokeWidth="1" fill="none" filter="url(#bgLineGlow)">
            <path d="M820,130 L1040,130 L1075,95 L1920,95" />
            <path d="M730,265 L970,265 L1010,230 L1920,230" />
            <path d="M900,390 L1120,390 L1165,425 L1920,425" />
            <path d="M780,490 L1030,490 L1075,525 L1920,525" />
            <path d="M860,605 L1060,605 L1100,570 L1920,570" />
          </g>

          {/* Vertical connectors */}
          <g stroke={C} strokeWidth="0.6" fill="none" opacity="0.35">
            <line x1="175" y1="80"  x2="175" y2="125" />
            <line x1="125" y1="160" x2="125" y2="205" />
            <line x1="100" y1="260" x2="100" y2="305" />
            <line x1="145" y1="345" x2="145" y2="395" />
            <line x1="1075" y1="50"  x2="1075" y2="95"  />
            <line x1="1010" y1="185" x2="1010" y2="230" />
            <line x1="1165" y1="385" x2="1165" y2="425" />
          </g>

          {/* Junction dots */}
          <g fill={C} filter="url(#bgLineGlow)">
            <circle cx="140"  cy="160" r="2.5" />
            <circle cx="175"  cy="125" r="2"   opacity="0.8" />
            <circle cx="90"   cy="240" r="2.5" />
            <circle cx="125"  cy="205" r="2"   opacity="0.8" />
            <circle cx="65"   cy="340" r="2.5" />
            <circle cx="110"  cy="430" r="2.5" />
            <circle cx="1040" cy="130" r="2.5" />
            <circle cx="1075" cy="95"  r="2"   opacity="0.8" />
            <circle cx="970"  cy="265" r="2.5" />
            <circle cx="1120" cy="390" r="2.5" />
          </g>
        </svg>
      </div>

      {/* ── Mobile SVG (minimal, less cluttered) ── */}
      <div className="block sm:hidden absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: g(0.35) }}
        >
          <defs>
            <filter id="bgLineGlowMob">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g stroke={C} strokeWidth="0.8" fill="none" filter="url(#bgLineGlowMob)">
            <path d="M0,120 L80,120 L110,90 L220,90" />
            <path d="M0,380 L60,380 L90,350 L180,350" />
          </g>
          <g fill={C} filter="url(#bgLineGlowMob)">
            <circle cx="80" cy="120" r="2" />
            <circle cx="60" cy="380" r="2" />
          </g>
        </svg>
      </div>

      {/* ── Pink radial glow (bottom-right) ── */}
      <div
        className="absolute bottom-0 right-0"
        style={{
          width: "min(720px,70vw)",
          height: "min(720px,70vh)",
          background: `radial-gradient(circle at 78% 88%, rgba(255,45,120,${g(0.22)}) 0%, transparent 55%)`,
        }}
      />

      {/* ── Cyan ambient glow (top-left) ── */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: "min(500px,50vw)",
          height: "min(500px,50vh)",
          background: `radial-gradient(circle at 12% 12%, rgba(0,212,255,${g(0.07)}) 0%, transparent 60%)`,
        }}
      />

      {/* ── Dot grid (desktop only) ── */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          opacity: g(0.022),
          backgroundImage: `linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      />

      {/* ── CRT scanlines ── */}
      <div
        className="absolute inset-0"
        style={{
          opacity: g(0.022),
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.6) 2px,rgba(0,212,255,0.6) 4px)",
        }}
      />
    </div>
  );
}
