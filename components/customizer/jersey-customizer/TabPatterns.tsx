"use client";

import React from "react";
import { useCustomizerStore } from "./store";

const PATTERN_DEFAULT_COLORS: Record<string, { bg: string; design: string }> = {
  "/assets/images/patterns/pattern_1.png": { bg: "#FFFFFF", design: "#d73099" },
  "/assets/images/patterns/pattern_2.png": { bg: "#FFFFFF", design: "#5A6B7C" },
  "/assets/images/patterns/pattern_3.png": { bg: "#FFFFFF", design: "#0F7643" },
  "/assets/images/patterns/pattern_4.png": { bg: "#FFFFFF", design: "#8db97b" },
  "/assets/images/patterns/pattern_5.png": { bg: "#FFFFFF", design: "#E52E2E" },
};

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
      className={`relative w-10 h-6 rounded-full transition-colors duration-300 cursor-pointer ${value ? "bg-zinc-900" : "bg-zinc-300"
        }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? "translate-x-4" : "translate-x-0"
          }`}
      />
    </button>
  );
}

export function TabPatterns() {
  const state = useCustomizerStore((s) => s.state);
  const updateState = useCustomizerStore((s) => s.updateState);
  const activePatternSide = useCustomizerStore((s) => s.activePatternSide);
  const setActivePatternSide = useCustomizerStore((s) => s.setActivePatternSide);

  const selectedPattern =
    activePatternSide === "Front"
      ? state.fabricPatternFront
      : state.fabricPatternBack;

  const customizeActive =
    activePatternSide === "Front"
      ? state.fabricPatternCustomizeFront
      : state.fabricPatternCustomizeBack;

  const customizeKey =
    activePatternSide === "Front"
      ? "fabricPatternCustomizeFront"
      : "fabricPatternCustomizeBack";

  const colorVal =
    activePatternSide === "Front"
      ? state.fabricPatternColorFront
      : state.fabricPatternColorBack;

  const colorKey =
    activePatternSide === "Front"
      ? "fabricPatternColorFront"
      : "fabricPatternColorBack";

  const bgVal =
    activePatternSide === "Front"
      ? state.fabricPatternBgFront
      : state.fabricPatternBgBack;

  const bgKey =
    activePatternSide === "Front"
      ? "fabricPatternBgFront"
      : "fabricPatternBgBack";

  return (
    <div className="space-y-4">
      {/* Pattern Side Selector */}
      <div className="flex gap-1.5 p-1 bg-zinc-100 rounded border">
        <button
          onClick={() => setActivePatternSide("Front")}
          className={`flex-1 py-2 text-xs font-bold rounded cursor-pointer transition-all text-center ${activePatternSide === "Front"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800"
            }`}
        >
          Front Side
        </button>
        <button
          onClick={() => setActivePatternSide("Back")}
          className={`flex-1 py-2 text-xs font-bold rounded cursor-pointer transition-all text-center ${activePatternSide === "Back"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800"
            }`}
        >
          Back Side
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {[
          { id: "None", label: "Solid Color", url: "" },
          {
            id: "/assets/images/patterns/pattern_1.png",
            label: "Pattern 1",
            url: "/assets/images/patterns/pattern_1.png",
          },
          {
            id: "/assets/images/patterns/pattern_2.png",
            label: "Pattern 2",
            url: "/assets/images/patterns/pattern_2.png",
          },
          {
            id: "/assets/images/patterns/pattern_3.png",
            label: "Pattern 3",
            url: "/assets/images/patterns/pattern_3.png",
          },
          {
            id: "/assets/images/patterns/pattern_4.png",
            label: "Pattern 4",
            url: "/assets/images/patterns/pattern_4.png",
          },
          {
            id: "/assets/images/patterns/pattern_5.png",
            label: "Pattern 5",
            url: "/assets/images/patterns/pattern_5.png",
          },
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
                  activePatternSide === "Front" ? "fabricPatternFront" : "fabricPatternBack",
                  p.id,
                )
              }
              className={`flex flex-col p-2.5 rounded-lg border transition-all text-left cursor-pointer ${isSelected ? "border-red-500 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                }`}
            >
              <div className="w-full h-20 rounded-lg overflow-hidden mb-2 bg-zinc-100 border border-zinc-200/50 flex items-center justify-center relative">
                {p.id === "None" ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-500 font-bold text-xs">
                    Solid
                  </div>
                ) : (
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium text-center w-full ${isSelected ? "text-red-700 font-bold" : "text-[#002337]"
                  }`}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pattern Color Customizer UI */}
      {selectedPattern && selectedPattern !== "None" && (
        <div className="mt-6 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-800">Customize Pattern Colors</h4>
              <p className="text-[10px] text-zinc-500">
                Change pattern colors or make background transparent
              </p>
            </div>
            <Toggle
              value={customizeActive}
              onChange={(v) => {
                updateState(customizeKey, v);
                if (v) {
                  const defaults = PATTERN_DEFAULT_COLORS[selectedPattern];
                  if (defaults) {
                    if (!colorVal) updateState(colorKey, defaults.design);
                    if (!bgVal) updateState(bgKey, defaults.bg);
                  }
                }
              }}
            />
          </div>

          {customizeActive && (
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              {/* Design Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-600 block">
                  Pattern Design Color
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[
                    "#E63946",
                    "#2196F3",
                    "#111111",
                    "#FFFFFF",
                    "#CCCCCC",
                    "#457B9D",
                    "#2A9D8F",
                    "#F4A261",
                    "#726DE8",
                    "#FF6B6B",
                    "#80C670",
                    "#EFBD4E",
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateState(colorKey, c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${colorVal === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorVal || "#E63946"}
                    onChange={(e) => updateState(colorKey, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-zinc-200"
                  />
                  <span className="text-xs text-zinc-500 font-mono">
                    {(colorVal || "#E63946").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-600 block">
                  Pattern Background Color
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  <button
                    type="button"
                    onClick={() => updateState(bgKey, "transparent")}
                    className={`h-7 px-3 rounded-full border-2 text-[10px] font-bold transition-all cursor-pointer ${bgVal === "transparent"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700"
                      }`}
                  >
                    Transparent
                  </button>
                  {[
                    "#E63946",
                    "#2196F3",
                    "#111111",
                    "#FFFFFF",
                    "#CCCCCC",
                    "#457B9D",
                    "#2A9D8F",
                    "#F4A261",
                    "#726DE8",
                    "#FF6B6B",
                    "#80C670",
                    "#EFBD4E",
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateState(bgKey, c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${bgVal === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {bgVal !== "transparent" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgVal || "#FFFFFF"}
                      onChange={(e) => updateState(bgKey, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-zinc-200"
                    />
                    <span className="text-xs text-zinc-500 font-mono">
                      {(bgVal || "#FFFFFF").toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TabPatterns;
