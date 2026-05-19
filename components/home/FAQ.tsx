"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "How long does shipping take?",
        answer: "Standard orders are manufactured and shipped within 14 business days. Expedited shipping is available for Pro and Enterprise tiers, bringing delivery down to 7 days."
    },
    {
        question: "Is there a minimum order quantity?",
        answer: "No! You can order just 1 jersey. However, our Pro Squad packaging starts at a 10-jersey minimum for discounted team rates."
    },
    {
        question: "Can I upload my own team logo?",
        answer: "Yes, our 3D configurator supports PNG, JPG, and SVG logo uploads. You can drag and drop them anywhere on the jersey."
    },
    {
        question: "What materials do you use?",
        answer: "We use premium, moisture-wicking Dri-Fit polyester blends similar to major sports brands. Perfect for high performance and durability."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-zinc-50 border-t border-zinc-100">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-4">Frequently Asked Questions</h2>
                    <p className="text-zinc-600">Everything you need to know about our products and billing.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <button
                                className="w-full flex items-center justify-between p-6 text-left"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className="text-lg font-bold text-zinc-900">{faq.question}</span>
                                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-zinc-600">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
