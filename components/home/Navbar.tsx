"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Menu, X, Shirt } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-lg border-b border-zinc-200 py-4 shadow-sm" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Shirt className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-extrabold text-zinc-950 tracking-tight">Valkyrie</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#templates" className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors">Templates</Link>
                    <Link href="#categories" className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors">Sports</Link>
                    <Link href="#how-it-works" className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors">How it Works</Link>
                    <Link href="#pricing" className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors">Pricing</Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <button className="text-zinc-600 hover:text-zinc-950 transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button className="text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors">
                        Log In
                    </button>
                    <Link href="/brand-new-design">
                        <button className="px-5 py-2 bg-zinc-950 text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors shadow-sm">
                            Start Designing
                        </button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-zinc-800"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-200 p-4 flex flex-col gap-4 shadow-xl">
                    <Link href="#templates" className="text-zinc-800 font-semibold p-2 hover:bg-zinc-100 rounded">Templates</Link>
                    <Link href="#categories" className="text-zinc-800 font-semibold p-2 hover:bg-zinc-100 rounded">Sports</Link>
                    <Link href="#how-it-works" className="text-zinc-800 font-semibold p-2 hover:bg-zinc-100 rounded">How it Works</Link>
                    <Link href="#pricing" className="text-zinc-800 font-semibold p-2 hover:bg-zinc-100 rounded">Pricing</Link>
                    <Link href="/brand-new-design" className="bg-zinc-950 text-white text-center font-bold p-3 rounded-md mt-2">Start Designing</Link>
                </div>
            )}
        </motion.header>
    );
}
