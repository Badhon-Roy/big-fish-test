"use client";

import React, { JSX } from "react";

interface JerseySVGProps {
  primary?: string;
  secondary?: string;
  pattern?: string;
  selected?: boolean;
}

export function JerseySVG({
  primary = "#2196F3",
  secondary = "#1A1A2E",
  pattern = "plain",
  selected = false,
}: JerseySVGProps) {
  const patterns: Record<string, JSX.Element> = {
    plain: <></>,
    strike: (
      <>
        <polygon points="60,10 80,10 50,90 30,90" fill={secondary} />
      </>
    ),
    save: (
      <>
        <rect x="0" y="0" width="45" height="100" fill={secondary} />
      </>
    ),
    fastbreak: (
      <>
        <polygon points="0,0 30,0 0,50" fill={secondary} />
        <polygon points="100,50 100,100 70,100" fill={secondary} />
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
        <line x1="0" y1="25" x2="100" y2="25" stroke={secondary} strokeWidth="4" />
        <line x1="0" y1="50" x2="100" y2="50" stroke={secondary} strokeWidth="4" />
        <line x1="0" y1="75" x2="100" y2="75" stroke={secondary} strokeWidth="4" />
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
        <polygon points="60,100 100,0 100,100" fill={secondary} />
      </>
    ),
    orion: (
      <>
        <polygon points="30,20 70,20 90,60 50,90 10,60" fill="white" opacity="0.18" />
        <polygon points="40,30 60,30 70,55 50,72 30,55" fill={secondary} />
      </>
    ),
    animal: (
      <>
        <path d="M0,0 Q25,40 50,10 Q75,40 100,0 L100,50 Q75,80 50,55 Q25,80 0,50 Z" fill={secondary} />
      </>
    ),
    avatar: (
      <>
        <polygon points="0,100 45,0 55,0 0,100" fill={secondary} />
      </>
    ),
    league: (
      <>
        <rect x="0" y="0" width="50" height="100" fill={secondary} />
        <rect x="50" y="0" width="50" height="100" fill={primary} opacity="0.3" />
      </>
    ),
    magic: (
      <>
        <radialGradient id="mg" cx="50%" cy="40%">
          <stop offset="0%" stopColor={secondary} stopOpacity="1" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
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
        <polygon points="0,0 0,100 40,100" fill={secondary} />
      </>
    ),
    score: (
      <>
        <polygon points="0,0 100,0 100,100" fill={secondary} />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* jersey body */}
      <path d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z" fill={primary} />
      {/* pattern overlay */}
      <clipPath id="jerseyClip">
        <path d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z" />
      </clipPath>
      <g clipPath="url(#jerseyClip)">{patterns[pattern] ?? <></>}</g>
      {/* collar */}
      <path d="M38,18 Q50,30 62,18" fill="none" stroke={secondary} strokeWidth="3.5" strokeLinecap="round" />
      {/* outline */}
      <path
        d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
        fill="none"
        stroke={selected ? "#E63946" : "rgba(0,0,0,0.18)"}
        strokeWidth={selected ? 3 : 1.5}
      />
    </svg>
  );
}
export default JerseySVG;
