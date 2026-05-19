"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const templates = [
    { name: "Apex Predator", category: "Esports", color: "bg-red-100/50" },
    { name: "Urban Strikers", category: "Football", color: "bg-blue-100/50" },
    { name: "Velocity Series", category: "Cycling", color: "bg-green-100/50" },
    { name: "Hoops Legend", category: "Basketball", color: "bg-orange-100/50" }
];

export function FeaturedTemplates() {
    return (
        <section id="templates" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-4">Featured Templates</h2>
                        <p className="text-zinc-600 max-w-xl">
                            Start with our curated designs and make them your own. High-quality textures and materials ready for the pitch, court, or stage.
                        </p>
                    </div>
                    <button className="mt-6 md:mt-0 flex items-center gap-2 text-zinc-900 hover:text-red-600 font-bold transition-colors">
                        View All Templates <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((tpl, i) => (
                        <motion.div
                            key={tpl.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                        >
                            <div className={`relative aspect-3/4 rounded-2xl overflow-hidden mb-4 border border-zinc-200 ${tpl.color} shadow-sm group-hover:shadow-lg transition-shadow`}>
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-80" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">{tpl.category}</span>
                                    <h3 className="text-xl font-bold text-white mb-4">{tpl.name}</h3>
                                    <Link href="/brand-new-design">
                                        <button className="w-full py-3 bg-white/90 backdrop-blur-md rounded-lg text-zinc-900 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                                            Customize Template
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
