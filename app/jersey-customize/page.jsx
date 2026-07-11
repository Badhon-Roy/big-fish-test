"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomizerLayout from "@/components/customizer/CustomizerLayout";

export default function CustomizerPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type !== "collar" && type !== "no-collar") {
      router.replace("/?select-style=true");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="h-screen w-screen bg-zinc-50 flex items-center justify-center">
        {/* Premium minimal spinner */}
        <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-zinc-50 overflow-hidden font-sans" data-lenis-prevent>
      <CustomizerLayout />
    </div>
  );
}
