"use client";

import React, { useRef } from "react";
import {
  Type,
  Trash2,
  Copy,
} from "lucide-react";
import { useCustomizerStore } from "./store";
import { getFontFamily, getFontWeight, getFontStyle } from "./types";

export function TabText() {
  const activeSide = useCustomizerStore((s) => s.activeSide);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const selectedLayerId = useCustomizerStore((s) => s.selectedLayerId);
  const selectedLayerIds = useCustomizerStore((s) => s.selectedLayerIds || []);
  const currentView = useCustomizerStore((s) => s.currentView);

  const updateState = useCustomizerStore((s) => s.updateState);
  const setTextLayers = useCustomizerStore((s) => s.setTextLayers);
  const setLogoLayers = useCustomizerStore((s) => s.setLogoLayers);
  const setSelectedLayerId = useCustomizerStore((s) => s.setSelectedLayerId);
  const setCurrentView = useCustomizerStore((s) => s.setCurrentView);
  const handleCopy = useCustomizerStore((s) => s.handleCopy);
  const handleDelete = useCustomizerStore((s) => s.handleDelete);
  const handleAddCustomText = useCustomizerStore((s) => s.handleAddCustomText);

  const [activeGuides, setActiveGuides] = React.useState({ vertical: null, horizontal: null });
  const [isDragging, setIsDragging] = React.useState(false);

  const editorWidth = 280;
  const canvasSize = 1024;
  const editorScale = editorWidth / canvasSize; // 0.2734

  const handleDragStart = (e, id) => {
    e.preventDefault();

    // Check if the clicked layer is already part of the active selection
    const { selectedLayerIds: currentSelection } = useCustomizerStore.getState();
    const isSelected = currentSelection.includes(id);

    // If not selected, make it the only selected layer
    if (!isSelected) {
      setSelectedLayerId(id);
    }

    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    // Capture starting positions of all layers in the selection
    const activeSelection = !isSelected ? [id] : currentSelection;
    const startPositions = {};

    activeSelection.forEach((layerId) => {
      const textL = textLayers.find((l) => l.id === layerId);
      if (textL) {
        startPositions[layerId] = { x: textL.x, y: textL.y, type: "text" };
      } else {
        const logoL = logoLayers.find((l) => l.id === layerId);
        if (logoL) {
          startPositions[layerId] = { x: logoL.x, y: logoL.y, type: "logo" };
        }
      }
    });

    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const startX = startPositions[id].x;
    const startY = startPositions[id].y;

    const getTextSizeInCanvasUnits = (l) => {
      const lines = l.text.split("\n");
      const baseFontSize = l.textSize * (l.scale || 1.0);
      const letterSpacing = l.letterSpacing || 0;
      const lineSpacing = l.lineSpacing || 1.15;

      const lineTotalWidths = lines.map((line) => {
        const chars = Array.from(line);
        const charWidths = chars.map((c) => {
          if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ") return baseFontSize * 0.25;
          if (c === "M" || c === "W" || c === "m" || c === "w") return baseFontSize * 0.8;
          return baseFontSize * 0.55;
        });
        return charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing;
      });

      const width = Math.max(...lineTotalWidths);
      const height = lines.length * baseFontSize * lineSpacing;
      return { width, height };
    };

    const { width, height } = getTextSizeInCanvasUnits(layer);

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / editorScale;
      const deltaY = (moveEvent.clientY - startMouseY) / editorScale;

      let targetX = startX + deltaX;
      let targetY = startY + deltaY;

      const targetLeft = targetX - width / 2;
      const targetRight = targetX + width / 2;
      const targetTop = targetY - height / 2;
      const targetBottom = targetY + height / 2;

      let verticalGuide = null;
      let horizontalGuide = null;
      const snapThreshold = 25; // canvas pixels

      // Snapping left/right edges or center
      if (Math.abs(targetLeft - 150) < snapThreshold) {
        targetX = 150 + width / 2;
        verticalGuide = { coordinate: 150, label: "Left Border" };
      } else if (Math.abs(targetRight - 874) < snapThreshold) {
        targetX = 874 - width / 2;
        verticalGuide = { coordinate: 874, label: "Right Border" };
      } else if (Math.abs(targetX - 512) < snapThreshold) {
        targetX = 512;
        verticalGuide = { coordinate: 512, label: "Center" };
      }

      // Snapping top/bottom edges or center
      if (Math.abs(targetTop - 150) < snapThreshold) {
        targetY = 150 + height / 2;
        horizontalGuide = { coordinate: 150, label: "Top Border" };
      } else if (Math.abs(targetBottom - 874) < snapThreshold) {
        targetY = 874 - height / 2;
        horizontalGuide = { coordinate: 874, label: "Bottom Border" };
      } else if (Math.abs(targetY - 512) < snapThreshold) {
        targetY = 512;
        horizontalGuide = { coordinate: 512, label: "Center" };
      }

      // Snap to other text layers if not already snapped
      if (verticalGuide === null) {
        const otherTexts = textLayers.filter((l) => l.id !== id && l.side === activeSide);
        for (const other of otherTexts) {
          if (Math.abs(targetX - other.x) < snapThreshold) {
            targetX = other.x;
            verticalGuide = { coordinate: other.x, label: "Align" };
            break;
          }
        }
      }

      if (horizontalGuide === null) {
        const otherTexts = textLayers.filter((l) => l.id !== id && l.side === activeSide);
        for (const other of otherTexts) {
          if (Math.abs(targetY - other.y) < snapThreshold) {
            targetY = other.y;
            horizontalGuide = { coordinate: other.y, label: "Align" };
            break;
          }
        }
      }

      // Snap to logo layers if not already snapped
      if (verticalGuide === null) {
        const otherLogos = logoLayers.filter((l) => l.side === activeSide);
        for (const other of otherLogos) {
          if (Math.abs(targetX - other.x) < snapThreshold) {
            targetX = other.x;
            verticalGuide = { coordinate: other.x, label: "Align" };
            break;
          }
        }
      }

      if (horizontalGuide === null) {
        const otherLogos = logoLayers.filter((l) => l.side === activeSide);
        for (const other of otherLogos) {
          if (Math.abs(targetY - other.y) < snapThreshold) {
            targetY = other.y;
            horizontalGuide = { coordinate: other.y, label: "Align" };
            break;
          }
        }
      }

      setActiveGuides({ vertical: verticalGuide, horizontal: horizontalGuide });

      const finalDeltaX = targetX - startX;
      const finalDeltaY = targetY - startY;

      setTextLayers((prev) =>
        prev.map((l) => {
          if (startPositions[l.id] && startPositions[l.id].type === "text") {
            const startPos = startPositions[l.id];
            return {
              ...l,
              x: Math.max(0, Math.min(1024, startPos.x + finalDeltaX)),
              y: Math.max(0, Math.min(1024, startPos.y + finalDeltaY)),
            };
          }
          return l;
        })
      );

      setLogoLayers((prev) =>
        prev.map((l) => {
          if (startPositions[l.id] && startPositions[l.id].type === "logo") {
            const startPos = startPositions[l.id];
            return {
              ...l,
              x: Math.max(0, Math.min(1024, startPos.x + finalDeltaX)),
              y: Math.max(0, Math.min(1024, startPos.y + finalDeltaY)),
            };
          }
          return l;
        })
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveGuides({ vertical: null, horizontal: null });
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleRotateStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = (e.currentTarget).parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX);
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX
      );
      const angleDiff = currentAngle - startAngle;
      let newRotation = startRotation + angleDiff * (180 / Math.PI);
      newRotation = ((newRotation % 360) + 360) % 360;

      setTextLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleScaleStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = (e.currentTarget).parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDist = Math.sqrt(
      Math.pow(startMouseX - centerX, 2) + Math.pow(startMouseY - centerY, 2)
    );
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent) => {
      const curDist = Math.sqrt(
        Math.pow(moveEvent.clientX - centerX, 2) +
          Math.pow(moveEvent.clientY - centerY, 2)
      );
      const newScale = Math.max(0.2, Math.min(5.0, startScale * (curDist / startDist)));

      setTextLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const renderTextLayer = (layer, isHidden = false, children) => {
    const isOutline = layer.font === "Outline";
    const letterSpacing = layer.letterSpacing || 0;
    const lineSpacing = layer.lineSpacing || 1.15;
    const curveVal = layer.curveRadius || 0;
    const fontSize = layer.textSize * layer.scale * editorScale;

    const baseStyle = {
      position: "relative",
      padding: "6px 10px",
      fontFamily: getFontFamily(layer.font),
      fontWeight: getFontWeight(layer.font),
      fontStyle: getFontStyle(layer.font),
      userSelect: "none",
      visibility: isHidden ? "hidden" : "visible",
    };

    if (curveVal === 0) {
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: `${fontSize}px`,
            whiteSpace: "pre-line",
            textAlign: "center",
            letterSpacing: `${letterSpacing * editorScale}px`,
            lineHeight: lineSpacing,
            WebkitTextStroke:
              layer.outlineEnabled && layer.outlineWidth
                ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#FFFFFF"}`
                : isOutline
                ? `1px ${layer.color}`
                : "none",
            color: isOutline ? "transparent" : layer.color,
            textShadow: layer.shadowEnabled
              ? `${(layer.shadowOffsetX ?? 4) * editorScale}px ${(layer.shadowOffsetY ?? 4) * editorScale}px ${(layer.shadowBlur ?? 10) * editorScale}px ${layer.shadowColor || "#000000"}`
              : undefined,
          }}
        >
          {layer.text}
          {children}
        </div>
      );
    }

    const lines = layer.text.split("\n");
    const lineSpacingHeight = fontSize * lineSpacing;
    const totalHeight = (lines.length - 1) * lineSpacingHeight;
    const verticalOffset = -totalHeight / 2;

    const lineTotalWidths = lines.map((line) => {
      const chars = Array.from(line);
      const charWidths = chars.map((c) => {
        if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ") return fontSize * 0.25;
        if (c === "M" || c === "W" || c === "m" || c === "w") return fontSize * 0.8;
        return fontSize * 0.55;
      });
      return charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing * editorScale;
    });

    const maxLineWidth = Math.max(...lineTotalWidths);

    return (
      <div
        style={{
          ...baseStyle,
          position: "relative",
          width: `${maxLineWidth}px`,
          height: `${totalHeight + fontSize}px`,
        }}
      >
        {lines.map((line, lineIndex) => {
          const curY = verticalOffset + lineIndex * lineSpacingHeight;
          const chars = Array.from(line);

          const charWidths = chars.map((c) => {
            if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ") return fontSize * 0.25;
            if (c === "M" || c === "W" || c === "m" || c === "w") return fontSize * 0.8;
            return fontSize * 0.55;
          });

          const lineTotalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing * editorScale;
          const totalAngle = (curveVal * Math.PI) / 180;
          const R = lineTotalWidth / totalAngle;
          let currentS = 0;

          return (
            <div
              key={lineIndex}
              style={{
                position: "absolute",
                width: "100%",
                height: `${fontSize}px`,
                top: `calc(50% + ${curY}px)`,
                left: 0,
              }}
            >
              {chars.map((char, charIdx) => {
                const charW = charWidths[charIdx];
                const charCenterS = currentS + charW / 2;
                const angle = (charCenterS - lineTotalWidth / 2) / R;

                const cx = R * Math.sin(angle);
                const cy = R * (1 - Math.cos(angle));

                currentS += charW + letterSpacing * editorScale;

                return (
                  <span
                    key={charIdx}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${cx}px)`,
                      top: `calc(50% + ${cy}px)`,
                      transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                      fontSize: `${fontSize}px`,
                      fontFamily: getFontFamily(layer.font),
                      fontWeight: getFontWeight(layer.font),
                      fontStyle: getFontStyle(layer.font),
                      whiteSpace: "nowrap",
                      WebkitTextStroke:
                        layer.outlineEnabled && layer.outlineWidth
                          ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#FFFFFF"}`
                          : isOutline
                          ? `1px ${layer.color}`
                          : "none",
                      color: isOutline ? "transparent" : layer.color,
                      textShadow: layer.shadowEnabled
                        ? `${(layer.shadowOffsetX ?? 4) * editorScale}px ${(layer.shadowOffsetY ?? 4) * editorScale}px ${(layer.shadowBlur ?? 10) * editorScale}px ${layer.shadowColor || "#000000"}`
                        : undefined,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
        {children}
      </div>
    );
  };

  const selectedLayer = textLayers.find((l) => l.id === selectedLayerId);

  return (
    <div className="space-y-6">
      {/* Front/Back Side Switcher */}
      <div className="flex bg-zinc-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setCurrentView("front")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeSide === "Front" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Front Side
        </button>
        <button
          type="button"
          onClick={() => setCurrentView("back")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeSide === "Back" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Back Side
        </button>
      </div>

      {/* Editor representation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Visual Text Editor <br /> ({activeSide} View)
          </label>
          <button
            onClick={handleAddCustomText}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5" /> Add Text
          </button>
        </div>

        <div
          className="relative w-[280px] h-[380px] rounded border border-zinc-200 shadow-inner mx-auto select-none overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
          }}
        >
          {/* Silhouette backdrop (centered inside active 280x280 area) */}
          <div className="absolute top-[50px] left-0 w-[280px] h-[280px] rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg viewBox="0 0 100 100" className="w-48 h-48 fill-white">
                <path d="M 30,15 L 70,15 L 85,25 L 80,45 L 70,40 L 70,85 L 30,85 L 30,40 L 20,45 L 15,25 Z" />
              </svg>
            </div>
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[20px_20px]" />
          </div>

          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-zinc-500 tracking-widest uppercase pointer-events-none">
            {activeSide} Texture Map (1024x1024)
          </div>

          {/* Content Container (centered vertically, allows overflow of control handles) */}
          <div className="absolute top-[50px] left-0 w-[280px] h-[280px]">
            {/* Safe Area Box */}
            {isDragging && (
              <div
                className="absolute border border-dashed border-[#6366f1]/45 rounded-2xl pointer-events-none z-20"
                style={{
                  left: `${150 * editorScale}px`,
                  top: `${150 * editorScale}px`,
                  width: `${(874 - 150) * editorScale}px`,
                  height: `${(874 - 150) * editorScale}px`,
                }}
              >
                {/* Safe Area Label Badge */}
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-widest scale-90 whitespace-nowrap"
                  style={{ zIndex: 30 }}
                >
                  Safe Area
                </div>
              </div>
            )}

            {/* Visual Guide Lines */}
            {activeGuides.vertical !== null && (
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-[#6366f1] pointer-events-none z-30 transition-opacity duration-150"
                style={{ left: `${activeGuides.vertical.coordinate * editorScale}px` }}
              >
                <span className="absolute top-2 left-0 -translate-x-1/2 bg-[#6366f1] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow uppercase tracking-wider scale-90 whitespace-nowrap">
                  {activeGuides.vertical.label}
                </span>
              </div>
            )}
            {activeGuides.horizontal !== null && (
              <div
                className="absolute left-0 right-0 border-t border-dashed border-[#6366f1] pointer-events-none z-30 transition-opacity duration-150"
                style={{ top: `${activeGuides.horizontal.coordinate * editorScale}px` }}
              >
                <span className="absolute left-2 top-0 -translate-y-1/2 bg-[#6366f1] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow uppercase tracking-wider scale-90 whitespace-nowrap">
                  {activeGuides.horizontal.label}
                </span>
              </div>
            )}
            {textLayers
              .filter((layer) => layer.side === activeSide)
              .map((layer) => {
                const isPrimarySelected = selectedLayerId === layer.id;
                const isSelected = isPrimarySelected || (selectedLayerIds && selectedLayerIds.includes(layer.id));
                return (
                  <div
                    key={layer.id}
                    style={{
                      position: "absolute",
                      left: layer.x * editorScale,
                      top: layer.y * editorScale,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                      cursor: "move",
                      zIndex: isPrimarySelected ? 40 : isSelected ? 35 : 10,
                    }}
                    onMouseDown={(e) => handleDragStart(e, layer.id)}
                  >
                    {renderTextLayer(layer, false)}
                    {/* Render dashed outline for selected layers that are not primary */}
                    {isSelected && !isPrimarySelected && (
                      <div 
                        className="absolute inset-0 border border-dashed border-red-500 pointer-events-none" 
                        style={{ margin: "-2px" }}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          {/* Bounding Box & Handles Overlay */}
          <div className="absolute top-[50px] left-0 w-[280px] h-[280px] pointer-events-none">
            {textLayers
              .filter((layer) => layer.side === activeSide && selectedLayerId === layer.id)
              .map((layer) => (
                <div
                  key={`handles-${layer.id}`}
                  style={{
                    position: "absolute",
                    left: layer.x * editorScale,
                    top: layer.y * editorScale,
                    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                >
                  {renderTextLayer(
                    layer,
                    true,
                    <>
                      <div className="absolute inset-0 border border-dashed border-red-500" style={{ visibility: "visible" }} />
                      <div style={{ visibility: "visible" }}>
                        <button
                          className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCopy(layer.id);
                          }}
                          title="Duplicate"
                        >
                          <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        </button>
                        <button
                          className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-red-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto text-zinc-600 hover:text-red-500"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDelete(layer.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div
                          className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-red-500 hover:bg-red-600 shadow-md rounded-full flex items-center justify-center cursor-se-resize active:scale-90 transition-transform pointer-events-auto text-white"
                          onMouseDown={(e) => handleScaleStart(e, layer.id)}
                          title="Scale"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                          </svg>
                        </div>
                        <div
                          className="absolute -bottom-3.5 -left-3.5 w-6 h-6 bg-zinc-900 hover:bg-black shadow-md rounded-full flex items-center justify-center cursor-alias active:scale-90 transition-transform pointer-events-auto text-white"
                          onMouseDown={(e) => handleRotateStart(e, layer.id)}
                          title="Rotate"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Editor inputs */}
      {selectedLayer ? (
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Edit Selected Text Layer
          </h4>

          {/* Text Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">
              Text Value
            </label>
            <textarea
              value={selectedLayer.text}
              onChange={(e) => {
                const val = e.target.value;
                setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, text: val } : l)));
              }}
              rows={2}
              className="w-full border border-zinc-200 rounded-xl p-2.5 text-sm focus:outline-red-500 font-medium"
              placeholder="Enter text..."
            />
          </div>

          {/* Font selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">
              Font Style
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Varsity",
                "Impact",
                "Outline",
                "Italic",
                "Script",
                "Block",
                "Serif Athletic",
                "Cyberpunk",
                "Grunge",
                "Neon Glow",
                "Gothic",
              ].map((fontName) => (
                <button
                  key={fontName}
                  onClick={() => {
                    setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, font: fontName } : l)));
                  }}
                  className={`p-2 rounded-lg border text-xs font-bold text-center transition-all ${
                    selectedLayer.font === fontName
                      ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {fontName}
                </button>
              ))}
            </div>
          </div>

          {/* Text size slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-800">
              <span>Text Size</span>
              <span className="text-zinc-500">{selectedLayer.textSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              value={selectedLayer.textSize}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, textSize: val } : l)));
              }}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Letter Spacing slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-800">
              <span>Letter Spacing</span>
              <span className="text-zinc-500">{(selectedLayer.letterSpacing || 0).toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="-10"
              max="50"
              value={selectedLayer.letterSpacing || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, letterSpacing: val } : l)));
              }}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Line Spacing slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-800">
              <span>Line Spacing</span>
              <span className="text-zinc-500">{(selectedLayer.lineSpacing || 1.15).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={selectedLayer.lineSpacing || 1.15}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, lineSpacing: val } : l)));
              }}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Curve Radius slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-800">
              <span>Arc/Curve Angle</span>
              <span className="text-zinc-500">{(selectedLayer.curveRadius || 0)}Ã‚Â°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedLayer.curveRadius || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, curveRadius: val } : l)));
              }}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Text Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 block">
              Text Color
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                "#FFFFFF",
                "#111111",
                "#E63946",
                "#2196F3",
                "#FFD166",
                "#06D6A0",
                "#8D99AE",
                "#FF5E7E",
                "#7B2CBF",
                "#4A4A4A",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, color: c } : l)));
                  }}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    selectedLayer.color === c ? "border-zinc-950 scale-110 ring-1 ring-zinc-400" : "border-black/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedLayer.color}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, color: val } : l)));
                }}
                className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
              />
              <span className="text-xs text-zinc-500 font-mono">
                {selectedLayer.color.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Outline options */}
          <div className="space-y-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Enable Outline stroke
              </span>
              <button
                type="button"
                onClick={() => {
                  const val = !selectedLayer.outlineEnabled;
                  setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, outlineEnabled: val } : l)));
                }}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  selectedLayer.outlineEnabled ? "bg-red-500" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    selectedLayer.outlineEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {selectedLayer.outlineEnabled && (
              <div className="space-y-3 pt-2 border-t border-zinc-200/60">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-800">
                    <span>Outline Width</span>
                    <span className="text-zinc-500">{selectedLayer.outlineWidth || 4}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={selectedLayer.outlineWidth || 4}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, outlineWidth: val } : l)));
                    }}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-800 block">
                    Outline Color
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedLayer.outlineColor || "#FFFFFF"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, outlineColor: val } : l)));
                      }}
                      className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
                    />
                    <span className="text-xs text-zinc-500 font-mono">
                      {(selectedLayer.outlineColor || "#FFFFFF").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shadow Options */}
          <div className="space-y-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Enable Drop Shadow
              </span>
              <button
                type="button"
                onClick={() => {
                  const val = !selectedLayer.shadowEnabled;
                  setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, shadowEnabled: val } : l)));
                }}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  selectedLayer.shadowEnabled ? "bg-red-500" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    selectedLayer.shadowEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {selectedLayer.shadowEnabled && (
              <div className="space-y-3 pt-2 border-t border-zinc-200/60">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-800">
                    <span>Shadow Blur</span>
                    <span className="text-zinc-500">{selectedLayer.shadowBlur ?? 10}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={selectedLayer.shadowBlur ?? 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, shadowBlur: val } : l)));
                    }}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-800">
                    <span>Shadow Offset X</span>
                    <span className="text-zinc-500">{selectedLayer.shadowOffsetX ?? 4}</span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    value={selectedLayer.shadowOffsetX ?? 4}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, shadowOffsetX: val } : l)));
                    }}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-800">
                    <span>Shadow Offset Y</span>
                    <span className="text-zinc-500">{selectedLayer.shadowOffsetY ?? 4}</span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    value={selectedLayer.shadowOffsetY ?? 4}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, shadowOffsetY: val } : l)));
                    }}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-800 block">
                    Shadow Color
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedLayer.shadowColor || "#000000"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextLayers((prev) => prev.map((l) => (l.id === selectedLayer.id ? { ...l, shadowColor: val } : l)));
                      }}
                      className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
                    />
                    <span className="text-xs text-zinc-500 font-mono">
                      {(selectedLayer.shadowColor || "#000000").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-zinc-400 italic text-center py-4 bg-zinc-50 rounded-xl border border-zinc-200/50">
          No text layer selected. Click on a text in the preview map or add a new one!
        </div>
      )}
    </div>
  );
}
export default TabText;



