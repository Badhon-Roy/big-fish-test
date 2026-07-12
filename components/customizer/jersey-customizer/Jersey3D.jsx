"use client";

import React, { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, Decal } from "@react-three/drei";
import { JERSEY_DESIGNS, getFontFamily } from "./types";

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Normal Map Generators ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Style Decals Hook ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function useStyleDecals(colors) {
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

    const hexRgb = (h) => {
      const c = parseInt(h.replace("#", ""), 16);
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    };
    const lighten = (h, amt) => {
      const [r, g, b] = hexRgb(h);
      return `rgba(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)},1)`;
    };
    const darken = (h, amt) => {
      const [r, g, b] = hexRgb(h);
      return `rgba(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)},1)`;
    };

    const drawRoundRect = (x, y, w, h, r) => {
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

    const drawPlacket = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.closePath();
    };

    const drawButtonhole = (cx, cy, length) => {
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

    const drawRealisticButton = (cx, cy, r) => {
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
      topY,
      botY,
      width,
      leftX,
      sliderY,
      buttonYFs,
      curveOffset
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
        const getLeftTapeX = (y) => {
          if (y >= sY) return S * 0.4925;
          const t = (sY - y) / (sY - yTop);
          return S * 0.4925 - t * t * cOffset;
        };

        const getRightTapeX = (y) => {
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
      const makeVLeg = (x1, y1, x2, y2) => {
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

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Jersey Decals Hook ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function useJerseyDecals(state) {
  return useMemo(() => {
    const size = 1024;
    const canvasSize = 2048; // 2ÃƒÆ’Ã¢â‚¬â€ render resolution for HD sharpness
    const textColor = state.secondary || "#ffffff";

    const makeCanvas = (drawFn) => {
      const cv = document.createElement("canvas");
      cv.width = canvasSize;
      cv.height = canvasSize;
      const ctx = cv.getContext("2d");
      if (!ctx) return null;

      // Scale up 2ÃƒÆ’Ã¢â‚¬â€ so all coordinate math (0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“1024) stays unchanged
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

    const drawLayerOnCtx = (ctx, layer) => {
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
          layer.eraserPaths.forEach((path) => {
            tempCtx.lineWidth = path.size;
            tempCtx.beginPath();
            path.points.forEach((pt, idx) => {
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

    const getFontString = (sizeStr, fontStyle, defaultSize) => {
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
      ctx,
      text,
      x,
      y,
      fontStyle,
      textSize,
      color,
      isOutline,
      outlineColor,
      letterSpacingVal,
      lineSpacingVal,
      curveRadiusVal,
      shadowEnabled,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      outlineEnabled,
      customOutlineColor,
      outlineWidth,
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

    const drawPattern = (ctx) => {
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
          ctx.moveTo(20 * sc, 10 * sc);
          ctx.lineTo(40 * sc, 10 * sc);
          ctx.lineTo(75 * sc, 90 * sc);
          ctx.lineTo(55 * sc, 90 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "save":
          ctx.fillRect(0, 0, 50 * sc, size);
          break;
        case "fastbreak":
          ctx.beginPath();
          ctx.moveTo(45 * sc, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 70 * sc);
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
          ctx.fillRect(0, 30 * sc, size, 10 * sc);
          ctx.fillRect(0, 50 * sc, size, 10 * sc);
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
          ctx.lineTo(100 * sc, 60 * sc);
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
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 50 * sc);
          ctx.quadraticCurveTo(75 * sc, 80 * sc, 50 * sc, 55 * sc);
          ctx.quadraticCurveTo(25 * sc, 80 * sc, 0, 50 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "avatar":
          ctx.beginPath();
          ctx.moveTo(55 * sc, 0);
          ctx.lineTo(67 * sc, 0);
          ctx.lineTo(22 * sc, 100 * sc);
          ctx.lineTo(10 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "league":
          ctx.fillRect(0, 0, 50 * sc, size);
          break;
        case "magic": {
          const grad = ctx.createLinearGradient(0, 0, 0, 70 * sc);
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
          ctx.moveTo(0, 60 * sc);
          ctx.lineTo(40 * sc, 100 * sc);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "score":
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "apex":
          // Shoulder Caps
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(32 * sc, 0);
          ctx.lineTo(0, 28 * sc);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(size, 0);
          ctx.lineTo(68 * sc, 0);
          ctx.lineTo(size, 28 * sc);
          ctx.closePath();
          ctx.fill();

          // Main V Chevron
          ctx.beginPath();
          ctx.moveTo(0, 33 * sc);
          ctx.lineTo(50 * sc, 53 * sc);
          ctx.lineTo(size, 33 * sc);
          ctx.lineTo(size, 45 * sc);
          ctx.lineTo(50 * sc, 65 * sc);
          ctx.lineTo(0, 45 * sc);
          ctx.closePath();
          ctx.fill();

          // Shadow Chevrons
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.beginPath();
          ctx.moveTo(0, 47 * sc);
          ctx.lineTo(50 * sc, 67 * sc);
          ctx.lineTo(size, 47 * sc);
          ctx.lineTo(size, 57 * sc);
          ctx.lineTo(50 * sc, 77 * sc);
          ctx.lineTo(0, 57 * sc);
          ctx.closePath();
          ctx.fill();

          ctx.globalAlpha = 0.1;
          ctx.beginPath();
          ctx.moveTo(0, 59 * sc);
          ctx.lineTo(50 * sc, 79 * sc);
          ctx.lineTo(size, 59 * sc);
          ctx.lineTo(size, 69 * sc);
          ctx.lineTo(50 * sc, 89 * sc);
          ctx.lineTo(0, 69 * sc);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        case "bolt":
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = pri;
          // Shoulder/armhole blue slashes
          ctx.beginPath();
          ctx.moveTo(0, 14 * sc);
          ctx.lineTo(18 * sc, 10 * sc);
          ctx.lineTo(0, 24 * sc);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(size, 14 * sc);
          ctx.lineTo(82 * sc, 10 * sc);
          ctx.lineTo(size, 24 * sc);
          ctx.closePath();
          ctx.fill();

          // Giant lightning bolt
          ctx.beginPath();
          ctx.moveTo(75 * sc, 12 * sc);
          ctx.lineTo(36 * sc, 52 * sc);
          ctx.lineTo(45 * sc, 52 * sc);
          ctx.lineTo(32 * sc, 90 * sc);
          ctx.lineTo(64 * sc, 46 * sc);
          ctx.lineTo(55 * sc, 46 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "edge":
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(50 * sc, 0);
          ctx.lineTo(50 * sc, 10 * sc);
          ctx.lineTo(46 * sc, 10 * sc);
          ctx.lineTo(46 * sc, 20 * sc);
          ctx.lineTo(50 * sc, 20 * sc);
          ctx.lineTo(50 * sc, 30 * sc);
          ctx.lineTo(46 * sc, 30 * sc);
          ctx.lineTo(46 * sc, 40 * sc);
          ctx.lineTo(50 * sc, 40 * sc);
          ctx.lineTo(50 * sc, 50 * sc);
          ctx.lineTo(46 * sc, 50 * sc);
          ctx.lineTo(46 * sc, 60 * sc);
          ctx.lineTo(50 * sc, 60 * sc);
          ctx.lineTo(50 * sc, 70 * sc);
          ctx.lineTo(46 * sc, 70 * sc);
          ctx.lineTo(46 * sc, 80 * sc);
          ctx.lineTo(50 * sc, 80 * sc);
          ctx.lineTo(50 * sc, 90 * sc);
          ctx.lineTo(46 * sc, 90 * sc);
          ctx.lineTo(46 * sc, 100 * sc);
          ctx.lineTo(0, size);
          ctx.closePath();
          ctx.fill();
          break;
        case "fusion":
          // Solid backing on the right
          ctx.beginPath();
          ctx.moveTo(66 * sc, 0);
          ctx.lineTo(size, 0);
          ctx.lineTo(size, size);
          ctx.lineTo(76 * sc, size);
          ctx.closePath();
          ctx.fill();

          // Diagonal halftone grid
          for (let x = 32; x <= 80; x += 3.3) {
            for (let y = 0; y <= 100; y += 3.3) {
              const dist = x - (45 - y * 0.15);
              if (dist > 0) {
                const r = Math.min(2.2, dist * 0.11) * sc;
                ctx.beginPath();
                ctx.arc(x * sc, y * sc, r, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
          break;
        case "horizon":
          for (let y = 98; y >= 30; y -= 3) {
            const thickness = (y - 25) * 0.04 * sc;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(0, y * sc);
            ctx.lineTo(size, y * sc);
            ctx.stroke();
          }
          break;
        case "matrix":
          for (let x = 4; x <= 96; x += 4) {
            for (let y = 96; y >= 40; y -= 4) {
              const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
              const rand = val - Math.floor(val);
              if (rand < (y - 35) / 65) {
                const sz = 3.5 * ((y - 35) / 65) * (0.5 + 0.5 * rand) * sc;
                ctx.fillRect((x - sz / (2 * sc)) * sc, (y - sz / (2 * sc)) * sc, sz, sz);
              }
            }
          }
          break;
        case "nova":
          ctx.fillStyle = sec;
          // Band 1: x + y between 82 and 86
          ctx.beginPath();
          ctx.moveTo(0, 82 * sc);
          ctx.lineTo(82 * sc, 0);
          ctx.lineTo(86 * sc, 0);
          ctx.lineTo(0, 86 * sc);
          ctx.closePath();
          ctx.fill();

          // Band 2: x + y between 96 and 100
          ctx.beginPath();
          ctx.moveTo(0, 96 * sc);
          ctx.lineTo(96 * sc, 0);
          ctx.lineTo(size, 0);
          ctx.lineTo(0, size);
          ctx.closePath();
          ctx.fill();

          // Band 3: x + y between 110 and 114
          ctx.beginPath();
          ctx.moveTo(10 * sc, size);
          ctx.lineTo(size, 10 * sc);
          ctx.lineTo(size, 14 * sc);
          ctx.lineTo(14 * sc, size);
          ctx.closePath();
          ctx.fill();

          // Corner triangle: x + y >= 124
          ctx.beginPath();
          ctx.moveTo(24 * sc, size);
          ctx.lineTo(size, 24 * sc);
          ctx.lineTo(size, size);
          ctx.closePath();
          ctx.fill();

          // Halftone dots border on the blue chest side
          [
            { c: 78, r: 1.6 },
            { c: 74, r: 1.1 },
            { c: 70, r: 0.7 },
            { c: 66, r: 0.4 }
          ].forEach(({ c, r }) => {
            for (let t = 0; t <= c; t += 4.5) {
              const x = t;
              const y = c - t;
              if (y >= 0 && y <= 100) {
                ctx.beginPath();
                ctx.arc(x * sc, y * sc, r * sc, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
          break;
        case "pulse":
          ctx.fillStyle = sec;
          ctx.fillRect(0, 0, size, size);

          ctx.fillStyle = pri;
          for (let x = 28; x <= 72; x += 1.8) {
            const dx = Math.abs(x - 50);
            const env = dx > 15 ? Math.max(0, 1 - (dx - 15) / 7.0) : 1.0;
            const h = env * 80 * Math.pow(0.955, dx) * (0.6 + 0.4 * Math.abs(Math.cos(dx * 0.08)));
            const w = 1.0;
            ctx.beginPath();
            ctx.moveTo((x - w) * sc, size);
            ctx.lineTo((x + w) * sc, size);
            ctx.lineTo(x * sc, (100 - h) * sc);
            ctx.closePath();
            ctx.fill();
          }
          break;
        case "summit":
          ctx.fillStyle = sec;

          // Main peak with solid bottom base
          ctx.beginPath();
          ctx.moveTo(0, 85 * sc);
          ctx.lineTo(15 * sc, 85 * sc);
          ctx.lineTo(25 * sc, 78 * sc);
          ctx.lineTo(23 * sc, 80 * sc);
          ctx.lineTo(35 * sc, 71 * sc);
          ctx.lineTo(33 * sc, 73 * sc);
          ctx.lineTo(50 * sc, 60 * sc);
          ctx.lineTo(67 * sc, 73 * sc);
          ctx.lineTo(65 * sc, 71 * sc);
          ctx.lineTo(77 * sc, 80 * sc);
          ctx.lineTo(75 * sc, 78 * sc);
          ctx.lineTo(85 * sc, 85 * sc);
          ctx.lineTo(size, 85 * sc);
          ctx.lineTo(size, size);
          ctx.lineTo(0, size);
          ctx.closePath();
          ctx.fill();

          // Hollow chevron peak 2
          ctx.beginPath();
          ctx.moveTo(20 * sc, 78 * sc);
          ctx.lineTo(32 * sc, 65 * sc);
          ctx.lineTo(30 * sc, 67 * sc);
          ctx.lineTo(42 * sc, 54 * sc);
          ctx.lineTo(40 * sc, 56 * sc);
          ctx.lineTo(50 * sc, 49 * sc);
          ctx.lineTo(60 * sc, 56 * sc);
          ctx.lineTo(58 * sc, 54 * sc);
          ctx.lineTo(68 * sc, 67 * sc);
          ctx.lineTo(66 * sc, 65 * sc);
          ctx.lineTo(80 * sc, 78 * sc);
          ctx.lineTo(80 * sc, 82 * sc);
          ctx.lineTo(66 * sc, 71 * sc);
          ctx.lineTo(68 * sc, 69 * sc);
          ctx.lineTo(58 * sc, 60 * sc);
          ctx.lineTo(60 * sc, 58 * sc);
          ctx.lineTo(50 * sc, 54 * sc);
          ctx.lineTo(40 * sc, 58 * sc);
          ctx.lineTo(42 * sc, 60 * sc);
          ctx.lineTo(32 * sc, 69 * sc);
          ctx.lineTo(30 * sc, 71 * sc);
          ctx.lineTo(20 * sc, 82 * sc);
          ctx.closePath();
          ctx.fill();

          // Hollow chevron peak 3
          ctx.beginPath();
          ctx.moveTo(25 * sc, 70 * sc);
          ctx.lineTo(36 * sc, 58 * sc);
          ctx.lineTo(34 * sc, 60 * sc);
          ctx.lineTo(50 * sc, 42 * sc);
          ctx.lineTo(66 * sc, 60 * sc);
          ctx.lineTo(64 * sc, 58 * sc);
          ctx.lineTo(75 * sc, 70 * sc);
          ctx.lineTo(75 * sc, 74 * sc);
          ctx.lineTo(64 * sc, 62 * sc);
          ctx.lineTo(66 * sc, 60 * sc);
          ctx.lineTo(50 * sc, 47 * sc);
          ctx.lineTo(34 * sc, 60 * sc);
          ctx.lineTo(36 * sc, 62 * sc);
          ctx.lineTo(25 * sc, 74 * sc);
          ctx.closePath();
          ctx.fill();

          // Loose rock shards
          [
            [12, 83, 18, 78, 15, 85],
            [28, 64, 32, 58, 30, 67],
            [88, 83, 82, 78, 85, 85],
            [72, 64, 68, 58, 70, 67],
            [48, 51, 52, 51, 50, 54]
          ].forEach(([x1, y1, x2, y2, x3, y3]) => {
            ctx.beginPath();
            ctx.moveTo(x1 * sc, y1 * sc);
            ctx.lineTo(x2 * sc, y2 * sc);
            ctx.lineTo(x3 * sc, y3 * sc);
            ctx.closePath();
            ctx.fill();
          });
          break;
        case "tempo":
          ctx.fillStyle = sec;
          ctx.strokeStyle = sec;
          ctx.lineCap = "butt";

          // Draw the 8 lines
          [
            [58, 0.6],
            [64, 1.0],
            [70, 1.6],
            [76, 2.4],
            [83, 3.6],
            [91, 5.2],
            [100, 7.5],
            [110, 11.0]
          ].forEach(([c, w]) => {
            ctx.lineWidth = w * sc;
            ctx.beginPath();
            ctx.moveTo(0, c * sc);
            ctx.lineTo(size, (c - 40) * sc);
            ctx.stroke();
          });

          // Draw solid corner polygon
          ctx.beginPath();
          ctx.moveTo(45 * sc, size);
          ctx.lineTo(size, 78 * sc);
          ctx.lineTo(size, size);
          ctx.closePath();
          ctx.fill();
          break;
        case "titan":
          ctx.fillStyle = sec;
          ctx.fillRect(0, 0, size, size);

          ctx.fillStyle = pri;
          // Center stripe
          ctx.fillRect(45 * sc, 0, 10 * sc, size);

          // Left side stripe
          ctx.beginPath();
          ctx.moveTo(41 * sc, 0);
          ctx.lineTo(43 * sc, 0);
          ctx.lineTo(43 * sc, 60 * sc);
          ctx.lineTo(41 * sc, 64 * sc);
          ctx.lineTo(41 * sc, size);
          ctx.lineTo(37 * sc, size);
          ctx.lineTo(37 * sc, 64 * sc);
          ctx.lineTo(41 * sc, 60 * sc);
          ctx.closePath();
          ctx.fill();

          // Right side stripe
          ctx.beginPath();
          ctx.moveTo(57 * sc, 0);
          ctx.lineTo(59 * sc, 0);
          ctx.lineTo(59 * sc, 60 * sc);
          ctx.lineTo(63 * sc, 64 * sc);
          ctx.lineTo(63 * sc, size);
          ctx.lineTo(59 * sc, size);
          ctx.lineTo(59 * sc, 64 * sc);
          ctx.lineTo(57 * sc, 60 * sc);
          ctx.closePath();
          ctx.fill();

          // Left/right side accent lines
          ctx.save();
          ctx.strokeStyle = pri;
          ctx.lineWidth = 0.8 * sc;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(37 * sc, 35 * sc);
          ctx.lineTo(37 * sc, 58 * sc);
          ctx.moveTo(63 * sc, 35 * sc);
          ctx.lineTo(63 * sc, 58 * sc);
          ctx.stroke();
          ctx.restore();

          // Shoulder stripes
          ctx.beginPath();
          ctx.moveTo(0, 10 * sc);
          ctx.lineTo(24 * sc, 0);
          ctx.lineTo(32 * sc, 0);
          ctx.lineTo(0, 16 * sc);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(size, 10 * sc);
          ctx.lineTo(76 * sc, 0);
          ctx.lineTo(68 * sc, 0);
          ctx.lineTo(size, 16 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "zenith":
          {
            const grad = ctx.createLinearGradient(0, 10 * sc, 0, 80 * sc);
            grad.addColorStop(0, sec);
            grad.addColorStop(1, "transparent");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2 * sc;
            ctx.lineCap = "round";
            for (let x = 28; x <= 72; x += 4) {
              const dx = Math.min(x - 28, 72 - x);
              ctx.globalAlpha = dx < 8 ? (0.2 + (dx / 8) * 0.8) : 1.0;
              ctx.beginPath();
              ctx.moveTo(x * sc, 10 * sc);
              ctx.lineTo(x * sc, 80 * sc);
              ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
          }
          break;
        case "ignite": {
          // Primary background
          ctx.fillStyle = pri;
          ctx.fillRect(0, 0, size, size);

          // Helper: 2 quadratic curves, all x strictly 30..70
          const drawQ = (x0, cx1, cy1, px, py, cx2, cy2, x1) => {
            ctx.beginPath();
            ctx.moveTo(x0 * sc, size);
            ctx.quadraticCurveTo(cx1 * sc, cy1 * sc, px * sc, py * sc);
            ctx.quadraticCurveTo(cx2 * sc, cy2 * sc, x1 * sc, size);
            ctx.closePath();
            ctx.fill();
          };

          // Background flames (semi-transparent)
          ctx.fillStyle = sec;
          ctx.save();
          ctx.globalAlpha = 0.45;
          drawQ(30, 32, 82, 33, 72, 34, 82, 36);
          drawQ(37, 41, 75, 44, 58, 48, 75, 51);
          drawQ(50, 54, 74, 57, 57, 61, 74, 64);
          drawQ(64, 66, 82, 67, 72, 68, 82, 70);
          ctx.restore();

          // Foreground flames (solid)
          ctx.fillStyle = sec;
          drawQ(30, 31, 92, 32, 88, 33, 92, 34);
          drawQ(34, 36, 85, 38, 76, 40, 85, 42);
          drawQ(40, 42, 80, 44, 65, 47, 80, 49);
          drawQ(47, 49, 88, 50, 83, 51, 88, 53);
          drawQ(52, 55, 79, 58, 63, 62, 79, 65);
          drawQ(62, 64, 85, 65, 77, 67, 85, 68);
          drawQ(67, 68, 92, 69, 88, 69, 92, 70);
          break;
        }
        case "kinetic":
          ctx.beginPath();
          ctx.moveTo(0, 60 * sc);
          ctx.lineTo(0, 80 * sc);
          ctx.lineTo(80 * sc, 0);
          ctx.lineTo(60 * sc, 0);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(20 * sc, size);
          ctx.lineTo(35 * sc, size);
          ctx.lineTo(size, 35 * sc);
          ctx.lineTo(size, 20 * sc);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(0, 25 * sc);
          ctx.lineTo(0, 40 * sc);
          ctx.lineTo(40 * sc, 0);
          ctx.lineTo(25 * sc, 0);
          ctx.closePath();
          ctx.fill();
          break;
        case "legacy":
          ctx.fillRect(0, 0, 50 * sc, 50 * sc);
          ctx.fillRect(50 * sc, 50 * sc, 50 * sc, 50 * sc);
          break;
        case "momentum":
          ctx.beginPath();
          ctx.moveTo(0, 50 * sc);
          ctx.lineTo(0, 65 * sc);
          ctx.lineTo(65 * sc, 0);
          ctx.lineTo(50 * sc, 0);
          ctx.closePath();
          ctx.fill();
          ctx.lineWidth = 3 * sc;
          ctx.beginPath();
          ctx.moveTo(0, 31 * sc);
          ctx.lineTo(31 * sc, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(16 * sc, size);
          ctx.lineTo(size, 16 * sc);
          ctx.stroke();
          break;
        case "obsidian":
          ctx.save();
          ctx.fillStyle = sec;
          ctx.fillRect(0, 0, size, size);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.lineWidth = 6 * sc;
          for (let i = 0; i < 5; i++) {
            const y = 5 + i * 15;
            ctx.beginPath();
            ctx.moveTo(-10 * sc, y * sc);
            ctx.lineTo(50 * sc, (y + 20) * sc);
            ctx.lineTo(110 * sc, y * sc);
            ctx.stroke();
          }
          ctx.restore();
          break;
        case "phantom":
          {
            const blobs = [
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
            ctx.save();
            ctx.fillStyle = sec;
            ctx.globalAlpha = 0.5;
            blobs.forEach((b) => {
              ctx.beginPath();
              ctx.arc(b.cx * sc, b.cy * sc, b.r * sc, 0, Math.PI * 2);
              ctx.fill();
            });
            [[20, 45, 3], [35, 20, 2], [70, 65, 4], [50, 90, 3], [85, 40, 2]].forEach(([cx, cy, r]) => {
              ctx.beginPath();
              ctx.arc(cx * sc, cy * sc, r * sc, 0, Math.PI * 2);
              ctx.fill();
            });
            ctx.restore();
          }
          break;
        case "stride":
          ctx.beginPath();
          ctx.moveTo(60 * sc, 10 * sc);
          ctx.lineTo(80 * sc, 10 * sc);
          ctx.lineTo(50 * sc, 90 * sc);
          ctx.lineTo(30 * sc, 90 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        default:
          break;
      }
      ctx.restore();
    };

    const drawFabricPattern = (
      ctx,
      patternName,
      isFront,
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

        const hexToRgb = (hex) => {
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

    const drawSublimatedPattern = (ctx, patternName, color, isBackSide) => {
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
        const drawShard = (x, y, rSize, col) => {
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

        const drawGrungeTriangles = (areaX, areaW, count, seedOffset) => {
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
      const sideTextLayers = state.textLayers.filter((l) => l.side === side);
      const sideLogoLayers = state.logoLayers.filter((l) => l.side === side);

      const activeSideLayers = [
        ...sideTextLayers.map((l) => ({ ...l, layerType: "text" })),
        ...sideLogoLayers.map((l) => ({ ...l, layerType: "logo" })),
      ];

      const sortedLayers = [...activeSideLayers].sort((a, b) => {
        const idxA = state.layersOrder.indexOf(a.id);
        const idxB = state.layersOrder.indexOf(b.id);
        const getPriority = (l) => {
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
            layer.textSize * (layer.scale || 1.0),
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
      const sideTextLayers = state.textLayers.filter((l) => l.side === side);
      const sideLogoLayers = state.logoLayers.filter((l) => l.side === side);

      const activeSideLayers = [
        ...sideTextLayers.map((l) => ({ ...l, layerType: "text" })),
        ...sideLogoLayers.map((l) => ({ ...l, layerType: "logo" })),
      ];

      const sortedLayers = [...activeSideLayers].sort((a, b) => {
        const idxA = state.layersOrder.indexOf(a.id);
        const idxB = state.layersOrder.indexOf(b.id);
        const getPriority = (l) => {
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
            layer.textSize * (layer.scale || 1.0),
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

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Logo Decal Component ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function LogoDecal({
  layer,
  loadedLogoImages,
  roughness,
  fabricConfig,
  glbModel,
}) {
  const img = loadedLogoImages[layer.src];
  const [logoTexture, setLogoTexture] = useState(null);
  const [aspect, setAspect] = useState(1.0);

  useEffect(() => {
    if (!img) return;
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
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

    const imgW = img.naturalWidth || img.width || 200;
    const imgH = img.naturalHeight || img.height || 200;
    const finalSizeX = (imgW * layer.scale / canvasSize) * meshWidth;
    const finalSizeY = (imgH * layer.scale / canvasSize) * meshWidth; // same base ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ no stretch

    // Map 2D visual editor position (0-1024) to relative X/Y coordinate (-0.5 to 0.5)
    const relativeX = (layer.x - canvasSize / 2) / canvasSize;
    const relativeY = -(layer.y - canvasSize / 2) / canvasSize;

    // Cylinder mapping radius (tuned to match shirt bounds in 3D space)
    const Rx = 0.23;
    const Rz = 0.155;

    // Calculate cylinder angle (theta) based on layer.x and side
    let theta = 0;
    if (layer.side === "Back") {
      // Back side continues the cylinder wrapping
      theta = Math.PI + relativeX * Math.PI;
    } else {
      theta = relativeX * Math.PI;
    }

    // Cylindrical surface position
    let posX = Rx * Math.sin(theta);
    let posY = relativeY * meshHeight;
    let posZ = Rz * Math.cos(theta);

    // Dynamic rotation matches surface normal of the cylinder
    let rotY = theta;

    // Apply offset for collar model geometry scale/translation
    const isCollarModel = glbModel === "/models/collar_jersey.glb";
    if (isCollarModel) {
      posY += -0.05;
      posZ += 0.005;
    }

    return {
      position: [posX, posY, posZ],
      rotation: [0, rotY, -(layer.rotation * Math.PI) / 180],
      scale: [finalSizeX, finalSizeY, 0.3], // 0.3 depth is safe from back duplication
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
        color="#ffffff"
        map={logoTexture}
        transparent
        alphaTest={0.002}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-10}
        roughness={1.0}
        metalness={0.0}
        normalMap={fabricConfig.normalMap || undefined}
        normalScale={fabricConfig.normalScale}
        envMapIntensity={0.0}
      />
    </Decal>
  );
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Image (Wrap/BG) Decal Component ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Projects uploaded Wrap/BG images as full-body decals matching patternFront/Back.
// The image is redrawn on an off-screen canvas whenever the user changes
// position, scale, rotation or opacity ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â so the 3D jersey stays in sync with
// the visual editor in real time.
function ImageDecal({
  layer,
  loadedLogoImages,
  roughness,
  fabricConfig,
  glbModel,
}) {
  const img = loadedLogoImages[layer.src];
  const [imageTexture, setImageTexture] = useState(null);

  useEffect(() => {
    if (!img) return;

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Draw the image onto an off-screen 1024ÃƒÆ’Ã¢â‚¬â€1024 canvas ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    // The canvas coordinate system matches the visual editor exactly:
    //   (layer.x, layer.y) is the image centre, scale is a multiplier on
    //   the image's natural dimensions, rotation is in degrees.
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgW = img.naturalWidth || img.width || 200;
    const imgH = img.naturalHeight || img.height || 200;
    const opacity = typeof layer.opacity === "number" ? layer.opacity : 1.0;

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Scale decoupling + aspect ratio correction ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    // The decal box is 0.54 wide ÃƒÆ’Ã¢â‚¬â€ 0.7 tall. A 1024ÃƒÆ’Ã¢â‚¬â€1024 square canvas
    // projected onto this non-square decal STRETCHES content vertically by
    // 0.7/0.54 ÃƒÂ¢Ã¢â‚¬Â°Ã‹â€  1.3ÃƒÆ’Ã¢â‚¬â€. We pre-compensate by drawing the image WIDER on the
    // canvas by the same factor: scaleX = drawScale / meshDecalAspectRatio.
    // The decal then compresses it back to the correct proportions on the jersey.
    //
    // Effective horizontal canvas space = 1024 ÃƒÆ’Ã¢â‚¬â€ (0.54/0.7) ÃƒÂ¢Ã¢â‚¬Â°Ã‹â€  790 px.
    // coverScale uses this effective width so that both axes fill together.
    //
    // drawScale = (layer.scale / containScale) ÃƒÆ’Ã¢â‚¬â€ coverScale
    //
    // At initial upload : layer.scale = containScale ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ drawScale = coverScale ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ full fill ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦
    // User scales up 2ÃƒÆ’Ã¢â‚¬â€ : drawScale = 2ÃƒÆ’Ã¢â‚¬â€coverScale ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ still fills ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦
    // User scales down Ãƒâ€šÃ‚Â½: drawScale = Ãƒâ€šÃ‚Â½ÃƒÆ’Ã¢â‚¬â€coverScale ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ partial fill (expected) ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦
    // Proportions       : image always appears with its natural aspect ratio ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦
    const meshDecalAspectRatio = 0.54 / 0.7;           // ÃƒÂ¢Ã¢â‚¬Â°Ã‹â€  0.7714
    const effectiveW = 1024 * meshDecalAspectRatio;  // ÃƒÂ¢Ã¢â‚¬Â°Ã‹â€  790 px effective horizontal space
    const containScale = Math.min(1024 / imgW, 1024 / imgH) || 1;  // visual editor display scale
    const coverScale = Math.max(effectiveW / imgW, 1024 / imgH) || 1; // fill both axes correctly
    const scaleFactor = layer.scale / containScale;
    const drawScale = coverScale * scaleFactor;

    ctx.clearRect(0, 0, 1024, 1024);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalAlpha = opacity;
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(drawScale / meshDecalAspectRatio, drawScale); // wider X pre-compensates decal's horizontal compression

    // Handle eraser paths the same way the visual editor does
    if ((layer).eraserPaths && (layer).eraserPaths.length > 0) {
      const tmp = document.createElement("canvas");
      tmp.width = imgW;
      tmp.height = imgH;
      const tCtx = tmp.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(img, 0, 0, imgW, imgH);
        tCtx.globalCompositeOperation = "destination-out";
        tCtx.lineCap = "round";
        tCtx.lineJoin = "round";
        tCtx.strokeStyle = "rgba(0,0,0,1)";
        (layer).eraserPaths.forEach((path) => {
          tCtx.lineWidth = path.size;
          tCtx.beginPath();
          path.points.forEach((pt, i) => {
            if (i === 0) tCtx.moveTo(pt.x, pt.y);
            else tCtx.lineTo(pt.x, pt.y);
          });
          tCtx.stroke();
        });
        ctx.drawImage(tmp, -imgW / 2, -imgH / 2, imgW, imgH);
      } else {
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
      }
    } else {
      ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
    }
    ctx.restore();

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Create a CanvasTexture from the rendered canvas ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.needsUpdate = true;

    setImageTexture((prev) => {
      if (prev) prev.dispose();   // free GPU memory of the old texture
      return tex;
    });

    return () => { tex.dispose(); };
  }, [img, layer.src, layer.x, layer.y, layer.scale, layer.rotation, layer.opacity, (layer).eraserPaths]);

  if (!imageTexture) return null;

  const isCollar = glbModel === "/models/collar_jersey.glb";
  const showFront = layer.side === "Front" || layer.side === "Both";
  const showBack = layer.side === "Back" || layer.side === "Both";

  // Mirror patternFront/patternBack position expressions exactly:
  //   y: 0.0 + (isCollar ? -0.05 : 0.0)
  //   z: Ãƒâ€šÃ‚Â±0.155 + (isCollar ? -0.02 : 0.0)
  return (
    <>
      {showFront && (
        <Decal
          position={[
            0,
            0.0 + (isCollar ? -0.05 : 0.0),
            0.155 + (isCollar ? -0.02 : 0.0),
          ]}
          rotation={[0, 0, 0]}
          scale={[0.54, 0.7, 0.309]}
          renderOrder={5}
        >
          <meshStandardMaterial
            color="#ffffff"
            map={imageTexture}
            transparent
            alphaTest={0.01}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-5}
            roughness={1.0}
            metalness={0.0}
            normalMap={fabricConfig.normalMap || undefined}
            normalScale={fabricConfig.normalScale}
            envMapIntensity={0.0}
          />
        </Decal>
      )}
      {showBack && (
        <Decal
          position={[
            0,
            0.0 + (isCollar ? -0.05 : 0.0),
            -0.155 + (isCollar ? -0.02 : 0.0),
          ]}
          rotation={[0, Math.PI, 0]}
          scale={[0.54, 0.7, 0.309]}
          renderOrder={6}
        >
          <meshStandardMaterial
            color="#ffffff"
            map={imageTexture}
            transparent
            alphaTest={0.01}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-5}
            roughness={1.0}
            metalness={0.0}
            normalMap={fabricConfig.normalMap || undefined}
            normalScale={fabricConfig.normalScale}
            envMapIntensity={0.0}
          />
        </Decal>
      )}
    </>
  );
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Main Jersey3D Component ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
export function Jersey3D({
  colors,
  collar,
  texturesRef,
}) {
  const glbPath = colors.glbModel || "/models/shirt_baked.glb";
  const { nodes } = useGLTF(glbPath);

  // Find the mesh geometry dynamically from nodes to support multiple apparel models
  const meshNode = nodes.T_Shirt_male || nodes.mesh_node || Object.values(nodes).find((n) => n.isMesh || n.type === "Mesh");

  // Create a scaled clone of the geometry so both models share the exact same scale, coordinates, and positions
  const shirtGeometry = useMemo(() => {
    if (!meshNode?.geometry) return null;
    const geo = meshNode.geometry.clone();

    // Ensure vertex normals exist
    if (!geo.attributes.normal) {
      geo.computeVertexNormals();
    }

    // Scale collar model to match no-collar T-Shirt model boundaries
    if (glbPath === "/models/collar_jersey.glb") {
      geo.scale(0.33, 0.33, 0.33);
      geo.translate(0, -0.05, 0.005);

      // Generate UV coordinates procedurally using cylindrical projection since this GLB lacks UVs
      const posAttr = geo.attributes.position;
      const count = posAttr.count;
      const uvs = new Float32Array(count * 2);

      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < count; i++) {
        const y = posAttr.getY(i);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const height = maxY - minY || 1;

      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);

        // Cylindrical mapping
        const angle = Math.atan2(z, x); // -PI to PI
        const u = (angle + Math.PI) / (2 * Math.PI);
        const v = (y - minY) / height;

        uvs[i * 2] = u;
        uvs[i * 2 + 1] = v;
      }
      geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    } else {
      // Ensure UV coordinates exist
      if (!geo.attributes.uv) {
        const count = geo.attributes.position.count;
        const uvs = new Float32Array(count * 2);
        geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
      }
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
  const [logoTexture, setLogoTexture] = useState(null);
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
    const isCollarModel = glbPath === "/models/collar_jersey.glb";
    if (isCollarModel) {
      posY += -0.05;
      posZ += 0.005;
    }

    return {
      position: [posX, posY, posZ],
      rotation: [0, rotY, 0],
      scale: [scaleX, scaleY, 0.2],
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
            position={[0, 0.0 + (glbPath === "/models/collar_jersey.glb" ? -0.05 : 0.0), 0.155 + (glbPath === "/models/collar_jersey.glb" ? -0.02 : 0.0)]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.7, 0.309]}
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
            position={[0, 0.0 + (glbPath === "/models/collar_jersey.glb" ? -0.05 : 0.0), -0.155 + (glbPath === "/models/collar_jersey.glb" ? -0.02 : 0.0)]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.7, 0.309]}
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
            position={[0, 0.0 + (glbPath === "/models/collar_jersey.glb" ? -0.05 : 0.0), 0.155 + (glbPath === "/models/collar_jersey.glb" ? -0.02 : 0.0)]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.7, 0.309]}
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
            position={[0, 0.0 + (glbPath === "/models/collar_jersey.glb" ? -0.05 : 0.0), -0.155 + (glbPath === "/models/collar_jersey.glb" ? -0.02 : 0.0)]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.7, 0.309]}
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
              glbPath === "/models/collar_jersey.glb"
                ? [0.0, 0.125, 0.123]
                : [0.0, 0.185, 0.118]
            }
            rotation={[0.15, 0, 0]}
            scale={
              glbPath === "/models/collar_jersey.glb"
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
          .filter((l) => l.type === "logo" || !l.type)
          .map((layer) => (
            <LogoDecal
              key={layer.id}
              layer={layer}
              loadedLogoImages={colors.loadedLogoImages || {}}
              roughness={roughness}
              fabricConfig={fabricConfig}
              glbModel={glbPath}
            />
          ))}

        {/* Wrap/BG uploads ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â full-body decals identical in size to patternFront/patternBack */}
        {(colors.logoLayers || [])
          .filter((l) => l.type === "image")
          .map((layer) => (
            <ImageDecal
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
        <group position={[0, glbPath === "/models/collar_jersey.glb" ? -0.05 : 0.0, glbPath === "/models/collar_jersey.glb" ? 0.005 : 0.0]}>
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
useGLTF.preload("/models/collar_jersey.glb");





