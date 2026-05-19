"use client";

import { motion } from "framer-motion";

const brands = ["Nike", "Adidas", "Puma", "Under Armour", "Reebok"];

export function TrustedBrands() {
    return (
        <section className="py-12 bg-white border-t border-zinc-100 overflow-hidden">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
                    Trusted by the best teams worldwide
                </p>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map((brand, i) => (
                        <motion.div
                            key={brand}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-4xl font-black text-zinc-800 hover:text-red-600 transition-colors cursor-pointer"
                        >
                            {brand.toUpperCase()}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
