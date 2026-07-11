"use client";

import React from "react";
import { useCustomizerStore } from "./store";

interface TabStyleProps {
  showModelSelector?: boolean;
}

export function TabStyle({ showModelSelector = false }: TabStyleProps) {
  const state = useCustomizerStore((s) => s.state);
  const updateState = useCustomizerStore((s) => s.updateState);

  const glbModels = [
    {
      name: "Jersey (No Collar)",
      path: "/models/shirt_baked.glb",
    },
    {
      name: "Jersey (Collar)",
      path: "/models/collar_jersey.glb",
    },
  ];

  return (
    <div className="space-y-6">
      {showModelSelector && (
        <div>
          <label className="text-sm font-bold text-zinc-900 mb-2 block">
            3D Model / Apparel
          </label>
          <div className="grid grid-cols-1 gap-2">
            {glbModels.map((m) => {
              const currentModel = state.glbModel || "/models/shirt_baked.glb";
              const isSelected = currentModel === m.path;
              return (
                <button
                  key={m.path}
                  onClick={() => {
                    updateState("glbModel", m.path);
                    // Auto toggle collar logic for presets
                    if (m.name === "Jersey (Collar)") {
                      updateState("collar", true);
                      updateState("collarType", "Polo");
                    } else if (m.name === "Jersey (No Collar)") {
                      updateState("collar", false);
                      updateState("collarType", "None");
                    } else if (m.name === "Beige Puffer Jacket") {
                      updateState("collar", false);
                      updateState("collarType", "None");
                    } else if (m.name === "Minimalist Hoodie") {
                      updateState("collar", false);
                      updateState("collarType", "None");
                      updateState("sleeve", "Long");
                    } else if (m.name === "Realistic Tank Top") {
                      updateState("collar", false);
                      updateState("collarType", "None");
                      updateState("sleeve", "Sleeveless");
                    } else if (
                      m.name === "Perfectly Taut Fabric" ||
                      m.name === "White Shopping Bag" ||
                      m.name === "Monogram Paper Bag" ||
                      m.name === "White Sneaker"
                    ) {
                      updateState("collar", false);
                      updateState("collarType", "None");
                      updateState("sleeve", "Short");
                    } else if (
                      m.name === "Sports Polo Jersey" ||
                      m.name === "Custom Sports Jersey" ||
                      m.name === "Collar Jersey"
                    ) {
                      updateState("collar", false);
                      updateState("collarType", "None");
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer border text-sm font-bold transition-all active:scale-95 duration-300 text-left px-5 flex items-center justify-between ${
                    isSelected
                      ? "border-red-500 bg-red-50 text-red-700 font-extrabold shadow-sm"
                      : "border-[#002337] text-[#002337] hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <span>{m.name}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-zinc-900 mb-2 block">
          Closure Type
        </label>
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
            className={`p-3 rounded-full cursor-pointer border text-sm font-bold transition-all active:scale-90 duration-300 ${
              state.zipper === false
                ? "border-red-500 bg-red-50 text-red-700 font-extrabold"
                : "border-[#002337] text-[#002337] hover:border-zinc-300"
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
            className={`p-3 rounded-full cursor-pointer border text-sm font-bold transition-all active:scale-90 duration-300 ${
              state.zipper === true
                ? "border-red-500 bg-red-50 text-red-700 font-extrabold"
                : "border-[#002337] text-[#002337] hover:border-zinc-300"
            }`}
          >
            Zipper (+$5)
          </button>
        </div>
      </div>
    </div>
  );
}
export default TabStyle;
