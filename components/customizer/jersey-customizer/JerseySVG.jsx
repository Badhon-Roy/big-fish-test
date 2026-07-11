"use client";

import React from "react";

export function JerseySVG({
  primary = "#2196F3",
  secondary = "#1A1A2E",
  pattern = "plain",
  selected = false,
}) {
  // Helper for Fusion dots
  const fusionDots = [];
  // Solid backing on the right
  fusionDots.push(
    <polygon
      key="solid-back"
      points="66,0 100,0 100,100 76,100"
      fill={secondary}
    />,
  );
  // Diagonal halftone grid
  for (let x = 32; x <= 80; x += 3.3) {
    for (let y = 0; y <= 100; y += 3.3) {
      const dist = x - (45 - y * 0.15);
      if (dist > 0) {
        const r = Math.min(2.2, dist * 0.11);
        fusionDots.push(
          <circle
            key={`${x.toFixed(1)}-${y.toFixed(1)}`}
            cx={x}
            cy={y}
            r={r}
            fill={secondary}
          />,
        );
      }
    }
  }

  // Helper for Horizon lines
  const horizonLines = [];
  for (let y = 98; y >= 30; y -= 3) {
    const thickness = (y - 25) * 0.04;
    horizonLines.push(
      <line
        key={y}
        x1="0"
        y1={y}
        x2="100"
        y2={y}
        stroke={secondary}
        strokeWidth={thickness}
      />,
    );
  }

  // Helper for Nova dots
  const novaDots = [];
  const novaRows = [
    { c: 78, r: 1.6 },
    { c: 74, r: 1.1 },
    { c: 70, r: 0.7 },
    { c: 66, r: 0.4 },
  ];
  novaRows.forEach(({ c, r }, rowIdx) => {
    for (let t = 0; t <= c; t += 4.5) {
      const x = t;
      const y = c - t;
      if (y >= 0 && y <= 100) {
        novaDots.push(
          <circle
            key={`nd-${rowIdx}-${t.toFixed(1)}`}
            cx={x}
            cy={y}
            r={r}
            fill={secondary}
          />,
        );
      }
    }
  });

  // Helper for Matrix blocks
  const matrixBlocks = [];
  for (let x = 4; x <= 96; x += 4) {
    for (let y = 96; y >= 40; y -= 4) {
      const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const rand = val - Math.floor(val);
      if (rand < (y - 35) / 65) {
        const sz = 3.5 * ((y - 35) / 65) * (0.5 + 0.5 * rand);
        matrixBlocks.push(
          <rect
            key={`${x}-${y}`}
            x={x - sz / 2}
            y={y - sz / 2}
            width={sz}
            height={sz}
            fill={secondary}
          />,
        );
      }
    }
  }

  // Helper for Pulse lines
  const pulseLines = [];
  for (let x = 28; x <= 72; x += 1.8) {
    const dx = Math.abs(x - 50);
    const env = dx > 15 ? Math.max(0, 1 - (dx - 15) / 7.0) : 1.0;
    const h =
      env *
      80 *
      Math.pow(0.955, dx) *
      (0.6 + 0.4 * Math.abs(Math.cos(dx * 0.08)));
    const w = 1.0;
    const pts = `${(x - w).toFixed(1)},100 ${(x + w).toFixed(1)},100 ${x.toFixed(1)},${(100 - h).toFixed(1)}`;
    pulseLines.push(<polygon key={x.toFixed(1)} points={pts} fill={primary} />);
  }

  // Helper for Zenith lines
  const zenithLines = [];
  for (let x = 28; x <= 72; x += 4) {
    const dx = Math.min(x - 28, 72 - x);
    const opacity = dx < 8 ? 0.2 + (dx / 8) * 0.8 : 1.0;
    zenithLines.push(
      <line
        key={x}
        x1={x}
        y1="10"
        x2={x}
        y2="80"
        stroke="url(#zenithGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={opacity}
      />,
    );
  }

  // Helper for Obsidian chevrons
  const obsidianChevrons = [];
  for (let i = 0; i < 5; i++) {
    const y = 5 + i * 15;
    obsidianChevrons.push(
      <path
        key={i}
        d={`M -10,${y} L 50,${y + 20} L 110,${y}`}
        fill="none"
        stroke="white"
        strokeWidth="6"
        opacity="0.1"
      />,
    );
  }

  // Helper for Phantom splatters
  const phantomSplatterBlobs = [
    { cx: 25, cy: 30, r: 15 },
    { cx: 75, cy: 45, r: 18 },
    { cx: 45, cy: 75, r: 22 },
    { cx: 30, cy: 65, r: 12 },
    { cx: 80, cy: 20, r: 14 },
    { cx: 15, cy: 80, r: 10 },
    { cx: 60, cy: 15, r: 16 },
    { cx: 90, cy: 85, r: 12 },
    { cx: 40, cy: 35, r: 10 },
    { cx: 55, cy: 50, r: 14 },
  ];
  const phantomSplatterExtra = [
    { cx: 20, cy: 45, r: 3 },
    { cx: 35, cy: 20, r: 2 },
    { cx: 70, cy: 65, r: 4 },
    { cx: 50, cy: 90, r: 3 },
    { cx: 85, cy: 40, r: 2 },
  ];

  const patterns = {
    plain: <></>,
    strike: (
      <>
        <polygon points="20,10 40,10 75,90 55,90" fill={secondary} />
      </>
    ),
    save: (
      <>
        <rect x="0" y="0" width="50" height="100" fill={secondary} />
      </>
    ),
    fastbreak: (
      <>
        <polygon points="45,0 100,0 100,70" fill={secondary} />
      </>
    ),
    final: (
      <>
        <rect x="0" y="0" width="35" height="100" fill={secondary} />
        <rect x="65" y="0" width="35" height="100" fill={secondary} />
      </>
    ),
    victory: (
      <>
        <polygon points="0,0 40,0 20,100 0,100" fill={secondary} />
      </>
    ),
    city: (
      <>
        <rect x="0" y="30" width="100" height="10" fill={secondary} />
        <rect x="0" y="50" width="100" height="10" fill={secondary} />
      </>
    ),
    pure: (
      <>
        <polygon points="70,0 100,0 100,40" fill={secondary} />
      </>
    ),
    level: (
      <>
        <polygon points="0,0 55,0 0,70" fill={secondary} />
      </>
    ),
    vivo: (
      <>
        <polygon points="60,100 100,60 100,100" fill={secondary} />
      </>
    ),
    orion: (
      <>
        <polygon
          points="30,20 70,20 90,60 50,90 10,60"
          fill="white"
          opacity="0.18"
        />
        <polygon points="40,30 60,30 70,55 50,72 30,55" fill={secondary} />
      </>
    ),
    animal: (
      <>
        <path
          d="M0,0 L100,0 L100,50 Q75,80 50,55 Q25,80 0,50 Z"
          fill={secondary}
        />
      </>
    ),
    avatar: (
      <>
        <polygon points="55,0 67,0 22,100 10,100" fill={secondary} />
      </>
    ),
    league: (
      <>
        <rect x="0" y="0" width="50" height="100" fill={secondary} />
      </>
    ),
    magic: (
      <>
        <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondary} stopOpacity="1" />
          <stop offset="70%" stopColor={secondary} stopOpacity="0" />
        </linearGradient>
        <rect x="0" y="0" width="100" height="100" fill="url(#mg)" />
      </>
    ),
    raid: (
      <>
        <rect x="0" y="0" width="100" height="50" fill={secondary} />
      </>
    ),
    rush: (
      <>
        <polygon points="0,60 40,100 0,100" fill={secondary} />
      </>
    ),
    score: (
      <>
        <polygon points="0,0 100,0 0,100" fill={secondary} />
      </>
    ),
    apex: (
      <>
        {/* Shoulder Caps */}
        <polygon points="0,0 32,0 0,28" fill={secondary} />
        <polygon points="100,0 68,0 100,28" fill={secondary} />
        {/* Main V Chevron */}
        <polygon
          points="0,33 50,53 100,33 100,45 50,65 0,45"
          fill={secondary}
        />
        {/* Shadow Chevrons */}
        <polygon
          points="0,47 50,67 100,47 100,57 50,77 0,57"
          fill={secondary}
          opacity="0.2"
        />
        <polygon
          points="0,59 50,79 100,59 100,69 50,89 0,69"
          fill={secondary}
          opacity="0.1"
        />
      </>
    ),
    bolt: (
      <>
        <rect x="0" y="0" width="100" height="100" fill={secondary} />
        {/* Shoulder/armhole blue slashes */}
        <polygon points="0,14 18,10 0,24" fill={primary} />
        <polygon points="100,14 82,10 100,24" fill={primary} />
        {/* Giant lightning bolt */}
        <polygon points="75,12 36,52 45,52 32,90 64,46 55,46" fill={primary} />
      </>
    ),
    edge: (
      <>
        <polygon
          points="0,0 50,0 50,10 46,10 46,20 50,20 50,30 46,30 46,40 50,40 50,50 46,50 46,60 50,60 50,70 46,70 46,80 50,80 50,90 46,90 46,100 0,100"
          fill={secondary}
        />
      </>
    ),
    fusion: <>{fusionDots}</>,
    horizon: <>{horizonLines}</>,
    matrix: <>{matrixBlocks}</>,
    nova: (
      <>
        {/* Parallel diagonal black stripes and solid corner */}
        <polygon points="0,82 82,0 86,0 0,86" fill={secondary} />
        <polygon points="0,96 96,0 100,0 0,100" fill={secondary} />
        <polygon points="10,100 100,10 100,14 14,100" fill={secondary} />
        <polygon points="24,100 100,24 100,100" fill={secondary} />
        {/* Halftone dots border on the blue chest side */}
        {novaDots}
      </>
    ),
    pulse: (
      <>
        <rect x="0" y="0" width="100" height="100" fill={secondary} />
        {pulseLines}
      </>
    ),
    summit: (
      <>
        {/* Main peak with solid bottom base */}
        <polygon
          points="0,85 15,85 25,78 23,80 35,71 33,73 50,60 67,73 65,71 77,80 75,78 85,85 100,85 100,100 0,100"
          fill={secondary}
        />

        {/* Hollow chevron peak 2 */}
        <polygon
          points="20,78 32,65 30,67 42,54 40,56 50,49 60,56 58,54 68,67 66,65 80,78 80,82 66,71 68,69 58,60 60,58 50,54 40,58 42,60 32,69 30,71 20,82"
          fill={secondary}
        />

        {/* Hollow chevron peak 3 */}
        <polygon
          points="25,70 36,58 34,60 50,42 66,60 64,58 75,70 75,74 64,62 66,60 50,47 34,60 36,62 25,74"
          fill={secondary}
        />

        {/* Loose rock shards */}
        <polygon points="12,83 18,78 15,85" fill={secondary} />
        <polygon points="28,64 32,58 30,67" fill={secondary} />
        <polygon points="88,83 82,78 85,85" fill={secondary} />
        <polygon points="72,64 68,58 70,67" fill={secondary} />
        <polygon points="48,51 52,51 50,54" fill={secondary} />
      </>
    ),
    tempo: (
      <>
        {/* Graduated diagonal stripes */}
        <line x1="0" y1="58" x2="100" y2="18" stroke={secondary} strokeWidth="0.6" />
        <line x1="0" y1="64" x2="100" y2="24" stroke={secondary} strokeWidth="1.0" />
        <line x1="0" y1="70" x2="100" y2="30" stroke={secondary} strokeWidth="1.6" />
        <line x1="0" y1="76" x2="100" y2="36" stroke={secondary} strokeWidth="2.4" />
        <line x1="0" y1="83" x2="100" y2="43" stroke={secondary} strokeWidth="3.6" />
        <line x1="0" y1="91" x2="100" y2="51" stroke={secondary} strokeWidth="5.2" />
        <line x1="0" y1="100" x2="100" y2="60" stroke={secondary} strokeWidth="7.5" />
        <line x1="0" y1="110" x2="100" y2="70" stroke={secondary} strokeWidth="11.0" />
        {/* Solid corner panel */}
        <polygon points="45,100 100,78 100,100" fill={secondary} />
      </>
    ),
    titan: (
      <>
        <rect x="0" y="0" width="100" height="100" fill={secondary} />
        {/* Center stripe */}
        <rect x="45" y="0" width="10" height="100" fill={primary} />
        {/* Left side stripe */}
        <polygon
          points="41,0 43,0 43,60 41,64 41,100 37,100 37,64 41,60"
          fill={primary}
        />
        {/* Right side stripe */}
        <polygon
          points="57,0 59,0 59,60 63,64 63,100 59,100 59,64 57,60"
          fill={primary}
        />
        {/* Left/right side accent lines */}
        <line x1="37" y1="35" x2="37" y2="58" stroke={primary} strokeWidth="0.8" opacity="0.6" />
        <line x1="63" y1="35" x2="63" y2="58" stroke={primary} strokeWidth="0.8" opacity="0.6" />
        {/* Shoulder stripes */}
        <polygon points="0,10 24,0 32,0 0,16" fill={primary} />
        <polygon points="100,10 76,0 68,0 100,16" fill={primary} />
      </>
    ),
    zenith: (
      <>
        <defs>
          <linearGradient id="zenithGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondary} stopOpacity="1" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0" />
          </linearGradient>
        </defs>
        {zenithLines}
      </>
    ),
    ignite: (
      <>
        <rect x="0" y="0" width="100" height="100" fill={primary} />

        {/* Background flames - all x strictly 30..70 */}
        <path d="M 30,100 Q 32,82 33,72 Q 34,82 36,100 Z" fill={secondary} opacity="0.45" />
        <path d="M 37,100 Q 41,75 44,58 Q 48,75 51,100 Z" fill={secondary} opacity="0.45" />
        <path d="M 50,100 Q 54,74 57,57 Q 61,74 64,100 Z" fill={secondary} opacity="0.45" />
        <path d="M 64,100 Q 66,82 67,72 Q 68,82 70,100 Z" fill={secondary} opacity="0.45" />

        {/* Foreground flames - all x strictly 30..70 */}
        <path d="M 30,100 Q 31,92 32,88 Q 33,92 34,100 Z" fill={secondary} />
        <path d="M 34,100 Q 36,85 38,76 Q 40,85 42,100 Z" fill={secondary} />
        <path d="M 40,100 Q 42,80 44,65 Q 47,80 49,100 Z" fill={secondary} />
        <path d="M 47,100 Q 49,88 50,83 Q 51,88 53,100 Z" fill={secondary} />
        <path d="M 52,100 Q 55,79 58,63 Q 62,79 65,100 Z" fill={secondary} />
        <path d="M 62,100 Q 64,85 65,77 Q 67,85 68,100 Z" fill={secondary} />
        <path d="M 67,100 Q 68,92 69,88 Q 69,92 70,100 Z" fill={secondary} />
      </>
    ),
    kinetic: (
      <>
        <polygon points="0,60 0,80 80,0 60,0" fill={secondary} />
        <polygon points="20,100 35,100 100,35 100,20" fill={secondary} />
        <polygon points="0,25 0,40 40,0 25,0" fill={secondary} />
      </>
    ),
    legacy: (
      <>
        <rect x="0" y="0" width="50" height="50" fill={secondary} />
        <rect x="50" y="50" width="50" height="50" fill={secondary} />
      </>
    ),
    momentum: (
      <>
        <polygon points="0,50 0,65 65,0 50,0" fill={secondary} />
        <line x1="0" y1="31" x2="31" y2="0" stroke={secondary} strokeWidth="3" />
        <line x1="16" y1="100" x2="100" y2="16" stroke={secondary} strokeWidth="3" />
      </>
    ),
    obsidian: <>{obsidianChevrons}</>,
    phantom: (
      <>
        {phantomSplatterBlobs.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={secondary} opacity="0.5" />
        ))}
        {phantomSplatterExtra.map((b, i) => (
          <circle key={`ex-${i}`} cx={b.cx} cy={b.cy} r={b.r} fill={secondary} opacity="0.5" />
        ))}
      </>
    ),
    stride: (
      <>
        <polygon points="60,10 80,10 50,90 30,90" fill={secondary} />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* jersey body */}
      <path
        d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
        fill={primary}
      />
      {/* pattern overlay */}
      <clipPath id="jerseyClip">
        <path d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z" />
      </clipPath>
      <g clipPath="url(#jerseyClip)">{patterns[pattern] ?? <></>}</g>
      {/* collar */}
      <path
        d="M38,18 Q50,30 62,18"
        fill="none"
        stroke={secondary}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* outline */}
      <path
        d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
        fill="none"
        stroke={selected ? "#3B82F6" : "rgba(0,0,0,0.18)"}
        strokeWidth={selected ? 3 : 1.5}
      />
    </svg>
  );
}
export default JerseySVG;
