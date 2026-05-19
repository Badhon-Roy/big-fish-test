"use client";

import { motion } from "framer-motion";
import { Gamepad2, Bike, Trophy, Timer, Swords } from "lucide-react";

const categories = [
    { name: "Football", icon: Trophy, color: "bg-blue-100 text-blue-600" },
    { name: "Cricket", icon: Timer, color: "bg-green-100 text-green-600" },
    { name: "Esports", icon: Gamepad2, color: "bg-purple-100 text-purple-600" },
    { name: "Basketball", icon: Trophy, color: "bg-orange-100 text-orange-600" },
    { name: "Cycling", icon: Bike, color: "bg-yellow-100 text-yellow-600" },
];

export function Categories() {
    return (
        <section id="categories" className="py-24 bg-white relative border-t border-zinc-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-4">Built for Every Sport</h2>
                    <p className="text-zinc-600 max-w-2xl mx-auto">
                        Choose your arena. We have specialized templates and fits adapted to the unique needs of your sport.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {categories.map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative cursor-pointer"
                            >
                                <div className="relative p-6 lg:p-8 flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
                                    <div className={`p-4 rounded-xl ${cat.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-zinc-900 font-bold text-lg">{cat.name}</h3>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
