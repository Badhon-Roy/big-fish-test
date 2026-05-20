"use client";

import { JSX, useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Center,
} from "@react-three/drei";
import {
  Palette,
  Grid,
  Type,
  Image as ImageIcon,
  Sparkles,
  Scissors,
  Box,
  ChevronLeft,
  Save,
  Share2,
  Download,
  ShoppingCart,
  Wand2,
  Hash,
  LayoutTemplate,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Realistic GLTF Jersey Model using Decals ─────────────────────────────────
import { useGLTF, Decal } from "@react-three/drei";

function useJerseyDecals(state: any) {
  return useMemo(() => {
    const size = 1024;

    // Use secondary color for text to respect user's color selection
    const textColor = state.secondary || "#ffffff";

    const makeCanvas = (drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      const cv = document.createElement("canvas");
      cv.width = size;
      cv.height = size;
      const ctx = cv.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawFn(ctx);
      return new THREE.CanvasTexture(cv);
    };

    const getFontString = (
      sizeStr: any,
      fontStyle: string,
      defaultSize: number,
    ) => {
      const sz = sizeStr || defaultSize;
      if (fontStyle === "Italic")
        return `italic 900 ${sz}px Impact, sans-serif`;
      if (fontStyle === "Script")
        return `bold ${sz}px "Brush Script MT", cursive`;
      if (fontStyle === "Block") return `900 ${sz}px "Courier New", monospace`;
      if (fontStyle === "Varsity")
        return `900 ${sz}px "Arial Black", sans-serif`;
      // Default and Outline use Impact
      return `900 ${sz}px Impact, sans-serif`;
    };

    // ── Pattern drawing — mirrors every SVG pattern to Canvas 2D ──────────────
    const drawPattern = (ctx: CanvasRenderingContext2D) => {
      const dp = state.designPattern;
      if (!dp || dp === "plain") return;
      const sc = size / 100; // SVG viewBox is 100×100, canvas is 1024×1024
      const sec = state.designColor || state.secondary || "#1A1A2E";
      const pri = state.primary || "#2196F3";
      ctx.save();
      ctx.fillStyle = sec;
      ctx.strokeStyle = sec;
      switch (dp) {
        case "strike":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(60 * sc, 10 * sc);
          ctx.lineTo(80 * sc, 10 * sc);
          ctx.lineTo(50 * sc, 90 * sc);
          ctx.lineTo(30 * sc, 90 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "save":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, 45 * sc, size);
          break;
        case "fastbreak":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(30 * sc, 0);
          ctx.lineTo(0, 50 * sc);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(100 * sc, 50 * sc);
          ctx.lineTo(100 * sc, 100 * sc);
          ctx.lineTo(70 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "final":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, 35 * sc, size);
          ctx.fillRect(65 * sc, 0, 35 * sc, size);
          break;
        case "victory":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(40 * sc, 0);
          ctx.lineTo(20 * sc, 100 * sc);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "city":
          ctx.globalAlpha = 1.0;
          ctx.lineWidth = 4 * sc;
          [25, 50, 75].forEach((y) => {
            ctx.beginPath();
            ctx.moveTo(0, y * sc);
            ctx.lineTo(size, y * sc);
            ctx.stroke();
          });
          break;
        case "pure":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(70 * sc, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 40 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "level":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(55 * sc, 0);
          ctx.lineTo(0, 70 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "vivo":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(60 * sc, 100 * sc);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "orion":
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          [
            [30, 20],
            [70, 20],
            [90, 60],
            [50, 90],
            [10, 60],
          ].forEach(([x, y], i) => {
            i === 0 ? ctx.moveTo(x * sc, y * sc) : ctx.lineTo(x * sc, y * sc);
          });
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = sec;
          ctx.beginPath();
          [
            [40, 30],
            [60, 30],
            [70, 55],
            [50, 72],
            [30, 55],
          ].forEach(([x, y], i) => {
            i === 0 ? ctx.moveTo(x * sc, y * sc) : ctx.lineTo(x * sc, y * sc);
          });
          ctx.closePath();
          ctx.fill();
          break;
        case "animal":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(25 * sc, 40 * sc, 50 * sc, 10 * sc);
          ctx.quadraticCurveTo(75 * sc, 40 * sc, 100 * sc, 0);
          ctx.lineTo(100 * sc, 50 * sc);
          ctx.quadraticCurveTo(75 * sc, 80 * sc, 50 * sc, 55 * sc);
          ctx.quadraticCurveTo(25 * sc, 80 * sc, 0, 50 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "avatar":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 100 * sc);
          ctx.lineTo(45 * sc, 0);
          ctx.lineTo(55 * sc, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "league":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, 50 * sc, size);
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = pri;
          ctx.fillRect(50 * sc, 0, 50 * sc, size);
          break;
        case "magic": {
          const grad = ctx.createRadialGradient(
            50 * sc,
            40 * sc,
            0,
            50 * sc,
            40 * sc,
            80 * sc,
          );
          grad.addColorStop(0, sec);
          grad.addColorStop(1, "transparent");
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);
          break;
        }
        case "raid":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, size, 50 * sc);
          break;
        case "rush":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.lineTo(40 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "score":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        default:
          break;
      }
      ctx.restore();
    };

    // ── Fabric Pattern Canvas Drawer ──────────────────────────────────────────
    const drawFabricPattern = (
      ctx: CanvasRenderingContext2D,
      patternName: string,
    ) => {
      if (!patternName || patternName === "None") return;
      ctx.save();

      switch (patternName) {
        case "Stripes": {
          ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
          for (let i = 0; i < size; i += 64) {
            ctx.fillRect(i, 0, 24, size);
            ctx.fillRect(i + 36, 0, 4, size);
          }
          ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
          for (let i = 24; i < size; i += 64) {
            ctx.fillRect(i, 0, 8, size);
          }
          break;
        }
        case "Diagonal": {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
          ctx.lineWidth = 14;
          for (let i = -size; i < size * 2; i += 80) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + size, size);
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 5;
          for (let i = -size + 20; i < size * 2; i += 80) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + size, size);
            ctx.stroke();
          }
          break;
        }
        case "Lightning": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 4;
          for (let x = -50; x < size; x += 120) {
            ctx.beginPath();
            let curX = x;
            let curY = -20;
            ctx.moveTo(curX, curY);
            while (curY < size + 50) {
              const nextX = curX + (Math.random() > 0.5 ? 35 : -35);
              const nextY = curY + 45;
              ctx.lineTo(nextX, nextY);
              curX = nextX;
              curY = nextY;
            }
            ctx.stroke();
          }
          break;
        }
        case "Abstract": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = 4;
          for (let i = 0; i < size + 100; i += 40) {
            ctx.beginPath();
            for (let x = 0; x <= size; x += 10) {
              const y = i - 50 + Math.sin(x * 0.025 + i * 0.06) * 25;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }
        case "Geometric": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = 2.5;
          const hexRadius = 24;
          const h = hexRadius * Math.sqrt(3);
          for (let y = -h; y < size + h; y += h) {
            for (
              let x = -hexRadius;
              x < size + hexRadius * 3;
              x += hexRadius * 3
            ) {
              ctx.beginPath();
              for (let angle = 0; angle < 360; angle += 60) {
                const rad = (angle * Math.PI) / 180;
                const px =
                  x +
                  hexRadius * Math.cos(rad) +
                  (y % (2 * h) === 0 ? 0 : hexRadius * 1.5);
                const py = y + hexRadius * Math.sin(rad);
                if (angle === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.stroke();
            }
          }
          break;
        }
        case "Camouflage": {
          ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
          for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            const cx = Math.random() * size;
            const cy = Math.random() * size;
            ctx.arc(cx, cy, 35, 0, Math.PI * 2);
            ctx.arc(cx + 20, cy + 10, 25, 0, Math.PI * 2);
            ctx.arc(cx - 15, cy + 20, 30, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            const cx = Math.random() * size;
            const cy = Math.random() * size;
            ctx.arc(cx, cy, 25, 0, Math.PI * 2);
            ctx.arc(cx - 15, cy - 10, 20, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "Minimal": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
          ctx.lineWidth = 1.5;
          for (let x = 32; x < size; x += 64) {
            for (let y = 32; y < size; y += 64) {
              ctx.beginPath();
              ctx.moveTo(x - 6, y);
              ctx.lineTo(x + 6, y);
              ctx.moveTo(x, y - 6);
              ctx.lineTo(x, y + 6);
              ctx.stroke();
            }
          }
          break;
        }
        case "Gradient": {
          const grad = ctx.createLinearGradient(0, 0, size, size);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          grad.addColorStop(0.5, "rgba(0, 0, 0, 0.0)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);
          break;
        }
        case "Diamond": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
          ctx.lineWidth = 2.5;
          const w = 40;
          const h = 60;
          for (let x = 0; x < size + w; x += w) {
            for (let y = 0; y < size + h; y += h) {
              ctx.beginPath();
              ctx.moveTo(x, y - h / 2);
              ctx.lineTo(x + w / 2, y);
              ctx.lineTo(x, y + h / 2);
              ctx.lineTo(x - w / 2, y);
              ctx.closePath();
              ctx.stroke();
            }
          }
          break;
        }
        default:
          break;
      }
      ctx.restore();
    };

    // ── Separate full-body pattern canvases (large decals) ─────────────────
    const showFrontDecal =
      (state.designPattern &&
        state.designPattern !== "plain" &&
        (state.designSide === "Front" ||
          state.designSide === "Both" ||
          !state.designSide)) ||
      (state.fabricPatternFront && state.fabricPatternFront !== "None");

    const showBackDecal =
      (state.designPattern &&
        state.designPattern !== "plain" &&
        (state.designSide === "Back" ||
          state.designSide === "Both" ||
          !state.designSide)) ||
      (state.fabricPatternBack && state.fabricPatternBack !== "None");

    const patternFront = showFrontDecal
      ? makeCanvas((ctx) => {
          // 1. Draw fabric pattern first
          if (state.fabricPatternFront && state.fabricPatternFront !== "None") {
            drawFabricPattern(ctx, state.fabricPatternFront);
          }
          // 2. Draw design pattern on top
          if (
            state.designPattern &&
            state.designPattern !== "plain" &&
            (state.designSide === "Front" ||
              state.designSide === "Both" ||
              !state.designSide)
          ) {
            drawPattern(ctx);
          }
        })
      : null;

    const patternBack = showBackDecal
      ? makeCanvas((ctx) => {
          // 1. Draw fabric pattern first
          if (state.fabricPatternBack && state.fabricPatternBack !== "None") {
            drawFabricPattern(ctx, state.fabricPatternBack);
          }
          // 2. Draw design pattern on top
          if (
            state.designPattern &&
            state.designPattern !== "plain" &&
            (state.designSide === "Back" ||
              state.designSide === "Both" ||
              !state.designSide)
          ) {
            drawPattern(ctx);
          }
        })
      : null;

    if (patternFront) patternFront.anisotropy = 16;
    if (patternBack) patternBack.anisotropy = 16;

    // ── Text / number canvases (smaller decals, on top) ───────────────────────
    const front = makeCanvas((ctx) => {
      if (state.frontText) {
        const isOutline = state.frontFont === "Outline";
        ctx.font = getFontString(state.frontTextSize, state.frontFont, 110);

        ctx.strokeStyle = isOutline
          ? state.frontTextColor || textColor
          : state.primary;
        ctx.lineWidth = isOutline ? 4 : 8;

        // Max width to prevent horizontal canvas clipping
        const maxWidth = size * 0.9;
        ctx.strokeText(state.frontText, size * 0.5, size * 0.28, maxWidth);

        if (!isOutline) {
          ctx.fillStyle = state.frontTextColor || textColor;
          ctx.fillText(state.frontText, size * 0.5, size * 0.28, maxWidth);
        }
      }
      if (
        state.number &&
        (state.numberPosition === "Both" || state.numberPosition === "Front")
      ) {
        const isOutline = state.numberFont === "Outline";
        ctx.font = getFontString(320, state.numberFont, 320);

        ctx.strokeStyle = isOutline
          ? state.numberColor || textColor
          : state.primary;
        ctx.lineWidth = isOutline ? 8 : 16;
        ctx.strokeText(state.number, size * 0.5, size * 0.62, size * 0.9);

        if (!isOutline) {
          ctx.fillStyle = state.numberColor || textColor;
          ctx.fillText(state.number, size * 0.5, size * 0.62, size * 0.9);
        }
      }
    });

    const back = makeCanvas((ctx) => {
      if (state.backText) {
        const isOutline = state.backFont === "Outline";
        ctx.font = getFontString(state.backTextSize, state.backFont, 80);

        ctx.strokeStyle = isOutline
          ? state.backTextColor || textColor
          : state.primary;
        ctx.lineWidth = isOutline ? 4 : 6;

        const maxWidth = size * 0.9;
        ctx.strokeText(state.backText, size * 0.5, size * 0.2, maxWidth);

        if (!isOutline) {
          ctx.fillStyle = state.backTextColor || textColor;
          ctx.fillText(state.backText, size * 0.5, size * 0.2, maxWidth);
        }
      }
      if (
        state.number &&
        (state.numberPosition === "Both" || state.numberPosition === "Back")
      ) {
        const isOutline = state.numberFont === "Outline";
        ctx.font = getFontString(380, state.numberFont, 380);

        ctx.strokeStyle = isOutline
          ? state.numberColor || textColor
          : state.primary;
        ctx.lineWidth = isOutline ? 8 : 16;
        ctx.strokeText(state.number, size * 0.5, size * 0.6, size * 0.9);

        if (!isOutline) {
          ctx.fillStyle = state.numberColor || textColor;
          ctx.fillText(state.number, size * 0.5, size * 0.6, size * 0.9);
        }
      }
    });

    if (front) front.anisotropy = 16;
    if (back) back.anisotropy = 16;

    return { front, back, patternFront, patternBack };
  }, [state]);
}


// ─── Mini Pattern Preview SVG Component ─────────────────────────────────────
function MiniPatternSVG({
  pattern,
  primary,
}: {
  pattern: string;
  primary: string;
}) {
  const secondary = "rgba(0,0,0,0.15)";
  const white = "rgba(255,255,255,0.2)";

  const getPatternContent = () => {
    switch (pattern) {
      case "Stripes":
        return (
          <>
            <rect x="15" y="0" width="8" height="100" fill={white} />
            <rect x="27" y="0" width="2" height="100" fill={white} />
            <rect x="45" y="0" width="8" height="100" fill={white} />
            <rect x="57" y="0" width="2" height="100" fill={white} />
            <rect x="75" y="0" width="8" height="100" fill={white} />
            <rect x="87" y="0" width="2" height="100" fill={white} />
          </>
        );
      case "Diagonal":
        return (
          <>
            <line
              x1="-20"
              y1="20"
              x2="40"
              y2="-40"
              stroke={secondary}
              strokeWidth="6"
            />
            <line
              x1="10"
              y1="50"
              x2="70"
              y2="-10"
              stroke={secondary}
              strokeWidth="6"
            />
            <line
              x1="40"
              y1="80"
              x2="100"
              y2="20"
              stroke={secondary}
              strokeWidth="6"
            />
            <line
              x1="70"
              y1="110"
              x2="130"
              y2="50"
              stroke={secondary}
              strokeWidth="6"
            />

            <line
              x1="-15"
              y1="25"
              x2="45"
              y2="-35"
              stroke={white}
              strokeWidth="2"
            />
            <line
              x1="15"
              y1="55"
              x2="75"
              y2="-5"
              stroke={white}
              strokeWidth="2"
            />
            <line
              x1="45"
              y1="85"
              x2="105"
              y2="25"
              stroke={white}
              strokeWidth="2"
            />
            <line
              x1="75"
              y1="115"
              x2="135"
              y2="55"
              stroke={white}
              strokeWidth="2"
            />
          </>
        );
      case "Lightning":
        return (
          <path
            d="M20,10 L10,50 L25,50 L12,90 M50,10 L40,50 L55,50 L42,90 M80,10 L70,50 L85,50 L72,90"
            stroke={white}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case "Abstract":
        return (
          <path
            d="M-10,30 Q20,10 50,30 T110,30 M-10,50 Q20,30 50,50 T110,50 M-10,70 Q20,50 50,70 T110,70"
            stroke={white}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "Geometric":
        return (
          <path
            d="M 0,0 L 20,20 L 40,0 L 60,20 L 80,0 L 100,20 M 0,20 L 20,40 L 40,20 L 60,40 L 80,20 L 100,40 M 0,40 L 20,60 L 40,40 L 60,60 L 80,40 L 100,60 M 0,60 L 20,80 L 40,60 L 60,80 L 80,60 L 100,80"
            stroke={white}
            strokeWidth="1.5"
            fill="none"
          />
        );
      case "Camouflage":
        return (
          <>
            <path
              d="M 10,20 Q 20,5 35,15 T 60,10 T 80,30 T 40,45 Z"
              fill={secondary}
            />
            <path
              d="M 20,60 Q 40,45 55,65 T 80,50 T 90,80 T 50,90 Z"
              fill={white}
            />
          </>
        );
      case "Minimal":
        return (
          <>
            <circle cx="20" cy="20" r="2.5" fill={white} />
            <circle cx="50" cy="20" r="2.5" fill={white} />
            <circle cx="80" cy="20" r="2.5" fill={white} />
            <circle cx="20" cy="50" r="2.5" fill={white} />
            <circle cx="50" cy="50" r="2.5" fill={white} />
            <circle cx="80" cy="50" r="2.5" fill={white} />
            <circle cx="20" cy="80" r="2.5" fill={white} />
            <circle cx="50" cy="80" r="2.5" fill={white} />
            <circle cx="80" cy="80" r="2.5" fill={white} />
          </>
        );
      case "Gradient":
        return (
          <defs>
            <linearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor="#111111" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        );
      case "Diamond":
        return (
          <path
            d="M 50,10 L 70,30 L 50,50 L 30,30 Z M 20,40 L 40,60 L 20,80 L 0,60 Z M 80,40 L 100,60 L 80,80 L 60,60 Z"
            stroke={white}
            strokeWidth="1.5"
            fill="none"
          />
        );
      default:
        return null;
    }
  };

  const isGradient = pattern === "Gradient";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full bg-zinc-200"
      style={{ backgroundColor: isGradient ? undefined : primary }}
    >
      {getPatternContent()}
      {isGradient && <rect width="100" height="100" fill="url(#miniGrad)" />}
      {pattern === "None" && (
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill="rgba(0,0,0,0.3)"
          fontSize="14"
          fontWeight="bold"
        >
          Solid
        </text>
      )}
    </svg>
  );
}

// Preload the model to prevent popping
useGLTF.preload("/models/shirt_baked.glb");

function Jersey3D({ colors, collar }: { colors: any; collar: boolean }) {
  const { nodes } = useGLTF("/models/shirt_baked.glb") as any;
  const { front, back, patternFront, patternBack } = useJerseyDecals(colors);

  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
  const [logoAspect, setLogoAspect] = useState(1);

  useEffect(() => {
    if (!colors.logo) {
      setLogoTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      colors.logo,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        const img = tex.image;
        if (img) {
          setLogoAspect(img.width / img.height);
        }
        setLogoTexture(tex);
      },
      undefined,
      (err) => {
        console.error("Error loading logo texture:", err);
      },
    );
  }, [colors.logo]);

  const logoParams = useMemo(() => {
    if (!logoTexture) return null;
    const size = colors.logoSize || 0.15;
    const aspect = logoAspect || 1.0;

    switch (colors.logoPosition) {
      case "Left Chest":
        return {
          position: [0.062, 0.16, 0.138] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [size * aspect * 0.75, size * 0.75, 0.2] as [
            number,
            number,
            number,
          ],
        };
      case "Right Chest":
        return {
          position: [-0.062, 0.16, 0.138] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [size * aspect * 0.75, size * 0.75, 0.2] as [
            number,
            number,
            number,
          ],
        };
      case "Center":
        return {
          position: [0.0, 0.08, 0.15] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [size * aspect * 1.3, size * 1.3, 0.2] as [
            number,
            number,
            number,
          ],
        };
      case "Back Top":
        return {
          position: [0.0, 0.23, -0.135] as [number, number, number],
          rotation: [0, Math.PI, 0] as [number, number, number],
          scale: [size * aspect * 0.9, size * 0.9, 0.2] as [
            number,
            number,
            number,
          ],
        };
      case "Back Center":
        return {
          position: [0.0, 0.05, -0.15] as [number, number, number],
          rotation: [0, Math.PI, 0] as [number, number, number],
          scale: [size * aspect * 1.3, size * 1.3, 0.2] as [
            number,
            number,
            number,
          ],
        };
      case "Sleeve":
        return {
          position: [0.22, 0.16, 0.0] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number],
          scale: [size * aspect, size, 0.2] as [number, number, number],
        };
      default:
        return null;
    }
  }, [logoTexture, logoAspect, colors.logoPosition, colors.logoSize]);

  const roughness = colors.fabric === "Premium" ? 0.3 : 0.72;

  const shirtMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: colors.primary,
      roughness,
      metalness: 0.06,
      envMapIntensity: 1.2,
    });
  }, [roughness, colors.primary]);

  return (
    <group scale={[2.2, 2.2, 2.2]} position={[0, -0.1, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMat}
        dispose={null}
      >
        {/* ── Full-body pattern decals (rendered first, underneath text) ── */}
        {patternFront && (
          <Decal
            position={[0, 0.0, 0.155]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.7, 0.32]}
          >
            <meshStandardMaterial
              map={patternFront}
              transparent
              alphaTest={0.01}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-3}
              roughness={roughness}
              envMapIntensity={1.0}
            />
          </Decal>
        )}
        {patternBack && (
          <Decal
            position={[0, 0.0, -0.155]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.7, 0.32]}
          >
            <meshStandardMaterial
              map={patternBack}
              transparent
              alphaTest={0.01}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-3}
              roughness={roughness}
              envMapIntensity={1.0}
            />
          </Decal>
        )}

        {/* ── Text / number decals (on top of pattern) ── */}
        {front && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={[0.26, 0.26, 0.25]}
          >
            <meshStandardMaterial
              map={front}
              transparent
              alphaTest={0.02}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              roughness={roughness}
              envMapIntensity={1.0}
            />
          </Decal>
        )}
        {back && (
          <Decal
            position={[0, 0.04, -0.15]}
            rotation={[0, Math.PI, 0]}
            scale={[0.28, 0.28, 0.25]}
          >
            <meshStandardMaterial
              map={back}
              transparent
              alphaTest={0.02}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              roughness={roughness}
              envMapIntensity={1.0}
            />
          </Decal>
        )}
        {logoTexture && logoParams && (
          <Decal
            position={logoParams.position}
            rotation={logoParams.rotation}
            scale={logoParams.scale}
          >
            <meshStandardMaterial
              map={logoTexture}
              transparent
              alphaTest={0.002}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-8}
              roughness={roughness}
              envMapIntensity={1.0}
            />
          </Decal>
        )}
      </mesh>
    </group>
  );
}

// ─── Jersey SVG Thumbnails ──────────────────────────────────────────────────
function JerseySVG({
  primary = "#2196F3",
  secondary = "#1A1A2E",
  pattern = "plain",
  selected = false,
}: {
  primary?: string;
  secondary?: string;
  pattern?: string;
  selected?: boolean;
}) {
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
        <line
          x1="0"
          y1="25"
          x2="100"
          y2="25"
          stroke={secondary}
          strokeWidth="4"
        />
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke={secondary}
          strokeWidth="4"
        />
        <line
          x1="0"
          y1="75"
          x2="100"
          y2="75"
          stroke={secondary}
          strokeWidth="4"
        />
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
          d="M0,0 Q25,40 50,10 Q75,40 100,0 L100,50 Q75,80 50,55 Q25,80 0,50 Z"
          fill={secondary}
        />
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
        <rect
          x="50"
          y="0"
          width="50"
          height="100"
          fill={primary}
          opacity="0.3"
        />
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
        stroke={selected ? "#E63946" : "rgba(0,0,0,0.18)"}
        strokeWidth={selected ? 3 : 1.5}
      />
    </svg>
  );
}

// ─── Design Templates ───────────────────────────────────────────────────────
const JERSEY_DESIGNS = [
  { id: "throw", label: "Throw", pattern: "plain" },
  { id: "strike", label: "Strike", pattern: "strike" },
  { id: "save", label: "Save", pattern: "save" },
  { id: "fastbreak", label: "Fast Break", pattern: "fastbreak" },
  { id: "final", label: "Final", pattern: "final" },
  { id: "victory", label: "Victory", pattern: "victory" },
  { id: "city", label: "City", pattern: "city" },
  { id: "pure", label: "Pure", pattern: "pure" },
  { id: "level", label: "Level", pattern: "level" },
  { id: "vivo", label: "Vivo", pattern: "vivo" },
  { id: "orion", label: "Orion", pattern: "orion" },
  { id: "animal", label: "Animal", pattern: "animal" },
  { id: "avatar", label: "Avatar", pattern: "avatar" },
  { id: "league", label: "League", pattern: "league" },
  { id: "magic", label: "Magic", pattern: "magic" },
  { id: "raid", label: "Raid", pattern: "raid" },
  { id: "rush", label: "Rush", pattern: "rush" },
  { id: "score", label: "Score", pattern: "score" },
];

// ─── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${value ? "bg-zinc-900" : "bg-zinc-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Sidebar Tabs ───────────────────────────────────────────────────────────
const TABS = [
  { id: "designs", icon: LayoutTemplate, label: "Designs" },
  { id: "colors", icon: Palette, label: "Colors" },
  { id: "patterns", icon: Grid, label: "Patterns" },
  { id: "text", icon: Type, label: "Text" },
  { id: "logos", icon: ImageIcon, label: "Logos" },
  { id: "style", icon: Scissors, label: "Style" },
  { id: "fabric", icon: Box, label: "Fabric" },
  { id: "ai", icon: Sparkles, label: "AI Magic" },
];

// ─── View Handler ───────────────────────────────────────────────────────────
function ViewHandler({ currentView }: { currentView: string }) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    let shouldUpdate = false;
    if (currentView === "front") {
      camera.position.set(0, 0.1, 4);
      shouldUpdate = true;
    } else if (currentView === "back") {
      camera.position.set(0, 0.1, -4);
      shouldUpdate = true;
    } else if (currentView === "sleeves") {
      camera.position.set(4, 0.1, 0); // Side view
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      controlsRef.current.target.set(0, 0.1, 0);
      controlsRef.current.update();
    }
  }, [currentView, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI * 0.75}
      minDistance={2.5}
      maxDistance={7}
      autoRotate={currentView === "360"}
      autoRotateSpeed={5}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CustomizerLayout() {
  const [activeTab, setActiveTab] = useState("designs");
  const [qty, setQty] = useState(1);
  const [selectedDesign, setSelectedDesign] = useState("throw");
  const [currentView, setCurrentView] = useState("360");
  const [uploadedLogos, setUploadedLogos] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("jersey_uploaded_logos");
    if (saved) {
      try {
        setUploadedLogos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [activePatternSide, setActivePatternSide] = useState<"Front" | "Back">(
    "Front",
  );
  const [state, setState] = useState({
    primary: "#2196F3",
    secondary: "#1A1A2E",
    designColor: "#1A1A2E",
    pattern: "None",
    fabricPatternFront: "None",
    fabricPatternBack: "None",
    frontText: "VALKYRIE",
    frontFont: "Bold",
    frontTextColor: "#FFFFFF",
    frontTextSize: 110,
    backText: "PLAYER",
    backFont: "Bold",
    backTextColor: "#FFFFFF",
    backTextSize: 80,
    number: "10",
    numberFont: "Bold",
    numberColor: "#111111",
    numberPosition: "Both",
    sleeve: "Short",
    fabric: "Polyester",
    collar: true,
    zipper: false,
    designSide: "Both",
    logo: null as string | null,
    logoPosition: "Left Chest",
    logoSize: 0.15,
    logoPosX: 0.065,
    logoPosY: 0.16,
    logoPosZ: 0.15,
    logoRotX: 0,
    logoRotY: 0,
    logoRotZ: 0,
    logoInteractive: true,
  });

  const updateState = (key: string, value: any) =>
    setState((s) => ({ ...s, [key]: value }));

  const setLogoPositionPreset = (pos: string) => {
    let x = 0.065,
      y = 0.16,
      z = 0.15;
    let rx = 0,
      ry = 0,
      rz = 0;

    switch (pos) {
      case "Left Chest":
        x = 0.065;
        y = 0.16;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Right Chest":
        x = -0.065;
        y = 0.16;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Center":
        x = 0.0;
        y = 0.08;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Back Top":
        x = 0.0;
        y = 0.23;
        z = -0.15;
        rx = 0;
        ry = Math.PI;
        rz = 0;
        break;
      case "Back Center":
        x = 0.0;
        y = 0.05;
        z = -0.15;
        rx = 0;
        ry = Math.PI;
        rz = 0;
        break;
      case "Sleeve":
        x = 0.22;
        y = 0.16;
        z = 0.0;
        rx = 0;
        ry = Math.PI / 2;
        rz = 0;
        break;
    }

    setState((s) => ({
      ...s,
      logoPosition: pos,
      logoPosX: x,
      logoPosY: y,
      logoPosZ: z,
      logoRotX: rx,
      logoRotY: ry,
      logoRotZ: rz,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateState("logo", dataUrl);
      setUploadedLogos((prev) => {
        const next = [dataUrl, ...prev.filter((item) => item !== dataUrl)].slice(0, 12);
        localStorage.setItem("jersey_uploaded_logos", JSON.stringify(next));
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const calculatePrice = () => {
    let base = 49;
    if (qty >= 10 && qty < 50) base = 39;
    if (qty >= 50) base = 29;
    if (state.fabric === "Premium") base += 10;
    return base * qty;
  };

  const currentPattern =
    JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.pattern ?? "plain";

  return (
    <div className="flex h-screen w-full bg-white flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200">
        <Link href="/" className="text-zinc-600">
          <ChevronLeft />
        </Link>
        <div className="font-bold">Jersey Builder</div>
      </div>

      {/* ── Icon Sidebar ── */}
      <div className="hidden md:flex w-20 flex-col items-center bg-white border-r border-zinc-200 py-6 gap-4 z-20 overflow-y-auto">
        <Link href="/" className="mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:bg-black transition-colors">
            V
          </div>
        </Link>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all w-16 ${activeTab === tab.id ? "bg-zinc-100 text-red-600" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"}`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold leading-tight text-center">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Settings Panel ── */}
      <div className="w-full md:w-80 bg-white border-r border-zinc-200 flex flex-col h-full z-10 shadow-lg">
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/60">
          <h2 className="text-lg font-bold text-zinc-900 capitalize">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Customize your jersey</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              {/* ── DESIGNS TAB ── */}
              {activeTab === "designs" && (
                <div className="space-y-5">
                  {/* Collar toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                    <span className="text-sm font-semibold text-zinc-800">
                      Add Collar
                    </span>
                    <Toggle
                      value={state.collar}
                      onChange={(v) => updateState("collar", v)}
                    />
                  </div>
                  {/* Zipper toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                    <span className="text-sm font-semibold text-zinc-800">
                      Add Zipper
                    </span>
                    <Toggle
                      value={state.zipper}
                      onChange={(v) => updateState("zipper", v)}
                    />
                  </div>

                  {/* Grid of designs */}
                  <div className="grid grid-cols-4 gap-3 pt-1">
                    {JERSEY_DESIGNS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDesign(d.id)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                          selectedDesign === d.id
                            ? "bg-red-50 ring-2 ring-red-500"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="w-14 h-14">
                          <JerseySVG
                            primary={state.primary}
                            secondary={
                              selectedDesign === d.id
                                ? state.designColor || state.secondary
                                : state.secondary
                            }
                            pattern={d.pattern}
                            selected={selectedDesign === d.id}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-bold leading-tight text-center ${selectedDesign === d.id ? "text-red-600" : "text-zinc-500"}`}
                        >
                          {d.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Design Side: Front / Back / Both & Shape Color Customization */}
                  {selectedDesign !== "throw" && (
                    <div className="pt-2 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                          Apply To
                        </label>
                        <div className="flex gap-2">
                          {["Front", "Back", "Both"].map((side) => (
                            <button
                              key={side}
                              onClick={() => updateState("designSide", side)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                state.designSide === side
                                  ? "border-red-500 bg-red-50 text-red-600"
                                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                              }`}
                            >
                              {side}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                          Design Color
                        </label>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {[
                            "#1A1A2E",
                            "#FFFFFF",
                            "#E63946",
                            "#2196F3",
                            "#FFD166",
                            "#06D6A0",
                            "#111111",
                            "#8D99AE",
                            "#FF5E7E",
                            "#7B2CBF",
                          ].map((c) => (
                            <button
                              key={c}
                              onClick={() => updateState("designColor", c)}
                              className={`w-7 h-7 rounded-full border transition-transform ${
                                state.designColor === c
                                  ? "border-zinc-950 scale-110 ring-1 ring-offset-1 ring-zinc-400"
                                  : "border-black/10 hover:scale-105"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={state.designColor || "#1A1A2E"}
                            onChange={(e) =>
                              updateState("designColor", e.target.value)
                            }
                            className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
                          />
                          <span className="text-xs text-zinc-500 font-mono">
                            {(state.designColor || "#1A1A2E").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── COLORS TAB ── */}
              {activeTab === "colors" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-3 block">
                      Primary Color
                    </label>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {[
                        "#E63946",
                        "#2196F3",
                        "#111111",
                        "#FFFFFF",
                        "#457B9D",
                        "#2A9D8F",
                        "#F4A261",
                        "#6C63FF",
                        "#FF6B6B",
                        "#43AA8B",
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateState("primary", c)}
                          className={`w-9 h-9 rounded-full border-2 transition-transform ${state.primary === c ? "border-zinc-900 scale-110 ring-2 ring-offset-1 ring-zinc-400" : "border-black/10 hover:scale-105"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="color"
                        value={state.primary}
                        onChange={(e) => updateState("primary", e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border border-zinc-200"
                      />
                      <span className="text-xs text-zinc-500 font-mono">
                        {state.primary.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PATTERNS TAB ── */}
              {activeTab === "patterns" && (
                <div className="space-y-4">
                  {/* Pattern Side Selector */}
                  <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl">
                    <button
                      onClick={() => setActivePatternSide("Front")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
                        activePatternSide === "Front"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Front Side
                    </button>
                    <button
                      onClick={() => setActivePatternSide("Back")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
                        activePatternSide === "Back"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Back Side
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      { id: "None", label: "Solid Color" },
                      { id: "Lightning", label: "Lightning" },
                      { id: "Stripes", label: "Stripes" },
                      { id: "Abstract", label: "Abstract Wave" },
                      { id: "Geometric", label: "Hex Grid" },
                      { id: "Camouflage", label: "Camouflage" },
                      { id: "Minimal", label: "Minimalist" },
                      { id: "Diagonal", label: "Diagonal" },
                      { id: "Gradient", label: "Soft Gradient" },
                      { id: "Diamond", label: "Diamond Facet" },
                    ].map((p) => {
                      const isSelected =
                        activePatternSide === "Front"
                          ? state.fabricPatternFront === p.id
                          : state.fabricPatternBack === p.id;

                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            updateState(
                              activePatternSide === "Front"
                                ? "fabricPatternFront"
                                : "fabricPatternBack",
                              p.id,
                            )
                          }
                          className={`flex flex-col p-2.5 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-red-500 bg-red-50/50"
                              : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="w-full h-20 rounded-lg overflow-hidden mb-2 bg-zinc-100 border border-zinc-200/50 flex items-center justify-center">
                            <MiniPatternSVG
                              pattern={p.id}
                              primary={state.primary}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-bold ${
                              isSelected ? "text-red-700" : "text-zinc-700"
                            }`}
                          >
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── TEXT TAB ── */}
              {activeTab === "text" && (
                <div className="space-y-6">
                  {/* ── Front Side Section ── */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-2">
                      Front Side
                    </h3>
                    <div>
                      <input
                        type="text"
                        value={state.frontText}
                        onChange={(e) =>
                          updateState("frontText", e.target.value)
                        }
                        className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Front Text..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Font Style
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          "Bold",
                          "Italic",
                          "Script",
                          "Block",
                          "Outline",
                          "Varsity",
                        ].map((f) => (
                          <button
                            key={f}
                            onClick={() => updateState("frontFont", f)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.frontFont === f ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Text Color
                      </label>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {[
                          "#FFFFFF",
                          "#111111",
                          "#E63946",
                          "#2196F3",
                          "#FFD700",
                          "#2A9D8F",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => updateState("frontTextColor", c)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${state.frontTextColor === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <div className="w-1px h-4 bg-zinc-300 mx-1"></div>
                        <input
                          type="color"
                          value={state.frontTextColor}
                          onChange={(e) =>
                            updateState("frontTextColor", e.target.value)
                          }
                          className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 flex justify-between">
                        <span>Text Size</span>
                        <span className="text-zinc-500">
                          {state.frontTextSize}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="40"
                        max="250"
                        value={state.frontTextSize}
                        onChange={(e) =>
                          updateState("frontTextSize", parseInt(e.target.value))
                        }
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>

                  {/* ── Back Side Section ── */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-2">
                      Back Side
                    </h3>
                    <div>
                      <input
                        type="text"
                        value={state.backText}
                        onChange={(e) =>
                          updateState("backText", e.target.value)
                        }
                        className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Back Text..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Font Style
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          "Bold",
                          "Italic",
                          "Script",
                          "Block",
                          "Outline",
                          "Varsity",
                        ].map((f) => (
                          <button
                            key={f}
                            onClick={() => updateState("backFont", f)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.backFont === f ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Text Color
                      </label>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {[
                          "#FFFFFF",
                          "#111111",
                          "#E63946",
                          "#2196F3",
                          "#FFD700",
                          "#2A9D8F",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => updateState("backTextColor", c)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${state.backTextColor === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <div className="w-1px h-4 bg-zinc-300 mx-1"></div>
                        <input
                          type="color"
                          value={state.backTextColor}
                          onChange={(e) =>
                            updateState("backTextColor", e.target.value)
                          }
                          className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 flex justify-between">
                        <span>Text Size</span>
                        <span className="text-zinc-500">
                          {state.backTextSize}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="40"
                        max="250"
                        value={state.backTextSize}
                        onChange={(e) =>
                          updateState("backTextSize", parseInt(e.target.value))
                        }
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>

                  {/* ── Player Number Section ── */}
                  <div className="space-y-4 pt-4 border-t border-zinc-100">
                    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-2">
                      Player Number
                    </h3>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={state.number}
                        onChange={(e) => updateState("number", e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-bold text-2xl text-center focus:outline-none focus:border-red-500"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Number Font
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          "Bold",
                          "Block",
                          "Varsity",
                          "Outline",
                          "College",
                          "Athletic",
                        ].map((f) => (
                          <button
                            key={f}
                            onClick={() => updateState("numberFont", f)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.numberFont === f ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Number Color
                      </label>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {[
                          "#FFFFFF",
                          "#111111",
                          "#E63946",
                          "#FFD700",
                          "#2196F3",
                          "#2A9D8F",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => updateState("numberColor", c)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${state.numberColor === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <div className="w-[1px] h-4 bg-zinc-300 mx-1"></div>
                        <input
                          type="color"
                          value={state.numberColor}
                          onChange={(e) =>
                            updateState("numberColor", e.target.value)
                          }
                          className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                        Number Position
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Front", "Back", "Both"].map((p) => (
                          <button
                            key={p}
                            onClick={() => updateState("numberPosition", p)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.numberPosition === p ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── LOGOS TAB ── */}
              {activeTab === "logos" && (
                <div className="space-y-5">
                  <input
                    id="logo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {/* Upload Container */}
                  {!state.logo ? (
                    <div
                      onClick={() =>
                        document.getElementById("logo-upload-input")?.click()
                      }
                      className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-red-400 cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-bold">Upload Logo</span>
                      <span className="text-xs mt-1">PNG, SVG up to 5MB</span>
                    </div>
                  ) : (
                    <div className="border border-zinc-200 bg-zinc-50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-zinc-200/80 overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={state.logo}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-800 block">
                            Custom Logo
                          </span>
                          <button
                            onClick={() =>
                              document
                                .getElementById("logo-upload-input")
                                ?.click()
                            }
                            className="text-[10px] text-zinc-500 hover:text-red-500 font-bold underline mr-2"
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => updateState("logo", null)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-white rounded-lg border border-zinc-100 hover:border-zinc-200 shadow-sm transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Presets Grid */}
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-2 block">
                      Preset Badges
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          name: "Valkyrie",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSI1MCwxMCA5MCwzMCA5MCw3MCA1MCw5NSAxMCw3MCAxMCwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmYzMzY2IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNNTAsMjAgTDc1LDQ1IEw2MCw0NSBMNTAsMzAgTDQwLDQ1IEwyNSw0NSBaIiBmaWxsPSIjZmYzMzY2Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI2NSIgcj0iMTIiIGZpbGw9IiNmZjMzNjYiLz4vPjwvc3ZnPg==",
                        },
                        {
                          name: "Gold Tiger",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwLDIwIFE1MCwwIDgwLDIwIEw4MCw1MCBMNTAsOTAgTDIwLDUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmY2MwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTM1LDM1IFE1MCwyMCA2NSwzNSBNMzAsNTAgUTUwLDQwIDcwLDUwIE00NSw2NSBMNTAsNzUgTDU1LDY1IiBzdHJva2U9IiNmZmNjMDAiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==",
                        },
                        {
                          name: "Blue Shield",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwLDEwIEw4NSwyMCBMODUsNjAgQzg1LDgwIDUwLDk1IDUwLDk1IEM1MCw5NSAxNSw4MCAxNSw2MCBMMTUsMjAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2Y1MWI1IiBzdHJva2Utd2lkdGg9IjYiLz4gPGNpcmNsZSBjeD0iNTAiIGN5PSI0NSIgcj0iMTUiIGZpbGw9IiMzZjUxYjUiLz48cGF0aCBkPSJNNDAsNjUgTDUwLDU1IEw2MCw2NSIgc3Ryb2tlPSIjM2Y1MWI1IiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=",
                        },
                        {
                          name: "Red Phoenix",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSI1MCw1IDk1LDI4IDk1LDcyIDUwLDk1IDUsNzIgNSwyOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTUzZTNlIiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNNTAsMjUgQzY1LDI1IDc1LDM1IDcwLDU1IEM2NSw0NSA1NSw0NSA1MCw1MCBDNDUsNDUgMzUsNDUgMzAsNTUgQzI1LDM1IDM1LDI1IDUwLDI1IFoiIGZpbGw9IiNlNTNlM2UiLz48cG9seWdvbiBwb2ludHM9IjUwLDU1IDYwLDcwIDUwLDY1IDQwLDcwIiBmaWxsPSIjZTUzZTNlIi8+PC9zdmc+",
                        },
                        {
                          name: "Neon Light",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM5ZmYxNCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBvbHlnb24gcG9pbnRzPSI1NSwxOCAyOCw1MiA0OCw1MiA0Miw4MiA3Miw0OCA1Miw0OCIgZmlsbD0iIzM5ZmYxNCIvPjwvc3ZnPg==",
                        },
                        {
                          name: "Iron Crown",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwLDkwIEw5MCw2NSBMOTAsMjAgTDUwLDEwIEwxMCwyMCBMMTAsNjUgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTg1NWY3IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNMjUsNjUgTDMyLDQwIEw0NSw1NSBMNTAsMzAgTDU1LDU1IEw2OCw0MCBMNzUsNjUgWiIgZmlsbD0iI2E4NTVmNyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjYiIGZpbGw9IiNhODU1ZjciLz48L3N2Zz4=",
                        },
                        {
                          name: "Green Cobra",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSI1MCwxMCA4NSwzMCA3NSw4MCA1MCw5NSAyNSw4MCAxNSwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNNTAsMjIgQzQwLDIyIDMyLDMwIDMyLDQwIEMzMiw1NSA1MCw3NSA1MCw3NSBDNTAsNzUgNjgsNTUgNjgsNDAgQzY4LDMwIDYwLDIyIDUwLDIyIFogTTUwLDMyIEM1MywzMiA1NSwzNCA1NSwzNyBDNTUsNDAgNTAsNDUgNTAsNDUgQzUwLDk1IDQ1LDQwIDQ1LDM3IEM0NSwzNCA0NywzMiA1MCwzMiBaIiBmaWxsPSIjMTBiOTgxIi8+PC9zdmc+",
                        },
                        {
                          name: "Cyber Star",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y0M2Y1ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSI4IDYiLz48cG9seWdvbiBwb2ludHM9IjUwLDE1IDYxLDM4IDg2LDQwIDY3LDU3IDczLDgyIDUwLDY4IDI3LDgyIDMzLDU3IDI0LDQwIDM5LDM4IiBmaWxsPSIjZjQzZjVlIi8+PC9zdmc+",
                        },
                        {
                          name: "Ocean Anchor",
                          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBlYTVlOSIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTUwLDE4IEw1MCw2OCBNMzIsNDggTDY4LDQ4IE01MCwxOCBBNiw2IDAgMSwxIDUwLDMwIEE2LDYgMCAxLDEgNTAsMTggTTMwLDU1IEEyMCwyMCAwIDAsMCA3MCw1NSBNMzgwLDUyIEwyNiw1NyBNNzAsNTIgTDc0LDU3IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZWE1ZTkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+",
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => updateState("logo", state.logo === preset.url ? null : preset.url)}
                          className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all bg-white ${
                            state.logo === preset.url
                              ? "border-red-500 bg-red-50/20 shadow-sm"
                              : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[9px] font-bold text-zinc-500">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* My Uploads Gallery */}
                  {uploadedLogos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-zinc-900">
                          My Uploaded Badges
                        </label>
                        <button
                          onClick={() => {
                            setUploadedLogos([]);
                            localStorage.removeItem("jersey_uploaded_logos");
                          }}
                          className="text-[10px] text-zinc-400 hover:text-red-500 font-bold transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedLogos.map((url, index) => {
                          const isSelected = state.logo === url;
                          return (
                            <div
                              key={index}
                              onClick={() => updateState("logo", state.logo === url ? null : url)}
                              className={`relative aspect-square rounded-xl border flex items-center justify-center p-2 transition-all bg-white cursor-pointer group hover:shadow-md ${
                                isSelected
                                  ? "border-red-500 bg-red-50/10 shadow-sm"
                                  : "border-zinc-200 hover:border-zinc-300"
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Uploaded badge ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                              
                              {/* Top Left Selection Marker */}
                              <div
                                className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-red-500 border-red-500 text-white"
                                    : "bg-white border-zinc-300 opacity-60 group-hover:opacity-100"
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>

                              {/* Top Right Options/Delete Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedLogos((prev) => {
                                    const next = prev.filter((item) => item !== url);
                                    localStorage.setItem("jersey_uploaded_logos", JSON.stringify(next));
                                    return next;
                                  });
                                  if (isSelected) {
                                    updateState("logo", null);
                                  }
                                }}
                                className="absolute top-1.5 right-1.5 w-5 h-5 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full border border-zinc-200 shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Logo Position */}
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-2 block">
                      Logo Position
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "Left Chest",
                        "Center",
                        "Right Chest",
                        "Back Top",
                        "Back Center",
                        "Sleeve",
                      ].map((p) => (
                        <button
                          key={p}
                          onClick={() => setLogoPositionPreset(p)}
                          className={`p-2 rounded-lg border text-[10px] font-bold transition-all leading-tight text-center ${
                            state.logoPosition === p
                              ? "border-red-500 bg-red-50 text-red-600 font-extrabold shadow-sm"
                              : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Size */}
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-2 block">
                      Logo Size
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.30"
                      step="0.01"
                      value={state.logoSize}
                      onChange={(e) =>
                        updateState("logoSize", parseFloat(e.target.value))
                      }
                      className="w-full accent-red-600"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 mt-1">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STYLE TAB ── */}
              {activeTab === "style" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-2 block">
                      Sleeves
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Short", "Long", "Sleeveless", "3/4"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateState("sleeve", s)}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all ${state.sleeve === s ? "border-red-500 bg-red-50 text-red-600" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-2 block">
                      Collar Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["V-Neck", "Round", "Polo", "Henley"].map((c) => (
                        <button
                          key={c}
                          className="p-3 rounded-xl border text-sm font-bold border-zinc-200 text-zinc-600 hover:border-red-400 hover:bg-red-50 transition-all"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-zinc-900 mb-2 block">
                      Cut & Fit
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Slim Fit", "Regular", "Relaxed"].map((f) => (
                        <button
                          key={f}
                          className="p-2.5 rounded-lg border text-xs font-bold border-zinc-200 text-zinc-600 hover:border-red-400 hover:bg-red-50 transition-all"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── FABRIC TAB ── */}
              {activeTab === "fabric" && (
                <div className="space-y-3">
                  {[
                    {
                      name: "Polyester",
                      desc: "Lightweight & durable",
                      extra: "",
                    },
                    { name: "Mesh", desc: "Max breathability", extra: "" },
                    { name: "Dry Fit", desc: "Moisture-wicking", extra: "" },
                    {
                      name: "Premium",
                      desc: "Pro-grade fabric",
                      extra: "+$10",
                    },
                    {
                      name: "Recycled",
                      desc: "Eco-friendly choice",
                      extra: "",
                    },
                  ].map((f) => (
                    <button
                      key={f.name}
                      onClick={() => updateState("fabric", f.name)}
                      className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${state.fabric === f.name ? "border-red-500 bg-red-50" : "border-zinc-200 hover:border-zinc-300"}`}
                    >
                      <div>
                        <div
                          className={`font-bold text-sm ${state.fabric === f.name ? "text-red-700" : "text-zinc-800"}`}
                        >
                          {f.name}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {f.desc}
                        </div>
                      </div>
                      {f.extra && (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          {f.extra}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── AI TAB ── */}
              {activeTab === "ai" && (
                <div className="space-y-4">
                  <div className="bg-linear-to-br from-purple-600 to-indigo-600 p-5 rounded-2xl text-white shadow-xl shadow-indigo-500/30">
                    <Wand2 className="w-7 h-7 mb-2" />
                    <h3 className="font-bold text-lg mb-1">AI Generator</h3>
                    <p className="text-xs text-white/80 mb-4">
                      Describe your team's vibe and let AI design the perfect
                      kit.
                    </p>
                    <textarea
                      placeholder="e.g. A futuristic cyber punk design with neon green accents..."
                      className="w-full bg-black/20 rounded-xl p-3 text-sm placeholder:text-white/50 border-none outline-none resize-none h-24"
                    />
                    <button className="w-full mt-3 bg-white text-indigo-600 font-bold py-2.5 rounded-xl shadow-sm hover:scale-[1.02] transition-transform text-sm">
                      ✨ Generate Design
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Quick Prompts
                    </p>
                    {[
                      "Fire team energy",
                      "Ocean blue wave",
                      "Midnight galaxy",
                      "Urban street style",
                    ].map((p) => (
                      <button
                        key={p}
                        className="w-full text-left px-4 py-2.5 rounded-xl bg-zinc-50 hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-300 text-sm font-medium text-zinc-700 transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <div
        className="flex-1 relative flex flex-col"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${state.primary}18 0%, #f0f0f0 65%)`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 z-10 pointer-events-none">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Design name badge */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-white/80 backdrop-blur-sm text-xs font-bold text-zinc-700 px-3 py-1.5 rounded-full shadow border border-zinc-200 capitalize">
            {JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.label ??
              "Custom"}{" "}
            Design
            {state.collar ? " • Collar" : ""}
            {state.zipper ? " • Zipper" : ""}
          </span>
        </div>

        <Canvas
          camera={{ position: [0, 0.1, 4], fov: 38 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
        >
          {/* Transparent background so parent div gradient shows through */}
          <color attach="background" args={["transparent" as any]} />
          <ambientLight intensity={1.1} />
          <Environment preset="apartment" />
          {/* Front key */}
          <directionalLight position={[1, 4, 5]} intensity={1.4} castShadow />
          {/* Back fill — critical for back side visibility */}
          <directionalLight position={[-1, 3, -5]} intensity={1.1} />
          {/* Accent rim using primary color tint */}
          <pointLight position={[-3, 1, 2]} intensity={0.8} />
          <pointLight position={[3, 1, -2]} intensity={0.5} />
          <Center>
            <Jersey3D
              colors={{ ...state, designPattern: currentPattern }}
              collar={state.collar}
            />
          </Center>
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.3}
            scale={8}
            blur={3}
          />
          <ViewHandler currentView={currentView} />
        </Canvas>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-black/5">
          <button
            onClick={() => setCurrentView("360")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "360" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            360° View
          </button>
          <button
            onClick={() => setCurrentView("front")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "front" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            Front
          </button>
          <button
            onClick={() => setCurrentView("back")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "back" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            Back
          </button>
          <button
            onClick={() => setCurrentView("sleeves")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "sleeves" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            Sleeves
          </button>
        </div>
      </div>

      {/* ── Right Pricing Panel ── */}
      <div className="w-full md:w-72 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-5 border-b border-zinc-200 flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold text-zinc-900 mb-5">
            Order Summary
          </h2>

          {/* Live preview thumbnail */}
          <div className="w-24 h-24 mx-auto mb-4">
            <JerseySVG
              primary={state.primary}
              secondary={state.designColor || state.secondary}
              pattern={currentPattern}
              selected={false}
            />
          </div>
          <p className="text-center text-xs font-bold text-zinc-500 mb-5 capitalize">
            {JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.label} ·{" "}
            {state.sleeve} Sleeve
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Base Jersey</span>
              <span className="font-bold text-zinc-900">
                ${qty >= 10 ? (qty >= 50 ? "29" : "39") : "49"}
              </span>
            </div>
            {state.fabric === "Premium" && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Premium Fabric</span>
                <span className="font-bold text-zinc-900">+$10</span>
              </div>
            )}
            {state.collar && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Collar</span>
                <span className="font-bold text-zinc-900">Included</span>
              </div>
            )}
            {state.zipper && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Zipper</span>
                <span className="font-bold text-zinc-900">+$5</span>
              </div>
            )}

            <div className="border-t border-zinc-100 pt-4">
              <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full border border-zinc-200 rounded-xl p-2.5 text-center font-bold focus:outline-red-500 text-lg"
              />
              <div className="text-[11px] text-green-600 mt-2 font-semibold text-center">
                {qty >= 50
                  ? "🎉 50+ Bulk discount applied!"
                  : qty >= 10
                    ? `Team discount! Add ${50 - qty} more for bulk rate.`
                    : `Add ${10 - qty} more for team discount.`}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-zinc-600">Total</span>
            <span className="text-3xl font-extrabold text-zinc-900">
              ${calculatePrice() + (state.zipper ? 5 * qty : 0)}
            </span>
          </div>
          <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm">
            <ShoppingCart className="w-5 h-5" /> Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
