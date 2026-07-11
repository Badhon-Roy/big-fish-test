"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function JerseyStyleModal({ isOpen, onClose }) {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState(null); // 'collar' or 'no-collar'

  React.useEffect(() => {
    if (isOpen) {
      // Preload 3D GLTF models in the background while user is selecting
      import("@react-three/drei")
        .then((drei) => {
          drei.useGLTF.preload("/models/shirt_baked.glb");
          drei.useGLTF.preload("/models/collar_jersey.glb");
          console.log("3D models preloaded successfully in background.");
        })
        .catch((err) => {
          console.error("Failed to preload 3D models:", err);
        });
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedStyle) return;
    onClose();
    router.push(`/jersey-customize?type=${selectedStyle}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 z-10 p-6 sm:p-8 flex flex-col gap-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pr-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031E39] tracking-tight">
                Select Your Jersey Style
              </h2>
              <p className="text-sm text-[#565E69]">
                Choose your template style below. You can customize colors, text, and patterns next.
              </p>
            </div>

            {/* Grid of Styles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
              {/* Option 1: Crewneck */}
              <button
                onClick={() => setSelectedStyle("no-collar")}
                className={`relative flex flex-col text-left rounded-2xl border-2 p-4 transition-all duration-300 focus:outline-none cursor-pointer group ${
                  selectedStyle === "no-collar"
                    ? "border-blue-600 bg-blue-50/20 shadow-lg shadow-blue-500/10"
                    : "border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50/50"
                }`}
              >
                {/* Check Badge */}
                {selectedStyle === "no-collar" && (
                  <span className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full shadow-md z-20">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}

                {/* Mockup Preview */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                  <Image
                    src="/assets/images/mockup-images/no-collar-jersey-mockup-image.png"
                    alt="Crewneck T-Shirt Style"
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover object-center"
                  />
                </div>

                <span className="text-base font-bold text-[#031E39] block">
                  Crewneck (No Collar)
                </span>
                <span className="text-xs text-[#565E69] mt-0.5">
                  Clean, standard active crewneck athletic fit.
                </span>
              </button>

              {/* Option 2: Polo */}
              <button
                onClick={() => setSelectedStyle("collar")}
                className={`relative flex flex-col text-left rounded-2xl border-2 p-4 transition-all duration-300 focus:outline-none cursor-pointer group ${
                  selectedStyle === "collar"
                    ? "border-blue-600 bg-blue-50/20 shadow-lg shadow-blue-500/10"
                    : "border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50/50"
                }`}
              >
                {/* Check Badge */}
                {selectedStyle === "collar" && (
                  <span className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full shadow-md z-20">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}

                {/* Mockup Preview */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                  <Image
                    src="/assets/images/mockup-images/collar-jersey-mockup-image.png"
                    alt="Polo Collar Style"
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover object-center"
                  />
                </div>

                <span className="text-base font-bold text-[#031E39] block">
                  Polo Collar
                </span>
                <span className="text-xs text-[#565E69] mt-0.5">
                  Classic professional collared fit with button placket.
                </span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-zinc-200 text-[#031E39] hover:bg-zinc-50 active:scale-[0.98] font-bold text-sm transition-all text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedStyle}
                className={`px-7 py-3 rounded-xl font-bold text-sm text-white shadow-lg active:scale-[0.98] transition-all text-center cursor-pointer ${
                  selectedStyle
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                    : "bg-zinc-300 shadow-none cursor-not-allowed"
                }`}
              >
                Confirm & Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default JerseyStyleModal;
