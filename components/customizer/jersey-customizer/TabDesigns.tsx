"use client";

import React from "react";
import { useCustomizerStore } from "./store";
import { JERSEY_DESIGNS } from "./types";
import { JerseySVG } from "./JerseySVG";

export function TabDesigns() {
  const state = useCustomizerStore((s) => s.state);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);
  const updateState = useCustomizerStore((s) => s.updateState);
  const setSelectedDesign = useCustomizerStore((s) => s.setSelectedDesign);

  return (
    <div className="space-y-5">
      {/* Closure selection */}
      <div className="py-3 border-b border-zinc-100 space-y-2">
        <span className="text-sm font-semibold text-zinc-800 block">
          Closure Type
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (state.zipper === false) {
                updateState("zipper", null);
                updateState("collar", false);
                updateState("collarType", "None");
              } else {
                updateState("zipper", false);
                updateState("collar", true);
                updateState("collarType", "Polo");
              }
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 duration-200 ${
              state.zipper === false
                ? "border-red-500 bg-red-50 text-red-700 font-extrabold"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
            }`}
          >
            Button Placket
          </button>
          <button
            onClick={() => {
              if (state.zipper === true) {
                updateState("zipper", null);
                updateState("collar", false);
                updateState("collarType", "None");
              } else {
                updateState("zipper", true);
                updateState("collar", true);
                updateState("collarType", "Polo");
              }
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 duration-200 ${
              state.zipper === true
                ? "border-red-500 bg-red-50 text-red-700 font-extrabold"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
            }`}
          >
            Zipper (+$5)
          </button>
        </div>
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
              className={`text-[9px] font-bold leading-tight text-center ${
                selectedDesign === d.id ? "text-red-600" : "text-zinc-500"
              }`}
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
                onChange={(e) => updateState("designColor", e.target.value)}
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
  );
}
export default TabDesigns;
