"use client";

import DesignGallery from "@/components/home/design-gallery/DesignGallery";

export default function DesignsPage() {
  return (
    <main className="w-full min-h-screen pt-20 bg-[#F5F7FA]">
      <DesignGallery isHomePage={false} />
    </main>
  );
}
