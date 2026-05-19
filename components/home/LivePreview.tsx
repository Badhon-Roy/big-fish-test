"use client";

import { motion } from "framer-motion";

export function LivePreview() {
    return (
        <section className="py-24 bg-white overflow-hidden border-t border-zinc-100">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1"
                    >
                        {/* Mockup of UI Editor */}
                        <div className="w-full aspect-video bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="h-12 border-b border-zinc-100 bg-zinc-50 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="ml-4 h-4 w-32 bg-zinc-200 rounded-full" />
                            </div>
                            {/* Body */}
                            <div className="flex-1 flex">
                                <div className="w-1/3 border-r border-zinc-100 p-4 space-y-4 bg-zinc-50/50">
                                    <div className="h-6 w-1/2 bg-zinc-200 rounded" />
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-zinc-200" />)}
                                    </div>
                                    <div className="h-16 w-full bg-zinc-100 rounded-lg mt-4 border border-zinc-200" />
                                    <div className="h-16 w-full bg-zinc-100 rounded-lg border border-zinc-200" />
                                </div>
                                <div className="flex-1 relative bg-zinc-100 flex items-center justify-center">
                                    <div className="w-48 h-64 bg-zinc-200 rounded-2xl animate-pulse shadow-inner" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-6">
                            Studio-Grade <br />
                            <span className="text-red-600">Customizer</span>
                        </h2>
                        <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                            Experience the power of a pro-level design tool right in your browser. Watch your changes apply instantly in 3D. Add text, upload logos, pick patterns, and see exactly what you'll get before ordering.
                        </p>
                        <ul className="space-y-4">
                            {["Drag & Drop Logo Uploads", "Rich Font Typography", "SVG Pattern Generators", "Dynamic Color Palettes"].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">✓</div>
                                    <span className="text-zinc-700 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
