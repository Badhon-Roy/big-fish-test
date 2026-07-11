"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logoImg from "@/assets/images/logo.png";
import CommonButton from "@/common/CommonButton";
import { JerseyStyleModal } from "@/components/customizer/JerseyStyleModal";

import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScrollEvent = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  useEffect(() => {
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

  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (pathname !== "/") return;

    const handleScrollSpy = () => {
      // Check if user has scrolled to the bottom of the page
      const isAtBottom = 
        typeof window !== "undefined" && 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;

      if (isAtBottom) {
        setActiveSection("contact");
        return;
      }

      const sections = [
        { id: "home", el: document.getElementById("home") },
        { id: "how-it-works", el: document.getElementById("how-it-works") },
        { id: "products", el: document.getElementById("products") },
        { id: "contact", el: document.getElementById("contact") },
      ];

      let currentActive = "home";
      let minDistance = Infinity;

      sections.forEach((sec) => {
        if (!sec.el) return;
        const rect = sec.el.getBoundingClientRect();
        // Calculate distance from the sticky header line (approx 100px from top)
        const distance = Math.abs(rect.top - 100);
        if (distance < minDistance) {
          minDistance = distance;
          currentActive = sec.id;
        }
      });

      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [pathname]);

  const handleScroll = (e, href) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // Set URL hash cleanly
        window.history.pushState(null, "", href);
      }
    }
  };

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/#products" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "Contact Us", href: "/#contact" },
  ];

  const isActive = (href) => {
    if (pathname !== "/") return false;
    
    if (href === "/") {
      return activeSection === "home";
    }
    return activeSection === href.replace("/#", "");
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/85 backdrop-blur-md shadow-sm border-b border-zinc-200/40 py-3" 
          : "bg-transparent py-5"
      }`}>
        <nav className="w-full container mx-auto flex items-center justify-between px-6 md:px-12 lg:px-16">
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
                  onClick={(e) => handleScroll(e, item.href)}
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
      </header>

      {/* Jersey Style Selection Modal */}
      <JerseyStyleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Navbar;
