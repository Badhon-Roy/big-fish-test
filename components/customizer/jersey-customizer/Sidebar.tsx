"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCustomizerStore } from "./store";
import { TABS } from "./types";
import LogoImg from "@/assets/images/logo.png";

export function Sidebar() {
  const activeTab = useCustomizerStore((s) => s.activeTab);
  const setActiveTab = useCustomizerStore((s) => s.setActiveTab);

  return (
    <div className="hidden md:flex w-20 flex-col items-center bg-white border-r border-zinc-200 py-6 gap-4 z-20 overflow-y-auto custom-scrollbar">
      {/* Brand Logo */}
      <Link href="/" className="mb-2">
        <img
          src={LogoImg.src}
          alt="Logo"
          width={60}
          height={40}
          className="cursor-pointer object-contain"
        />
      </Link>
      {TABS?.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative group py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer gap-1 transition-all duration-300 w-16 ${
              isActive ? "text-[#00263C]" : "text-zinc-400 hover:text-[#00263C]"
            }`}
          >
            {/* Highlight indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#00263C]/5 border-l-2 border-[#00263C] rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <tab.icon
              className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${
                isActive ? "text-[#00263C]" : "text-zinc-400"
              }`}
            />
            <span
              className={`text-[9px] font-bold relative z-10 uppercase tracking-wide ${
                isActive ? "text-[#00263C]" : "text-zinc-400"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
export default Sidebar;
