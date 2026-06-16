"use client";

import MugCustomizer from "@/components/customizer/mug-customizer";

export default function MugDesignPage() {
  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden font-sans" data-lenis-prevent>
      <MugCustomizer />
    </div>
  );
}
