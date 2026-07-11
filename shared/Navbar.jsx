"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logoImg from "@/assets/images/logo.png";
import CommonButton from "@/common/CommonButton";
import { JerseyStyleModal } from "@/components/customizer/JerseyStyleModal";

import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("select-style") === "true") {
        setIsModalOpen(true);
        // Clean URL parameter without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "Products", href: "/products" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="w-full container mx-auto flex items-center justify-between px-6 md:px-12 lg:px-16 py-5 bg-transparent relative z-50">
        {/* Logo */}
        <div className="shrink-0">
          <Link href="/" className="block transition-transform hover:scale-105 duration-300">
            <Image 
              src={logoImg} 
              alt="Big Fish Logo" 
              width={120} 
              height={48} 
              priority
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
        </div>
   
        {/* Nav Menu */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {menuItems.map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                className="relative py-2 text-sm lg:text-base font-medium text-[#031E39] hover:text-opacity-80 transition-colors duration-200 block"
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#031E39] rounded-full" />
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div>
          <CommonButton 
            onClick={() => setIsModalOpen(true)}
            buttonText="Start Customizing"
          />
        </div>
      </nav>

      {/* Jersey Style Selection Modal */}
      <JerseyStyleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Navbar;
