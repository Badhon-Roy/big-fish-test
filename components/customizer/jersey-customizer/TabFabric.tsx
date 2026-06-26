"use client";

import React from "react";
import { useCustomizerStore } from "./store";

export function TabFabric() {
  const state = useCustomizerStore((s) => s.state);
  const updateState = useCustomizerStore((s) => s.updateState);

  const fabrics = [
    {
      name: "Mesh",
      desc: "Standard high-breathability sports mesh fabric",
      extra: "",
    },
    {
      name: "Flex",
      desc: "Premium stretch fabric with extra flexibility",
      extra: "",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fabrics.map((f) => {
          const isSelected = state.fabric === f.name;
          return (
            <button
              key={f.name}
              onClick={() => updateState("fabric", f.name)}
              className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${
                isSelected ? "border-red-500 bg-red-50" : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div>
                <div className={`font-bold text-sm ${isSelected ? "text-red-700" : "text-zinc-800"}`}>
                  {f.name}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{f.desc}</div>
              </div>
              {f.extra && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  {f.extra}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fabric Technology Visualizer Card */}
      <div className="mt-4 border-t pt-4">
        <div className="text-xs font-medium mb-4 text-[#00263C] uppercase tracking-wider">
          Fabric Technology Visualizer
        </div>
        <div className="overflow-hidden border border-zinc-200 shadow-sm bg-white">
          <img
            src="/assets/mesh_flex_showcase.png"
            alt="Mesh vs Flex Antigravity Showcases"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
}
export default TabFabric;
