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
      name: "Minimalist Hoodie",
      path: "/Meshy_AI_Minimalist_White_Hood_0616043506_generate.glb",
    },
    {
      name: "Realistic Tank Top",
      path: "/Meshy_AI_Create_a_realistic_ta_0616041531_generate.glb",
    },
    {
      name: "Collar Jersey",
      path: "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb",
    },
    {
      name: "Custom Sports Jersey",
      path: "/Meshy_AI_Create_an_exact_3D_sp_0615105857_generate.glb",
    },
    {
      name: "Sports Polo Jersey",
      path: "/Meshy_AI_Realistic_sports_polo_0615102145_generate.glb",
    },
    {
      name: "Beige Puffer Jacket",
      path: "/Meshy_AI_Beige_Puffer_Jacket_3_0615102128_image_to_3d_texture.glb",
    },
    {
      name: "Perfectly Taut Fabric",
      path: "/Meshy_AI_Perfectly_taut_fabric_0620060735_generate.glb",
    },
    {
      name: "White Shopping Bag",
      path: "/Meshy_AI_White_Shopping_Bag_0620054631_generate.glb",
    },
    {
      name: "Monogram Paper Bag",
      path: "/Meshy_AI_Monogram_Paper_Bag_0620135026_generate.glb",
    },
    {
      name: "White Sneaker",
      path: "/Meshy_AI_White_Sneaker_3D_0620143413_image-to-3d-texture.glb",
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
              const currentModel = state.glbModel || "/Meshy_AI_Extract_only_the_sky__0616035345_generate_collar_jersey.glb";
              const isSelected = currentModel === m.path;
              return (
                <button
                  key={m.path}
                  onClick={() => {
                    updateState("glbModel", m.path);
                    // Auto toggle collar logic for presets
                    if (m.name === "Beige Puffer Jacket") {
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
