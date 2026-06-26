"use client";

import React, { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, Decal } from "@react-three/drei";
import { CustomizerState, JERSEY_DESIGNS, getFontFamily, LogoLayer } from "./types";

// ─── Normal Map Generators ──────────────────────────────────────────────────
function createMeshNormalMap() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const hexVal = (Math.round(x / 4) + Math.round(y / 4)) % 2;

      let nx = 128;
      let ny = 128;

      if (hexVal === 0) {
        nx = 110;
        ny = 110;
      } else {
        nx = 146;
        ny = 146;
      }

      data[idx] = nx;
      data[idx + 1] = ny;
      data[idx + 2] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(40, 40);
  return texture;
}

function createFlexNormalMap() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const lineVal = Math.round(y / 2) % 2;

      let nx = 128;
      let ny = 128;

      if (lineVal === 0) {
        ny = 118;
      } else {
        ny = 138;
      }

      data[idx] = nx;
      data[idx + 1] = ny;
      data[idx + 2] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(65, 65);
  return texture;
}

// ─── Style Decals Hook ──────────────────────────────────────────────────────
function useStyleDecals(colors: any) {
  return useMemo(() => {
    if (!colors?.collar || !colors?.collarType || colors.collarType === "None")
      return { collarDecal: null };

    // Treat any model other than the standard flat T-Shirt as a physical 3D model to suppress faux collar band/flaps
    const isCollarModel = colors?.glbModel !== "/models/shirt_baked.glb";
    if (isCollarModel) {
      // For collar model, do not project faux Round/V-Neck lines,
      // and do not draw any placket/buttons if no closure is selected.
      if (
        colors.collarType === "Round" ||
        colors.collarType === "V-Neck" ||
        colors.zipper === null ||
        colors.zipper === undefined
      ) {
        return { collarDecal: null };
      }
    }

    const S = 1024;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const ctx = cv.getContext("2d");
    if (!ctx) return { collarDecal: null };
    ctx.clearRect(0, 0, S, S);

    const placketBase = colors.primaryFront || colors.primary || "#2196F3";
    const trim = colors.designColor || colors.secondary || "#1A1A2E";

    const hexRgb = (h: string) => {
      const c = parseInt(h.replace("#", ""), 16);
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    };
    const lighten = (h: string, amt: number) => {
      const [r, g, b] = hexRgb(h);
      return `rgba(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)},1)`;
    };
    const darken = (h: string, amt: number) => {
      const [r, g, b] = hexRgb(h);
      return `rgba(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)},1)`;
    };

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawPlacket = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.closePath();
    };

    const drawButtonhole = (cx: number, cy: number, length: number) => {
      ctx.save();
      // Draw inner slit
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - length / 2, cy);
      ctx.lineTo(cx + length / 2, cy);
      ctx.stroke();

      // Draw dense satin stitching border
      ctx.strokeStyle = darken(placketBase, 35);
      ctx.lineWidth = 2.0;
      ctx.setLineDash([2, 1]); // Dense stitch effect
      ctx.beginPath();
      ctx.moveTo(cx - length / 2, cy - 1);
      ctx.lineTo(cx + length / 2, cy - 1);
      ctx.moveTo(cx - length / 2, cy + 1);
      ctx.lineTo(cx + length / 2, cy + 1);
      ctx.stroke();
      ctx.restore();
    };

    const drawRealisticButton = (cx: number, cy: number, r: number) => {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      const btnGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      btnGrad.addColorStop(0, "#ffffff");
      btnGrad.addColorStop(0.7, "#eaeaea");
      btnGrad.addColorStop(1, "#c0c0c0");

      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      const innerR = r * 0.6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();

      const holeOffset = r * 0.25;
      const holeR = r * 0.08;
      const holes = [
        { x: cx - holeOffset, y: cy - holeOffset },
        { x: cx + holeOffset, y: cy - holeOffset },
        { x: cx - holeOffset, y: cy + holeOffset },
        { x: cx + holeOffset, y: cy + holeOffset },
      ];

      ctx.fillStyle = "#333333";
      holes.forEach((h) => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, holeR, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(cx - holeOffset, cy - holeOffset);
      ctx.lineTo(cx + holeOffset, cy + holeOffset);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + holeOffset, cy - holeOffset);
      ctx.lineTo(cx - holeOffset, cy + holeOffset);
      ctx.stroke();

      ctx.restore();
    };

    const drawPlacketClosure = (
      topY: number,
      botY: number,
      width: number,
      leftX: number,
      sliderY: number,
      buttonYFs: number[],
      curveOffset: number
    ) => {
      const R = isCollarModel ? 0.61 : 1.0;

      const w = width * R;
      const x = S * 0.5 - w / 2;
      const yTop = topY;
      const yBot = topY + (botY - topY) * R;
      const sY = topY + (sliderY - topY) * R;
      const cOffset = curveOffset * R;

      // 1. Placket Background
      const pkGrad = ctx.createLinearGradient(x, yTop, x + w, yTop);
      pkGrad.addColorStop(0, lighten(placketBase, 15));
      pkGrad.addColorStop(0.5, placketBase);
      pkGrad.addColorStop(1, darken(placketBase, 12));

      // Draw shadow under placket for 3D depth
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 8 * R;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4 * R;
      ctx.fillStyle = pkGrad;
      drawPlacket(x, yTop, w, yBot - yTop, S * 0.008 * R);
      ctx.fill();
      ctx.restore();

      // Border outline for placket structure
      ctx.strokeStyle = darken(placketBase, 25);
      ctx.lineWidth = 2.5 * R;
      drawPlacket(x, yTop, w, yBot - yTop, S * 0.008 * R);
      ctx.stroke();

      // Vertical overlap line down the middle (gives placket a realistic fabric fold)
      ctx.save();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 2.0 * R;
      ctx.beginPath();
      ctx.moveTo(S * 0.503, yTop);
      ctx.lineTo(S * 0.503, yBot - S * 0.005 * R);
      ctx.stroke();

      ctx.strokeStyle = darken(placketBase, 30);
      ctx.lineWidth = 1.2 * R;
      ctx.beginPath();
      ctx.moveTo(S * 0.505, yTop);
      ctx.lineTo(S * 0.505, yBot - S * 0.005 * R);
      ctx.stroke();
      ctx.restore();

      // Stitching on placket edges
      ctx.save();
      ctx.strokeStyle = darken(placketBase, 40);
      ctx.lineWidth = 2.0 * R;
      ctx.setLineDash([5 * R, 5 * R]);
      ctx.beginPath();
      // Left side stitching
      ctx.moveTo(x + S * 0.01 * R, yTop);
      ctx.lineTo(x + S * 0.01 * R, yBot - S * 0.01 * R);
      // Right side stitching
      ctx.moveTo(x + w - S * 0.01 * R, yTop);
      ctx.lineTo(x + w - S * 0.01 * R, yBot - S * 0.01 * R);
      // Bottom stitching
      ctx.moveTo(x + S * 0.01 * R, yBot - S * 0.01 * R);
      ctx.lineTo(x + w - S * 0.01 * R, yBot - S * 0.01 * R);
      ctx.stroke();
      ctx.restore();

      // Overlap stitching line
      ctx.save();
      ctx.strokeStyle = darken(placketBase, 40);
      ctx.lineWidth = 1.5 * R;
      ctx.setLineDash([4 * R, 4 * R]);
      ctx.beginPath();
      ctx.moveTo(S * 0.5 + S * 0.012 * R, yTop);
      ctx.lineTo(S * 0.5 + S * 0.012 * R, yBot - S * 0.01 * R);
      ctx.stroke();
      ctx.restore();

      // Reinforced bottom bar-tack (box-and-cross tack stitch)
      ctx.save();
      ctx.strokeStyle = darken(placketBase, 45);
      ctx.lineWidth = 2.0 * R;
      ctx.setLineDash([4 * R, 4 * R]);
      const boxH = S * 0.035 * R;
      ctx.strokeRect(x + S * 0.005 * R, yBot - boxH - S * 0.005 * R, w - S * 0.01 * R, boxH);
      ctx.beginPath();
      ctx.moveTo(x + S * 0.005 * R, yBot - boxH - S * 0.005 * R);
      ctx.lineTo(x + w - S * 0.005 * R, yBot - S * 0.005 * R);
      ctx.moveTo(x + w - S * 0.005 * R, yBot - boxH - S * 0.005 * R);
      ctx.lineTo(x + S * 0.005 * R, yBot - S * 0.005 * R);
      ctx.stroke();
      ctx.restore();

      if (colors.zipper) {
        // --- ZIPPER SHAPE ---
        const getLeftTapeX = (y: number) => {
          if (y >= sY) return S * 0.4925;
          const t = (sY - y) / (sY - yTop);
          return S * 0.4925 - t * t * cOffset;
        };

        const getRightTapeX = (y: number) => {
          if (y >= sY) return S * 0.5075;
          const t = (sY - y) / (sY - yTop);
          return S * 0.5075 + t * t * cOffset;
        };

        // Draw left tape polygon
        ctx.fillStyle = darken(placketBase, 20);
        ctx.beginPath();
        for (let y = yTop; y <= yBot - S * 0.01 * R; y += 4 * R) {
          const lx = getLeftTapeX(y);
          ctx.lineTo(lx - S * 0.008 * R, y);
        }
        for (let y = yBot - S * 0.01 * R; y >= yTop; y -= 4 * R) {
          const lx = getLeftTapeX(y);
          ctx.lineTo(lx + S * 0.008 * R, y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw left tape stitching
        ctx.strokeStyle = darken(placketBase, 35);
        ctx.lineWidth = 1.2 * R;
        ctx.setLineDash([3 * R, 3 * R]);
        ctx.beginPath();
        for (let y = yTop; y <= yBot - S * 0.01 * R; y += 4 * R) {
          const lx = getLeftTapeX(y);
          ctx.lineTo(lx - S * 0.005 * R, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw right tape polygon
        ctx.fillStyle = darken(placketBase, 20);
        ctx.beginPath();
        for (let y = yTop; y <= yBot - S * 0.01 * R; y += 4 * R) {
          const rx = getRightTapeX(y);
          ctx.lineTo(rx - S * 0.008 * R, y);
        }
        for (let y = yBot - S * 0.01 * R; y >= yTop; y -= 4 * R) {
          const rx = getRightTapeX(y);
          ctx.lineTo(rx + S * 0.008 * R, y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw right tape stitching
        ctx.strokeStyle = darken(placketBase, 35);
        ctx.lineWidth = 1.2 * R;
        ctx.setLineDash([3 * R, 3 * R]);
        ctx.beginPath();
        for (let y = yTop; y <= yBot - S * 0.01 * R; y += 4 * R) {
          const rx = getRightTapeX(y);
          ctx.lineTo(rx + S * 0.005 * R, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Dark track gap in center (only below slider)
        ctx.fillStyle = "#151515";
        ctx.fillRect(S * 0.5 - S * 0.003 * R, sY, S * 0.006 * R, yBot - S * 0.01 * R - sY);

        // Metallic zipper teeth
        const toothGrad = ctx.createLinearGradient(S * 0.49, 0, S * 0.51, 0);
        toothGrad.addColorStop(0, "#777777");
        toothGrad.addColorStop(0.3, "#f0f0f0");
        toothGrad.addColorStop(0.5, "#ffffff");
        toothGrad.addColorStop(0.7, "#bbbbbb");
        toothGrad.addColorStop(1, "#444444");

        const stepY = S * 0.0055 * R;
        ctx.fillStyle = toothGrad;
        for (let y = yTop; y <= yBot - S * 0.015 * R; y += stepY) {
          if (y >= sY) {
            // Closed teeth - interlocking
            // Left tooth
            ctx.fillRect(S * 0.5 - S * 0.009 * R, y, S * 0.009 * R, 2 * R);
            // Right tooth (offset by stepY / 2)
            if (y + stepY / 2 <= yBot - S * 0.015 * R) {
              ctx.fillRect(S * 0.5, y + stepY / 2, S * 0.009 * R, 2 * R);
            }
          } else {
            // Open teeth - separate on curved tapes
            const lx = getLeftTapeX(y);
            const rx = getRightTapeX(y);
            // Left tooth pointing inward
            ctx.fillRect(lx - 1, y, S * 0.008 * R, 1.8 * R);
            // Right tooth pointing inward
            ctx.fillRect(rx - S * 0.007 * R, y, S * 0.008 * R, 1.8 * R);
          }
        }

        // --- Slider & Pull Tab ---
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 6 * R;
        ctx.shadowOffsetX = 1 * R;
        ctx.shadowOffsetY = 3 * R;

        const sliderWidthTop = S * 0.032 * R;
        const sliderWidthBot = S * 0.024 * R;
        const sliderHeight = S * 0.042 * R;
        const sliderTopY = sY - S * 0.01 * R;

        // Draw slider body (wedge shape)
        ctx.fillStyle = toothGrad;
        ctx.beginPath();
        ctx.moveTo(S * 0.5 - sliderWidthTop / 2, sliderTopY);
        ctx.lineTo(S * 0.5 + sliderWidthTop / 2, sliderTopY);
        ctx.lineTo(S * 0.5 + sliderWidthBot / 2, sliderTopY + sliderHeight);
        ctx.lineTo(S * 0.5 - sliderWidthBot / 2, sliderTopY + sliderHeight);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5 * R;
        ctx.stroke();

        // Inner grooves
        ctx.strokeStyle = "#444444";
        ctx.lineWidth = 1.0 * R;
        ctx.beginPath();
        ctx.moveTo(S * 0.5 - sliderWidthTop / 4, sliderTopY + 2 * R);
        ctx.lineTo(S * 0.5 - sliderWidthBot / 4, sliderTopY + sliderHeight - 2 * R);
        ctx.moveTo(S * 0.5 + sliderWidthTop / 4, sliderTopY + 2 * R);
        ctx.lineTo(S * 0.5 + sliderWidthBot / 4, sliderTopY + sliderHeight - 2 * R);
        ctx.stroke();

        // Top crown loop for pull tab
        ctx.fillStyle = toothGrad;
        drawRoundRect(S * 0.5 - S * 0.009 * R, sliderTopY + S * 0.01 * R, S * 0.018 * R, S * 0.016 * R, 1 * R);
        ctx.fill();
        ctx.stroke();

        // Pull tab connector ring
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 2.0 * R;
        ctx.beginPath();
        ctx.arc(S * 0.5, sliderTopY + S * 0.018 * R, S * 0.005 * R, 0, Math.PI * 2);
        ctx.stroke();

        // Pull Tab body
        const tabWidth = S * 0.024 * R;
        const tabHeight = S * 0.065 * R;
        const tabX = S * 0.5 - tabWidth / 2;
        const tabY = sliderTopY + S * 0.024 * R;

        ctx.fillStyle = toothGrad;
        drawRoundRect(tabX, tabY, tabWidth, tabHeight, 2 * R);
        ctx.fill();
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1.8 * R;
        ctx.stroke();

        // Central slot inside pull tab
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        drawRoundRect(S * 0.5 - S * 0.007 * R, tabY + S * 0.02 * R, S * 0.014 * R, S * 0.035 * R, 1 * R);
        ctx.fill();
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 1.0 * R;
        ctx.stroke();

        // Subtle grip ridges
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.0 * R;
        ctx.beginPath();
        ctx.moveTo(tabX + 4 * R, tabY + S * 0.01 * R);
        ctx.lineTo(tabX + tabWidth - 4 * R, tabY + S * 0.01 * R);
        ctx.moveTo(tabX + 4 * R, tabY + S * 0.014 * R);
        ctx.lineTo(tabX + tabWidth - 4 * R, tabY + S * 0.014 * R);
        ctx.stroke();

        ctx.restore();
      } else {
        // --- BUTTONS SHAPE ---
        buttonYFs.forEach((yf) => {
          const cy = yTop + (S * yf - topY) * R;
          const cx = S * 0.5;

          // Buttonhole first
          drawButtonhole(cx, cy, S * 0.045 * R);

          // Button on top
          drawRealisticButton(cx, cy, S * 0.02 * R);
        });
      }
    };

    if (colors.collarType === "Round") {
      const grad = ctx.createLinearGradient(0, 0, 0, S * 0.22);
      grad.addColorStop(0, lighten(trim, 40));
      grad.addColorStop(0.5, trim);
      grad.addColorStop(1, darken(trim, 30));
      ctx.strokeStyle = grad;
      ctx.lineWidth = S * 0.085;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(S / 2, 0, S * 0.38, 0.08, Math.PI - 0.08);
      ctx.stroke();

      ctx.strokeStyle = darken(trim, 50);
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const r2 = S * 0.34 + i * S * 0.013;
        ctx.beginPath();
        ctx.arc(S / 2, 0, r2, 0.12, Math.PI - 0.12);
        ctx.stroke();
      }
    } else if (colors.collarType === "V-Neck") {
      const makeVLeg = (x1: number, y1: number, x2: number, y2: number) => {
        const lg = ctx.createLinearGradient(x1, y1, x2, y2);
        lg.addColorStop(0, lighten(trim, 35));
        lg.addColorStop(0.45, trim);
        lg.addColorStop(1, darken(trim, 25));
        ctx.strokeStyle = lg;
        ctx.lineWidth = S * 0.075;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };
      makeVLeg(S * 0.18, 0, S * 0.5, S * 0.52);
      makeVLeg(S * 0.82, 0, S * 0.5, S * 0.52);
    } else if (colors.collarType === "Polo") {
      const sliderYVal = isCollarModel ? S * 0.52 : S * 0.42;
      const buttonYFs = isCollarModel ? [0.53, 0.62] : [0.48, 0.58];
      drawPlacketClosure(S * 0.34, S * 0.68, S * 0.08, S * 0.46, sliderYVal, buttonYFs, S * 0.024);
    } else if (colors.collarType === "Henley") {
      const sliderYVal = isCollarModel ? S * 0.54 : S * 0.47;
      const buttonYFs = isCollarModel ? [0.56, 0.65] : [0.51, 0.61];
      drawPlacketClosure(S * 0.28, S * 0.70, S * 0.12, S * 0.44, sliderYVal, buttonYFs, S * 0.035);
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return { collarDecal: tex };
  }, [
    colors?.collar,
    colors?.collarType,
    colors?.zipper,
    colors?.designColor,
    colors?.secondary,
    colors?.primary,
    colors?.glbModel,
  ]);
}

// ─── Jersey Decals Hook ─────────────────────────────────────────────────────
function useJerseyDecals(state: any) {
  return useMemo(() => {
    const size = 1024;
    const canvasSize = 2048; // 2× render resolution for HD sharpness
    const textColor = state.secondary || "#ffffff";

    const makeCanvas = (drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      const cv = document.createElement("canvas");
      cv.width = canvasSize;
      cv.height = canvasSize;
      const ctx = cv.getContext("2d");
      if (!ctx) return null;

      // Scale up 2× so all coordinate math (0–1024) stays unchanged
      ctx.scale(2, 2);

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;

      drawFn(ctx);

      const texture = new THREE.CanvasTexture(cv);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;

      const meshDecalAspectRatio = 0.54 / 0.7;
      texture.repeat.set(meshDecalAspectRatio, 1);
      texture.offset.set((1 - meshDecalAspectRatio) / 2, 0);

      texture.needsUpdate = true;
      return texture;
    };

    const drawLayerOnCtx = (ctx: CanvasRenderingContext2D, layer: any) => {
      const img = state.loadedLogoImages[layer.src];
      if (!img) return;
      ctx.save();
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;
      ctx.shadowBlur = 0;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const opacity = typeof layer.opacity === "number" ? layer.opacity : 1.0;
      ctx.globalAlpha = opacity;
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);

      const imgWidth = img.naturalWidth || img.width || 200;
      const imgHeight = img.naturalHeight || img.height || 200;
      const drawWidth = imgWidth;
      const drawHeight = imgHeight;

      if (layer.eraserPaths && layer.eraserPaths.length > 0) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = drawWidth;
        tempCanvas.height = drawHeight;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
          tempCtx.globalCompositeOperation = "destination-out";
          tempCtx.lineCap = "round";
          tempCtx.lineJoin = "round";
          tempCtx.strokeStyle = "rgba(0,0,0,1)";
          layer.eraserPaths.forEach((path: any) => {
            tempCtx.lineWidth = path.size;
            tempCtx.beginPath();
            path.points.forEach((pt: any, idx: number) => {
              if (idx === 0) {
                tempCtx.moveTo(pt.x, pt.y);
              } else {
                tempCtx.lineTo(pt.x, pt.y);
              }
            });
            tempCtx.stroke();
          });
          ctx.drawImage(tempCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        } else {
          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
      } else {
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      }
      ctx.restore();
    };

    const getFontString = (sizeStr: any, fontStyle: string, defaultSize: number) => {
      const sz = sizeStr || defaultSize;
      if (fontStyle === "Italic") return `italic 900 ${sz}px Impact, sans-serif`;
      if (fontStyle === "Script") return `bold ${sz}px "Brush Script MT", cursive`;
      if (fontStyle === "Block") return `900 ${sz}px "Courier New", monospace`;
      if (fontStyle === "Varsity") return `900 ${sz}px "Arial Black", sans-serif`;
      if (fontStyle === "Serif Athletic") return `900 ${sz}px "Alfa Slab One", serif`;
      if (fontStyle === "Cyberpunk") return `900 ${sz}px "Orbitron", sans-serif`;
      if (fontStyle === "Grunge") return `400 ${sz}px "Rubik Glitch", display`;
      if (fontStyle === "Neon Glow") return `400 ${sz}px "Monoton", sans-serif`;
      if (fontStyle === "Gothic") return `400 ${sz}px "UnifrakturMaguntia", serif`;
      return `900 ${sz}px Impact, sans-serif`;
    };

    const drawTextWithSpacing = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      fontStyle: string,
      textSize: number,
      color: string,
      isOutline: boolean,
      outlineColor: string,
      letterSpacingVal: number,
      lineSpacingVal: number,
      curveRadiusVal: number,
      shadowEnabled?: boolean,
      shadowColor?: string,
      shadowBlur?: number,
      shadowOffsetX?: number,
      shadowOffsetY?: number,
      outlineEnabled?: boolean,
      customOutlineColor?: string,
      outlineWidth?: number,
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const lines = text.split("\n");
      const lineSpacingHeight = textSize * (lineSpacingVal || 1.15);
      const totalHeight = (lines.length - 1) * lineSpacingHeight;
      const verticalOffset = -totalHeight / 2;

      lines.forEach((line, lineIndex) => {
        const curY = verticalOffset + lineIndex * lineSpacingHeight;

        ctx.font = getFontString(textSize, fontStyle, 100);
        ctx.textBaseline = "middle";

        if (shadowEnabled) {
          ctx.shadowColor = shadowColor || "#000000";
          ctx.shadowBlur = typeof shadowBlur === "number" ? shadowBlur : 10;
          ctx.shadowOffsetX = typeof shadowOffsetX === "number" ? shadowOffsetX : 4;
          ctx.shadowOffsetY = typeof shadowOffsetY === "number" ? shadowOffsetY : 4;
        } else if (fontStyle === "Neon Glow") {
          ctx.shadowColor = color;
          ctx.shadowBlur = Math.max(10, textSize * 0.15);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        const chars = Array.from(line);
        const charWidths = chars.map((c) => ctx.measureText(c).width);
        const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacingVal;

        if (!curveRadiusVal || curveRadiusVal === 0) {
          if (!letterSpacingVal || letterSpacingVal === 0) {
            ctx.textAlign = "center";
            if (outlineEnabled) {
              ctx.strokeStyle = customOutlineColor || "#FFFFFF";
              ctx.lineWidth = typeof outlineWidth === "number" ? outlineWidth : 4;
              ctx.strokeText(line, 0, curY);
            } else if (isOutline) {
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(2, textSize * 0.04);
              ctx.strokeText(line, 0, curY);
            }

            if (!isOutline) {
              ctx.fillStyle = color;
              ctx.fillText(line, 0, curY);
            }
          } else {
            let curX = -totalWidth / 2;
            ctx.textAlign = "left";
            chars.forEach((char, charIdx) => {
              const charW = charWidths[charIdx];
              if (outlineEnabled) {
                ctx.strokeStyle = customOutlineColor || "#FFFFFF";
                ctx.lineWidth = typeof outlineWidth === "number" ? outlineWidth : 4;
                ctx.strokeText(char, curX, curY);
              } else if (isOutline) {
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(2, textSize * 0.04);
                ctx.strokeText(char, curX, curY);
              }

              if (!isOutline) {
                ctx.fillStyle = color;
                ctx.fillText(char, curX, curY);
              }
              curX += charW + letterSpacingVal;
            });
          }
        } else {
          const totalAngle = (curveRadiusVal * Math.PI) / 180;
          const R = totalWidth / totalAngle;
          let currentS = 0;
          ctx.textAlign = "center";

          chars.forEach((char, charIdx) => {
            const charW = charWidths[charIdx];
            const charCenterS = currentS + charW / 2;
            const angle = (charCenterS - totalWidth / 2) / R;

            const cx = R * Math.sin(angle);
            const cy = curY + R * (1 - Math.cos(angle));

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            if (outlineEnabled) {
              ctx.strokeStyle = customOutlineColor || "#FFFFFF";
              ctx.lineWidth = typeof outlineWidth === "number" ? outlineWidth : 4;
              ctx.strokeText(char, 0, 0);
            } else if (isOutline) {
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(2, textSize * 0.04);
              ctx.strokeText(char, 0, 0);
            }

            if (!isOutline) {
              ctx.fillStyle = color;
              ctx.fillText(char, 0, 0);
            }
            ctx.restore();
            currentS += charW + letterSpacingVal;
          });
        }
      });
      ctx.restore();
    };

    const drawPattern = (ctx: CanvasRenderingContext2D) => {
      const dp = state.designPattern;
      if (!dp || dp === "plain") return;
      const sc = size / 100;
      const sec = state.designColor || state.secondary || "#1A1A2E";
      const pri = state.primary || "#2196F3";
      ctx.save();
      ctx.fillStyle = sec;
      ctx.strokeStyle = sec;
      switch (dp) {
        case "strike":
          ctx.beginPath();
          ctx.moveTo(60 * sc, 10 * sc);
          ctx.lineTo(80 * sc, 10 * sc);
          ctx.lineTo(50 * sc, 90 * sc);
          ctx.lineTo(30 * sc, 90 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "save":
          ctx.fillRect(0, 0, 45 * sc, size);
          break;
        case "fastbreak":
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
          ctx.fillRect(0, 0, 35 * sc, size);
          ctx.fillRect(65 * sc, 0, 35 * sc, size);
          break;
        case "victory":
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(40 * sc, 0);
          ctx.lineTo(20 * sc, 100 * sc);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "city":
          ctx.lineWidth = 4 * sc;
          [25, 50, 75].forEach((y) => {
            ctx.beginPath();
            ctx.moveTo(0, y * sc);
            ctx.lineTo(size, y * sc);
            ctx.stroke();
          });
          break;
        case "pure":
          ctx.beginPath();
          ctx.moveTo(70 * sc, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 40 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "level":
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(55 * sc, 0);
          ctx.lineTo(0, 70 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "vivo":
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
          ctx.beginPath();
          ctx.moveTo(0, 100 * sc);
          ctx.lineTo(45 * sc, 0);
          ctx.lineTo(55 * sc, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "league":
          ctx.fillRect(0, 0, 50 * sc, size);
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = pri;
          ctx.fillRect(50 * sc, 0, 50 * sc, size);
          break;
        case "magic": {
          const grad = ctx.createRadialGradient(50 * sc, 40 * sc, 0, 50 * sc, 40 * sc, 80 * sc);
          grad.addColorStop(0, sec);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);
          break;
        }
        case "raid":
          ctx.fillRect(0, 0, size, 50 * sc);
          break;
        case "rush":
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.lineTo(40 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "score":
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

    const drawFabricPattern = (
      ctx: CanvasRenderingContext2D,
      patternName: string,
      isFront: boolean,
    ) => {
      if (!patternName || patternName === "None") return;
      const loadedImg = state.loadedPatterns?.[patternName];
      if (loadedImg) {
        const customize = isFront
          ? state.fabricPatternCustomizeFront
          : state.fabricPatternCustomizeBack;

        if (!customize) {
          ctx.save();
          ctx.drawImage(loadedImg, 0, 0, size, size);
          ctx.restore();
          return;
        }

        const fgColor = isFront
          ? state.fabricPatternColorFront
          : state.fabricPatternColorBack;
        const bgColor = isFront
          ? state.fabricPatternBgFront
          : state.fabricPatternBgBack;

        const hexToRgb = (hex: string) => {
          const cleanHex = hex.replace("#", "");
          const num = parseInt(cleanHex, 16);
          return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
          };
        };

        const bgIsTransparent =
          bgColor.toLowerCase() === "transparent" || bgColor === "";
        const fgRgb = hexToRgb(fgColor);

        // Process pixel data to extract foreground shapes with transparency
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        tempCtx.drawImage(loadedImg, 0, 0, size, size);
        const imgData = tempCtx.getImageData(0, 0, size, size);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Calculate distance from white (255, 255, 255)
          const dist = Math.sqrt(
            (255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2,
          );

          // Interpolation factor t:
          // dist < 30 -> background
          // dist > 90 -> foreground
          const t = Math.max(0, Math.min(1, (dist - 30) / 60));

          data[i] = fgRgb.r;
          data[i + 1] = fgRgb.g;
          data[i + 2] = fgRgb.b;
          data[i + 3] = Math.round(a * t);
        }

        tempCtx.putImageData(imgData, 0, 0);

        ctx.save();
        if (!bgIsTransparent) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
        }
        ctx.drawImage(tempCanvas, 0, 0, size, size);
        ctx.restore();
      }
    };

    const drawSublimatedPattern = (ctx: CanvasRenderingContext2D, patternName: string, color: string, isBackSide: boolean) => {
      if (!patternName || patternName === "None") return;
      ctx.save();

      const patternColor = color || "#ffffff";

      // Seeded random helper
      let seed = isBackSide ? 98765 : 12345;
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      if (patternName === "Street Shard") {
        const drawShard = (x: number, y: number, rSize: number, col: string) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(x + (random() - 0.5) * rSize, y + (random() - 0.5) * rSize);
          const points = 3 + Math.floor(random() * 4);
          for (let p = 0; p < points; p++) {
            const angle = (p / points) * Math.PI * 2 + random() * 0.5;
            const px = x + Math.cos(angle) * rSize * (0.6 + random() * 0.6);
            const py = y + Math.sin(angle) * rSize * (0.6 + random() * 0.6);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        };

        for (let i = 0; i < 20; i++) {
          const rx = random() * (size * 0.33);
          const ry = random() * size;
          const rS = 30 + random() * 50;
          const isDark = random() > 0.3;
          drawShard(rx, ry, rS, isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)");
          if (rx < rS) drawShard(rx + size, ry, rS, isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)");
        }

        for (let i = 0; i < 20; i++) {
          const rx = size * 0.67 + random() * (size * 0.33);
          const ry = random() * size;
          const rS = 30 + random() * 50;
          const isDark = random() > 0.3;
          drawShard(rx, ry, rS, isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)");
          if (rx + rS > size) drawShard(rx - size, ry, rS, isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)");
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          const sx = random() * size;
          const sy = random() * size;
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (random() - 0.5) * 120, sy + (random() - 0.5) * 120);
          ctx.stroke();
        }

        const bandStart = size * 0.36;
        const bandEnd = size * 0.64;
        const bandWidth = bandEnd - bandStart;
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(bandStart, 0, bandWidth, size);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          const sx = bandStart + random() * bandWidth;
          const sy = random() * size;
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(sx + (random() - 0.5) * 30, sy + 50, sx + (random() - 0.5) * 30, sy + 100);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        const dotSpacing = 10;
        for (let x = bandStart - 40; x <= bandStart; x += dotSpacing) {
          const distance = bandStart - x;
          const maxRadius = 3.5;
          const radius = Math.max(0.5, maxRadius * (1 - distance / 40));
          for (let y = 0; y < size; y += dotSpacing) {
            ctx.beginPath();
            const offset = (Math.round(y / dotSpacing) % 2) * (dotSpacing / 2);
            ctx.arc(x, y + offset, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        for (let x = bandEnd; x <= bandEnd + 40; x += dotSpacing) {
          const distance = x - bandEnd;
          const maxRadius = 3.5;
          const radius = Math.max(0.5, maxRadius * (1 - distance / 40));
          for (let y = 0; y < size; y += dotSpacing) {
            ctx.beginPath();
            const offset = (Math.round(y / dotSpacing) % 2) * (dotSpacing / 2);
            ctx.arc(x, y + offset, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (patternName === "JerseyHexDot") {
        ctx.fillStyle = patternColor;
        ctx.fillRect(0, 0, size, size);

        const hexSize = 48;
        const cols = Math.ceil(size / (hexSize * 1.6)) + 2;
        const rows = Math.ceil(size / (hexSize * 1.4)) + 2;

        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            const offsetX = row % 2 === 0 ? 0 : hexSize * 0.9;
            const cx = col * hexSize * 1.7 + offsetX;
            const cy = row * hexSize * 1.35;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 180) * (60 * i - 30);
              const x = cx + hexSize * 0.82 * Math.cos(angle);
              const y = cy + hexSize * 0.82 * Math.sin(angle);
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();

            const hexR = parseInt(patternColor.slice(1, 3), 16);
            const hexG = parseInt(patternColor.slice(3, 5), 16);
            const hexB = parseInt(patternColor.slice(5, 7), 16);
            const dr2 = Math.round(hexR * 0.65);
            const dg2 = Math.round(hexG * 0.65);
            const db2 = Math.round(hexB * 0.65);
            ctx.strokeStyle = `rgba(${dr2}, ${dg2}, ${db2}, 0.5)`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            const dotRows = 5;
            const dotCols = 5;
            const dotSpacing = hexSize * 0.32;

            for (let dr = 0; dr < dotRows; dr++) {
              for (let dc = 0; dc < dotCols; dc++) {
                const dx = cx - ((dotCols - 1) * dotSpacing) / 2 + dc * dotSpacing;
                const dy = cy - ((dotRows - 1) * dotSpacing) / 2 + dr * dotSpacing;
                const dist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
                const maxDist = hexSize * 0.75;
                if (dist > maxDist) continue;

                const fade = 1 - dist / maxDist;
                const r = 1.6 * fade + 0.4;
                ctx.beginPath();
                ctx.arc(dx, dy, r, 0, Math.PI * 2);

                const dr3 = Math.round(hexR * 0.7);
                const dg3 = Math.round(hexG * 0.7);
                const db3 = Math.round(hexB * 0.7);
                ctx.fillStyle = `rgba(${dr3}, ${dg3}, ${db3}, ${0.55 * fade + 0.15})`;
                ctx.fill();
              }
            }
          }
        }

        const vignette = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.85);
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.22)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, size, size);
      } else if (patternName === "BlueGrungeJersey") {
        const pr = parseInt(patternColor.slice(1, 3), 16);
        const pg = parseInt(patternColor.slice(3, 5), 16);
        const pb = parseInt(patternColor.slice(5, 7), 16);

        const lr = Math.round(pr * 0.4 + 255 * 0.6);
        const lg = Math.round(pg * 0.4 + 255 * 0.6);
        const lb = Math.round(pb * 0.4 + 255 * 0.6);
        const lightSide = `rgb(${lr}, ${lg}, ${lb})`;

        const deepR = Math.round(pr * 0.35);
        const deepG = Math.round(pg * 0.35);
        const deepB = Math.round(pb * 0.35);

        ctx.fillStyle = patternColor;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = lightSide;
        ctx.fillRect(0, 0, size * 0.38, size);
        ctx.fillRect(size * 0.62, 0, size * 0.38, size);

        const drawGrungeTriangles = (areaX: number, areaW: number, count: number, seedOffset: number) => {
          for (let i = 0; i < count; i++) {
            const r1 = random();
            const r2 = random();
            const r3 = random();
            const r4 = random();
            const r5 = random();
            const r6 = random();

            const x1 = areaX + r1 * areaW;
            const y1 = r2 * size;
            const triSize = 40 + r3 * 120;
            const angle = r4 * Math.PI * 2;

            const x2 = x1 + Math.cos(angle) * triSize;
            const y2 = y1 + Math.sin(angle) * triSize;
            const x3 = x1 + Math.cos(angle + 2.3) * triSize * 0.7;
            const y3 = y1 + Math.sin(angle + 2.3) * triSize * 0.7;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();

            if (r5 > 0.5) {
              ctx.fillStyle = `rgba(${deepR}, ${deepG}, ${deepB}, 0.75)`;
              ctx.fill();
            } else {
              ctx.strokeStyle = `rgba(${deepR}, ${deepG}, ${deepB}, 0.85)`;
              ctx.lineWidth = 2 + r6 * 4;
              ctx.stroke();
            }
          }
        };

        drawGrungeTriangles(0, size * 0.33, 10, 0);
        drawGrungeTriangles(size * 0.67, size * 0.33, 10, 50);

        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(size * 0.38, 0, size * 0.24, size);
      }

      ctx.restore();
    };

    // Front Texture
    const front = makeCanvas((ctx) => {
      const side = "Front";
      const sideTextLayers = state.textLayers.filter((l: any) => l.side === side);
      const sideLogoLayers = state.logoLayers.filter((l: any) => l.side === side);

      const activeSideLayers = [
        ...sideTextLayers.map((l: any) => ({ ...l, layerType: "text" })),
        ...sideLogoLayers.map((l: any) => ({ ...l, layerType: "logo" })),
      ];

      const sortedLayers = [...activeSideLayers].sort((a, b) => {
        const idxA = state.layersOrder.indexOf(a.id);
        const idxB = state.layersOrder.indexOf(b.id);
        const getPriority = (l: any) => {
          if (l.layerType === "text") return 1;
          if (l.type === "image") {
            return l.zOrder === "above-text" ? 2 : 0;
          }
          return 3;
        };
        const valA = idxA !== -1 ? idxA : getPriority(a) * 1000;
        const valB = idxB !== -1 ? idxB : getPriority(b) * 1000;
        return valA - valB;
      });

      sortedLayers.forEach((layer) => {
        if (layer.layerType === "text") {
          drawTextWithSpacing(
            ctx,
            layer.text,
            layer.x,
            layer.y,
            layer.font,
            layer.textSize,
            layer.color,
            false,
            "#FFFFFF",
            layer.letterSpacing || 0,
            layer.lineSpacing || 1.15,
            layer.curveRadius || 0,
            layer.shadowEnabled,
            layer.shadowColor,
            layer.shadowBlur,
            layer.shadowOffsetX,
            layer.shadowOffsetY,
            layer.outlineEnabled,
            layer.outlineColor,
            layer.outlineWidth,
          );
        }
        // logo layers rendered as 3D Decals - skip canvas draw
      });
    });

    // Back Texture
    const back = makeCanvas((ctx) => {
      const side = "Back";
      const sideTextLayers = state.textLayers.filter((l: any) => l.side === side);
      const sideLogoLayers = state.logoLayers.filter((l: any) => l.side === side);

      const activeSideLayers = [
        ...sideTextLayers.map((l: any) => ({ ...l, layerType: "text" })),
        ...sideLogoLayers.map((l: any) => ({ ...l, layerType: "logo" })),
      ];

      const sortedLayers = [...activeSideLayers].sort((a, b) => {
        const idxA = state.layersOrder.indexOf(a.id);
        const idxB = state.layersOrder.indexOf(b.id);
        const getPriority = (l: any) => {
          if (l.layerType === "text") return 1;
          if (l.type === "image") {
            return l.zOrder === "above-text" ? 2 : 0;
          }
          return 3;
        };
        const valA = idxA !== -1 ? idxA : getPriority(a) * 1000;
        const valB = idxB !== -1 ? idxB : getPriority(b) * 1000;
        return valA - valB;
      });

      sortedLayers.forEach((layer) => {
        if (layer.layerType === "text") {
          drawTextWithSpacing(
            ctx,
            layer.text,
            layer.x,
            layer.y,
            layer.font,
            layer.textSize,
            layer.color,
            false,
            "#FFFFFF",
            layer.letterSpacing || 0,
            layer.lineSpacing || 1.15,
            layer.curveRadius || 0,
            layer.shadowEnabled,
            layer.shadowColor,
            layer.shadowBlur,
            layer.shadowOffsetX,
            layer.shadowOffsetY,
            layer.outlineEnabled,
            layer.outlineColor,
            layer.outlineWidth,
          );
        }
        // logo layers rendered as 3D Decals - skip canvas draw
      });
    });

    const isSplit = state.primaryColorSide && state.primaryColorSide !== "Both";

    const showFrontDecal =
      isSplit ||
      (state.designPattern &&
        state.designPattern !== "plain" &&
        (state.designSide === "Front" || state.designSide === "Both" || !state.designSide)) ||
      (state.fabricPatternFront && state.fabricPatternFront !== "None");

    const showBackDecal =
      isSplit ||
      (state.designPattern &&
        state.designPattern !== "plain" &&
        (state.designSide === "Back" || state.designSide === "Both")) ||
      (state.fabricPatternBack && state.fabricPatternBack !== "None");

    // Pattern Front Texture
    const patternFront = showFrontDecal
      ? makeCanvas((ctx) => {
        // 1. Draw base color / fabric pattern first
        if (state.fabricPatternFront && state.fabricPatternFront !== "None") {
          drawFabricPattern(ctx, state.fabricPatternFront, true);
        } else {
          // Fill with front primary color
          ctx.fillStyle = state.primaryFront || state.primary || "#2196F3";
          ctx.fillRect(0, 0, size, size);
        }
        // 2. Draw design pattern on top
        if (
          state.designPattern &&
          state.designPattern !== "plain" &&
          (state.designSide === "Front" || state.designSide === "Both" || !state.designSide)
        ) {
          drawPattern(ctx);
        }
      })
      : null;

    // Pattern Back Texture
    const patternBack = showBackDecal
      ? makeCanvas((ctx) => {
        // 1. Draw base color / fabric pattern first
        if (state.fabricPatternBack && state.fabricPatternBack !== "None") {
          drawFabricPattern(ctx, state.fabricPatternBack, false);
        } else {
          // Fill with back primary color
          ctx.fillStyle = state.primaryBack || state.primary || "#2196F3";
          ctx.fillRect(0, 0, size, size);
        }
        // 2. Draw design pattern on top
        if (
          state.designPattern &&
          state.designPattern !== "plain" &&
          (state.designSide === "Back" || state.designSide === "Both")
        ) {
          drawPattern(ctx);
        }
      })
      : null;

    return { front, back, patternFront, patternBack };
  }, [
    state.primary,
    state.primaryColorSide,
    state.primaryFront,
    state.primaryBack,
    state.secondary,
    state.designColor,
    state.designPattern,
    state.textLayers,
    state.logoLayers,
    state.loadedLogoImages,
    state.layersOrder,
    state.fabricPatternColorFront,
    state.fabricPatternFront,
    state.fabricPatternCustomizeFront,
    state.fabricPatternBgFront,
    state.fabricPatternCustomizeBack,
    state.fabricPatternColorBack,
    state.fabricPatternBack,
    state.fabricPatternBgBack,
    state.loadedPatterns,
  ]);
}

// ─── Logo Decal Component ──────────────────────────────────────────────────
function LogoDecal({
  layer,
  loadedLogoImages,
  roughness,
  fabricConfig,
  glbModel,
}: {
  layer: LogoLayer;
  loadedLogoImages: Record<string, HTMLImageElement>;
  roughness: number;
  fabricConfig: any;
  glbModel: string;
}) {
  const img = loadedLogoImages[layer.src];
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(1.0);

  useEffect(() => {
    if (!img) return;
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    setAspect(img.naturalWidth / img.naturalHeight || 1.0);
    setLogoTexture(tex);
  }, [img, layer.src]);

  const decalParams = useMemo(() => {
    if (!logoTexture || !img) return null;

    const meshWidth = 0.54;
    const meshHeight = 0.7;
    const canvasSize = 1024;
    const relativeZ = 0.155;

    // Map image pixel size to 3D world space, preserving the original aspect ratio.
    // Use meshWidth as the single reference so a square image stays square.
    const imgW = img.naturalWidth || img.width || 200;
    const imgH = img.naturalHeight || img.height || 200;
    const finalSizeX = (imgW * layer.scale / canvasSize) * meshWidth;
    const finalSizeY = (imgH * layer.scale / canvasSize) * meshWidth; // same base → no stretch

    // Map canvas position (0–1024) to mesh world position
    // Canvas center = 512,512 → mesh center = 0,0
    const relativeX = (layer.x - canvasSize / 2) / canvasSize;
    const relativeY = -(layer.y - canvasSize / 2) / canvasSize;   // 512 is true center
    let posX = relativeX * meshWidth;    // no clamping — full freedom of movement
    let posY = relativeY * meshHeight;   // use meshHeight for Y axis
    let posZ = relativeZ;
    let rotY = 0;

    if (layer.side === "Back") {
      posX = -posX;
      posZ = -relativeZ;
      rotY = Math.PI;
    }

    // Apply offset for collar model geometry scale/translation
    const isCollarModel = glbModel === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb";
    if (isCollarModel) {
      posY += -0.05;
      posZ += 0.005;
    }

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, rotY, -(layer.rotation * Math.PI) / 180] as [number, number, number],
      scale: [finalSizeX, finalSizeY, 0.3] as [number, number, number],
    };
  }, [logoTexture, img, aspect, layer.x, layer.y, layer.scale, layer.rotation, layer.side, glbModel]);

  if (!logoTexture || !decalParams) return null;

  return (
    <Decal
      position={decalParams.position}
      rotation={decalParams.rotation}
      scale={decalParams.scale}
      renderOrder={40}
    >
      <meshStandardMaterial
        map={logoTexture}
        transparent
        alphaTest={0.002}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-10}
        roughness={roughness}
        normalMap={fabricConfig.normalMap || undefined}
        normalScale={fabricConfig.normalScale}
        envMapIntensity={0.2}
      />
    </Decal>
  );
}

// ─── Main Jersey3D Component ───────────────────────────────────────────────
export function Jersey3D({
  colors,
  collar,
  texturesRef,
}: {
  colors: any;
  collar: boolean;
  texturesRef?: React.MutableRefObject<{
    front: THREE.CanvasTexture | null;
    back: THREE.CanvasTexture | null;
    patternFront?: THREE.CanvasTexture | null;
    patternBack?: THREE.CanvasTexture | null;
  }>;
}) {
  const glbPath = colors.glbModel || "/models/shirt_baked.glb";
  const { nodes } = useGLTF(glbPath) as any;

  // Find the mesh geometry dynamically from nodes to support multiple apparel models
  const meshNode = nodes.T_Shirt_male || nodes.mesh_node || Object.values(nodes).find((n: any) => n.isMesh || n.type === "Mesh");

  // Create a scaled clone of the geometry so both models share the exact same scale, coordinates, and positions
  const shirtGeometry = useMemo(() => {
    if (!meshNode?.geometry) return null;
    const geo = meshNode.geometry.clone();

    // Ensure vertex normals exist
    if (!geo.attributes.normal) {
      geo.computeVertexNormals();
    }
    // Ensure UV coordinates exist
    if (!geo.attributes.uv) {
      const count = geo.attributes.position.count;
      const uvs = new Float32Array(count * 2);
      geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    }

    // Scale collar model to match no-collar T-Shirt model boundaries
    if (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb") {
      geo.scale(0.33, 0.33, 0.33);
      geo.translate(0, -0.05, 0.005);
    }

    return geo;
  }, [meshNode, glbPath]);

  const { front, back, patternFront, patternBack } = useJerseyDecals(colors);

  useEffect(() => {
    if (texturesRef) {
      texturesRef.current = { front, back, patternFront, patternBack };
    }
  }, [front, back, patternFront, patternBack, texturesRef]);

  const { collarDecal } = useStyleDecals(colors);
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

    let posX = 0;
    let posY = 0;
    let posZ = 0;
    let rotY = 0;
    let scaleX = size * aspect;
    let scaleY = size;

    switch (colors.logoPosition) {
      case "Left Chest":
        posX = 0.062;
        posY = 0.16;
        posZ = 0.138;
        scaleX *= 0.75;
        scaleY *= 0.75;
        break;
      case "Right Chest":
        posX = -0.062;
        posY = 0.16;
        posZ = 0.138;
        scaleX *= 0.75;
        scaleY *= 0.75;
        break;
      case "Center":
        posX = 0.0;
        posY = 0.08;
        posZ = 0.15;
        scaleX *= 1.3;
        scaleY *= 1.3;
        break;
      case "Back Top":
        posX = 0.0;
        posY = 0.23;
        posZ = -0.135;
        rotY = Math.PI;
        scaleX *= 0.9;
        scaleY *= 0.9;
        break;
      case "Back Center":
        posX = 0.0;
        posY = 0.05;
        posZ = -0.15;
        rotY = Math.PI;
        scaleX *= 1.3;
        scaleY *= 1.3;
        break;
      case "Sleeve":
        posX = 0.22;
        posY = 0.16;
        posZ = 0.0;
        rotY = Math.PI / 2;
        break;
      default:
        return null;
    }

    // Apply offset for collar model geometry scale/translation
    const isCollarModel = glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb";
    if (isCollarModel) {
      posY += -0.05;
      posZ += 0.005;
    }

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, rotY, 0] as [number, number, number],
      scale: [scaleX, scaleY, 0.2] as [number, number, number],
    };
  }, [logoTexture, logoAspect, colors.logoPosition, colors.logoSize, glbPath]);

  const meshNormalMap = useMemo(() => createMeshNormalMap(), []);
  const flexNormalMap = useMemo(() => createFlexNormalMap(), []);

  const fabricConfig = useMemo(() => {
    if (colors.fabric === "Flex") {
      return {
        roughness: 0.4,
        normalMap: flexNormalMap,
        normalScale: new THREE.Vector2(0.15, 0.15),
      };
    } else {
      return {
        roughness: 0.8,
        normalMap: meshNormalMap,
        normalScale: new THREE.Vector2(0.4, 0.4),
      };
    }
  }, [colors.fabric, meshNormalMap, flexNormalMap]);

  const shirtMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: colors.primaryFront || colors.primary,
      roughness: fabricConfig.roughness,
      metalness: 0.04,
      normalMap: fabricConfig.normalMap || undefined,
      normalScale: fabricConfig.normalScale,
      envMapIntensity: 0.25,
    });
  }, [fabricConfig, colors.primaryFront, colors.primary]);

  let scaleX = 2.2;
  let scaleZ = 2.2;
  if (colors.cutFit === "Slim Fit") {
    scaleX = 2.05;
    scaleZ = 2.05;
  } else if (colors.cutFit === "Relaxed") {
    scaleX = 2.35;
    scaleZ = 2.35;
  }

  const SLEEVE_SEAM_X = 0.187;
  const SLEEVE_SEAM_Y = 0.087;
  const SLEEVE_ROT_Z = Math.PI / 2 + 0.35;
  const SLEEVE_AX = Math.sin(SLEEVE_ROT_Z);
  const SLEEVE_AY = Math.cos(SLEEVE_ROT_Z);

  const sleeveLen = colors.sleeve === "Long" ? 0.34 : 0.17;
  const sleeveHalf = sleeveLen / 2;
  const sleeveCX = SLEEVE_SEAM_X + sleeveHalf * SLEEVE_AX;
  const sleeveCY = SLEEVE_SEAM_Y + sleeveHalf * SLEEVE_AY;
  const sleeveWristX = SLEEVE_SEAM_X + sleeveLen * SLEEVE_AX;
  const sleeveWristY = SLEEVE_SEAM_Y + sleeveLen * SLEEVE_AY;

  const trimColor = colors.designColor || colors.secondary || "#ffffff";
  const roughness = fabricConfig.roughness;

  return (
    <group scale={[scaleX, 2.2, scaleZ]} position={[0, -0.1, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={shirtGeometry}
        material={shirtMat}
        dispose={null}
      >
        {patternFront && (
          <Decal
            position={[0, 0.0 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? -0.05 : 0.0), 0.155 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? 0.005 : 0.0)]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.7, 0.48]}
            renderOrder={1}
          >
            <meshStandardMaterial
              map={patternFront}
              transparent
              alphaTest={0.01}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-3}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}
        {patternBack && (
          <Decal
            position={[0, 0.0 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? -0.05 : 0.0), -0.155 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? 0.005 : 0.0)]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.7, 0.48]}
            renderOrder={1}
          >
            <meshStandardMaterial
              map={patternBack}
              transparent
              alphaTest={0.01}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-3}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}

        {front && (
          <Decal
            position={[0, 0.0 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? -0.05 : 0.0), 0.155 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? 0.005 : 0.0)]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.7, 0.48]}
            renderOrder={10}
          >
            <meshStandardMaterial
              map={front}
              transparent
              alphaTest={0.02}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}
        {back && (
          <Decal
            position={[0, 0.0 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? -0.05 : 0.0), -0.155 + (glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? 0.005 : 0.0)]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.7, 0.48]}
            renderOrder={10}
          >
            <meshStandardMaterial
              map={back}
              transparent
              alphaTest={0.02}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}
        {logoTexture && logoParams && (
          <Decal
            position={logoParams.position}
            rotation={logoParams.rotation}
            scale={logoParams.scale}
            renderOrder={20}
          >
            <meshStandardMaterial
              map={logoTexture}
              transparent
              alphaTest={0.002}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-8}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}

        {collarDecal && (
          <Decal
            position={
              glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb"
                ? [0.0, 0.125, 0.123]
                : [0.0, 0.185, 0.118]
            }
            rotation={[0.15, 0, 0]}
            scale={
              glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb"
                ? [0.36, 0.36, 0.15]
                : [0.22, 0.22, 0.12]
            }
            renderOrder={30}
          >
            <meshStandardMaterial
              map={collarDecal}
              transparent
              alphaTest={0.008}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-7}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}

        {(colors.logoLayers || [])
          .filter((l: any) => l.type === "logo" || !l.type)
          .map((layer: any) => (
            <LogoDecal
              key={layer.id}
              layer={layer}
              loadedLogoImages={colors.loadedLogoImages || {}}
              roughness={roughness}
              fabricConfig={fabricConfig}
              glbModel={glbPath}
            />
          ))}
      </mesh>



      {(colors.sleeve === "Long" || colors.sleeve === "3/4") && (
        <group position={[0, glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? -0.05 : 0.0, glbPath === "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb" ? 0.005 : 0.0]}>
          <mesh castShadow receiveShadow position={[sleeveCX, sleeveCY, -0.01]} rotation={[0, 0, -SLEEVE_ROT_Z]}>
            <cylinderGeometry args={[0.042, colors.sleeve === "Long" ? 0.028 : 0.034, sleeveLen, 32]} />
            <meshStandardMaterial
              color={colors.primaryFront || colors.primary}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              metalness={0.03}
              envMapIntensity={1.1}
            />
          </mesh>
          {colors.sleeve === "Long" && (
            <mesh castShadow receiveShadow position={[sleeveWristX, sleeveWristY, -0.01]} rotation={[0, 0, -SLEEVE_ROT_Z]}>
              <cylinderGeometry args={[0.029, 0.028, 0.018, 32]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.02} />
            </mesh>
          )}

          <mesh castShadow receiveShadow position={[-sleeveCX, sleeveCY, -0.01]} rotation={[0, 0, SLEEVE_ROT_Z]}>
            <cylinderGeometry args={[0.042, colors.sleeve === "Long" ? 0.028 : 0.034, sleeveLen, 32]} />
            <meshStandardMaterial
              color={colors.primaryFront || colors.primary}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              metalness={0.03}
              envMapIntensity={1.1}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
useGLTF.preload("/models/shirt_baked.glb");
useGLTF.preload("/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb");
