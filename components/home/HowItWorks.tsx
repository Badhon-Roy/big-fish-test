"use client";

import { motion } from "framer-motion";
import { MousePointerClick, Palette, Truck } from "lucide-react";

const steps = [
    {
        title: "Choose a Template",
        description: "Start with one of our premium base designs engineered for performance.",
        icon: MousePointerClick,
    },
    {
        title: "Customize in 3D",
        description: "Add your team logo, pick colors, insert names & numbers in real-time.",
        icon: Palette,
    },
    {
        title: "Fast Delivery",
        description: "Once ordered, we manufacture and ship directly to your door in days.",
        icon: Truck,
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-zinc-50 border-t border-zinc-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-4">How It Works</h2>
                    <p className="text-zinc-600 max-w-2xl mx-auto">
                        From imagination to reality in three simple steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line */}
                    <div className="hidden md:block absolute top-[45%] left-[20%] right-[20%] h-[2px] bg-linear-to-r from-red-600/0 via-red-300 to-red-600/0" />

                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="relative flex flex-col items-center text-center p-6"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-6 shadow-md relative z-10 group hover:border-red-500 hover:shadow-red-500/20 transition-all">
                                    <Icon className="w-10 h-10 text-zinc-800 group-hover:text-red-600 transition-colors" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                                    0{i + 1}
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-3">{step.title}</h3>
                                <p className="text-zinc-600">{step.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
