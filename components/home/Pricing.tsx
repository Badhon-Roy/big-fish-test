"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "$49",
        description: "Perfect for casual teams and solo creators.",
        features: ["1 Custom Jersey", "Basic 3D Customization", "Standard Materials", "14-Day Shipping"],
    },
    {
        name: "Pro Squad",
        price: "$39",
        description: "Ideal for amateur leagues and esports teams.",
        features: ["Minimum 10 Jerseys", "Advanced Features", "Premium Dri-Fit", "7-Day Shipping", "Team Roster Import"],
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For professional organizations and large brands.",
        features: ["Bulk Ordering (50+)", "API Access", "Custom Fabrics", "Dedicated Manager", "White-label Options"],
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-zinc-600 max-w-2xl mx-auto">
                        Get the best quality gear whether you need one jersey or a thousand.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative rounded-3xl p-8 border ${plan.popular ? "border-red-500 bg-white shadow-xl" : "border-zinc-200 bg-zinc-50 shadow-sm"
                                } flex flex-col transition-shadow hover:shadow-lg`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-zinc-950 mb-2">{plan.name}</h3>
                                <p className="text-zinc-600 text-sm h-10">{plan.description}</p>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-zinc-950">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-zinc-500">/unit</span>}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-3 text-zinc-700">
                                        <Check className="w-5 h-5 text-red-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/brand-new-design">
                                <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 border ${plan.popular
                                    ? "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md"
                                    : "bg-white hover:bg-zinc-100 text-zinc-950 border-zinc-200"
                                    }`}>
                                    Choose {plan.name}
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
