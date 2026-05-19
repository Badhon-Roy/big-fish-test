"use client";

import Link from "next/link";
import { Shirt, Hash } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-zinc-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
                                <Shirt className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-extrabold text-zinc-950 tracking-tight">Valkyrie</span>
                        </Link>
                        <p className="text-zinc-600 mb-6 font-medium">
                            Empowering teams and creators with professional-grade, fully customizable athletic wear.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Hash, Hash, Hash, Hash].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black text-zinc-600 hover:text-white transition-all">
                                    <Icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-zinc-950 font-bold mb-6">Products</h4>
                        <ul className="space-y-4 text-zinc-600 font-medium">
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Football Kits</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Esports Jerseys</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Basketball Uniforms</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Cycling Gear</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-zinc-950 font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-zinc-600 font-medium">
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Track Order</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Returns & Exchanges</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-zinc-950 font-bold mb-6">Newsletter</h4>
                        <p className="text-zinc-600 mb-4 font-medium">Subscribe for the latest drops and exclusive offers.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 flex-1 text-zinc-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                            />
                            <button className="bg-zinc-950 hover:bg-black text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-500 text-sm font-medium">
                        © {new Date().getFullYear()} Valkyrie Sports. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-zinc-500 font-medium">
                        <Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-zinc-900 transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
