"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MouseEvent } from "react";

export function HeroSection() {
    // 3D Tilt Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPos = e.clientX - rect.left;
        const yPos = e.clientY - rect.top;
        const xPct = xPos / rect.width - 0.5;
        const yPct = yPos / rect.height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <section className="relative min-h-[90vh] w-full overflow-hidden bg-white flex items-center justify-center pt-20">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-linear-to-br from-white via-zinc-100 to-white z-0" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-300/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm w-fit">
                        <Sparkles className="w-4 h-4 text-red-600" />
                        <span className="text-zinc-800 text-sm font-medium">The Future of Custom Merch</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-zinc-950 leading-tight tracking-tight">
                        Design Your <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 to-red-500">
                            Legacy
                        </span>
                    </h1>

                    <p className="text-lg text-zinc-600 max-w-lg leading-relaxed">
                        Create premium, fully customizable jerseys in real-time. Whether for your
                        football club, esports team, or personal brand, craft something extraordinary.
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                        <Link href="/brand-new-design">
                            <button className="group px-8 py-4 bg-zinc-950 hover:bg-black text-white rounded-full font-semibold transition-all duration-300 flex items-center gap-2 hover:gap-4 shadow-lg">
                                Design Your Own Jersey
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="/brand-new-design">
                            <button className="px-8 py-4 bg-white hover:bg-zinc-50 text-zinc-950 rounded-full font-semibold border border-zinc-200 shadow-sm transition-all duration-300">
                                Explore Templates
                            </button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 mt-8 pt-8 border-t border-zinc-200">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-zinc-950">50k+</span>
                            <span className="text-sm text-zinc-600">Jerseys Delivered</span>
                        </div>
                        <div className="w-px h-12 bg-zinc-200" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-zinc-950">4.9/5</span>
                            <span className="text-sm text-zinc-600">Customer Rating</span>
                        </div>
                    </div>
                </motion.div>

                {/* Interactive 3D Preview Image Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-[600px] w-full relative flex items-center justify-center p-8"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ perspective: 1200 }}
                >
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d"
                        }}
                        className="relative w-full h-full max-w-md drop-shadow-2xl cursor-grab active:cursor-grabbing"
                    >
                        <Image
                            src="/assets/jersey-1.png"
                            alt="Custom 3D Premium Jersey"
                            fill
                            className="object-contain pointer-events-none"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />

                        {/* Dynamic Reflection/Glare Effect based on tilt */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-overlay opacity-30"
                            style={{
                                background: useTransform(
                                    () => `radial-gradient(circle at ${(mouseX.get() + 0.5) * 100}% ${(mouseY.get() + 0.5) * 100}%, white 0%, transparent 60%)`
                                )
                            }}
                        />
                    </motion.div>

                    <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/10 blur-xl rounded-full" />

                    {/* Floating feature tags */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/4 right-8 px-4 py-2 rounded-lg text-sm text-zinc-800 font-medium border border-zinc-200 bg-white/80 backdrop-blur-md shadow-sm hidden md:block pointer-events-none"
                    >
                        🌐 Interactive 3D Preview
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute bottom-1/4 left-8 px-4 py-2 rounded-lg text-sm text-zinc-800 font-medium border border-zinc-200 bg-white/80 backdrop-blur-md shadow-sm hidden md:block pointer-events-none"
                    >
                        🎨 Grab to Rotate
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
