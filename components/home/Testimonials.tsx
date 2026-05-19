"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

const reviews = [
    {
        name: "Alex Mercer",
        role: "Captain, FC Phoenix",
        text: "The sheer quality of the fabric combined with how easy it was to design our team kits blew me away. We look like a premier league team now.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    },
    {
        name: "Sarah Chen",
        role: "Manager, Cloud9 Amateurs",
        text: "For esports, you need something comfortable that breathes well. These jerseys check all the boxes, and the 3D builder is incredibly fun to use.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    {
        name: "Marcus Johnson",
        role: "Founder, City Cyclers",
        text: "We ordered 50 custom cycling kits. The colors are vibrant exactly as seen on the screen and the delivery was blazing fast.",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d"
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-zinc-50 border-t border-zinc-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-zinc-950 mb-4">Champion Reviews</h2>
                    <p className="text-zinc-600 max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what teams around the world have to say.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={review.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-1 text-red-500 mb-6">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
                            </div>
                            <p className="text-zinc-700 mb-8 italic">"{review.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200">
                                    <Image src={review.avatar} alt={review.name} width={48} height={48} className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-zinc-950 font-bold">{review.name}</h4>
                                    <p className="text-zinc-500 text-sm">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
