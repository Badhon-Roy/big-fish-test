"use client";

import BusinessCardCustomizer from "@/components/customizer/business-card-customizer";

export default function BusinessCardDesignPage() {
  return (
    <div className="h-screen w-full bg-zinc-950 overflow-hidden font-sans text-white" data-lenis-prevent>
      <BusinessCardCustomizer />
    </div>
  );
}
