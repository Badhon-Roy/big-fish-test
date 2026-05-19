"use client";

import { JSX, useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import {
    Palette, Grid, Type, Image as ImageIcon, Sparkles, Scissors, Box,
    ChevronLeft, Save, Share2, Download, ShoppingCart, Wand2, Hash, LayoutTemplate
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Realistic GLTF Jersey Model using Decals ─────────────────────────────────
import { useGLTF, Decal } from "@react-three/drei";

function useJerseyDecals(state: any) {
    return useMemo(() => {
        const size = 1024;

        // Use secondary color for text to respect user's color selection
        const textColor = state.secondary || "#ffffff";

        const makeCanvas = (drawFn: (ctx: CanvasRenderingContext2D) => void) => {
            const cv = document.createElement("canvas");
            cv.width = size; cv.height = size;
            const ctx = cv.getContext("2d");
            if (!ctx) return null;
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            drawFn(ctx);
            return new THREE.CanvasTexture(cv);
        };

        const getFontString = (sizeStr: any, fontStyle: string, defaultSize: number) => {
            const sz = sizeStr || defaultSize;
            if (fontStyle === "Italic") return `italic 900 ${sz}px Impact, sans-serif`;
            if (fontStyle === "Script") return `bold ${sz}px "Brush Script MT", cursive`;
            if (fontStyle === "Block") return `900 ${sz}px "Courier New", monospace`;
            if (fontStyle === "Varsity") return `900 ${sz}px "Arial Black", sans-serif`;
            // Default and Outline use Impact
            return `900 ${sz}px Impact, sans-serif`;
        };

        const front = makeCanvas((ctx) => {
            if (state.frontText) {
                const isOutline = state.frontFont === "Outline";
                ctx.font = getFontString(state.frontTextSize, state.frontFont, 110);

                ctx.strokeStyle = isOutline ? (state.frontTextColor || textColor) : state.primary;
                ctx.lineWidth = isOutline ? 4 : 8;

                // Max width to prevent horizontal canvas clipping
                const maxWidth = size * 0.9;
                ctx.strokeText(state.frontText, size * 0.5, size * 0.28, maxWidth);

                if (!isOutline) {
                    ctx.fillStyle = state.frontTextColor || textColor;
                    ctx.fillText(state.frontText, size * 0.5, size * 0.28, maxWidth);
                }
            }
            if (state.number && (state.numberPosition === "Both" || state.numberPosition === "Front")) {
                const isOutline = state.numberFont === "Outline";
                ctx.font = getFontString(320, state.numberFont, 320);

                ctx.strokeStyle = isOutline ? (state.numberColor || textColor) : state.primary;
                ctx.lineWidth = isOutline ? 8 : 16;
                ctx.strokeText(state.number, size * 0.5, size * 0.62, size * 0.9);

                if (!isOutline) {
                    ctx.fillStyle = state.numberColor || textColor;
                    ctx.fillText(state.number, size * 0.5, size * 0.62, size * 0.9);
                }
            }
        });

        const back = makeCanvas((ctx) => {
            if (state.backText) {
                const isOutline = state.backFont === "Outline";
                ctx.font = getFontString(state.backTextSize, state.backFont, 80);

                ctx.strokeStyle = isOutline ? (state.backTextColor || textColor) : state.primary;
                ctx.lineWidth = isOutline ? 4 : 6;

                const maxWidth = size * 0.9;
                ctx.strokeText(state.backText, size * 0.5, size * 0.2, maxWidth);

                if (!isOutline) {
                    ctx.fillStyle = state.backTextColor || textColor;
                    ctx.fillText(state.backText, size * 0.5, size * 0.2, maxWidth);
                }
            }
            if (state.number && (state.numberPosition === "Both" || state.numberPosition === "Back")) {
                const isOutline = state.numberFont === "Outline";
                ctx.font = getFontString(380, state.numberFont, 380);

                ctx.strokeStyle = isOutline ? (state.numberColor || textColor) : state.primary;
                ctx.lineWidth = isOutline ? 8 : 16;
                ctx.strokeText(state.number, size * 0.5, size * 0.6, size * 0.9);

                if (!isOutline) {
                    ctx.fillStyle = state.numberColor || textColor;
                    ctx.fillText(state.number, size * 0.5, size * 0.6, size * 0.9);
                }
            }
        });

        if (front) front.anisotropy = 16;
        if (back) back.anisotropy = 16;

        return { front, back };
    }, [state]);
}

// Preload the model to prevent popping
useGLTF.preload('/models/shirt_baked.glb');

function Jersey3D({ colors }: { colors: any; collar: boolean }) {
    const { nodes } = useGLTF('/models/shirt_baked.glb') as any;
    const { front, back } = useJerseyDecals(colors);

    const roughness = colors.fabric === "Premium" ? 0.3 : 0.72;

    // Directly set color every render so it's always in sync with the chosen color
    const shirtMat = useMemo(() => new THREE.MeshStandardMaterial({
        roughness,
        metalness: 0.06,
        envMapIntensity: 1.2,
    }), [roughness]);
    shirtMat.color.set(colors.primary);

    return (
        <group scale={[2.2, 2.2, 2.2]} position={[0, -0.1, 0]}>
            <mesh castShadow receiveShadow geometry={nodes.T_Shirt_male.geometry} material={shirtMat} dispose={null}>
                {front && (
                    <Decal position={[0, 0.04, 0.15]} rotation={[0, 0, 0]} scale={[0.26, 0.26, 0.25]}>
                        <meshStandardMaterial
                            map={front} transparent alphaTest={0.02}
                            depthWrite={false} polygonOffset polygonOffsetFactor={-4}
                            roughness={roughness} envMapIntensity={1.0}
                        />
                    </Decal>
                )}
                {back && (
                    <Decal position={[0, 0.04, -0.15]} rotation={[0, Math.PI, 0]} scale={[0.28, 0.28, 0.25]}>
                        <meshStandardMaterial
                            map={back} transparent alphaTest={0.02}
                            depthWrite={false} polygonOffset polygonOffsetFactor={-4}
                            roughness={roughness} envMapIntensity={1.0}
                        />
                    </Decal>
                )}
            </mesh>
        </group>
    );
}

// ─── Jersey SVG Thumbnails ──────────────────────────────────────────────────
function JerseySVG({
    primary = "#2196F3",
    secondary = "#1A1A2E",
    pattern = "plain",
    selected = false,
}: {
    primary?: string;
    secondary?: string;
    pattern?: string;
    selected?: boolean;
}) {
    const patterns: Record<string, JSX.Element> = {
        plain: <></>,
        strike: (
            <>
                <polygon points="60,10 80,10 50,90 30,90" fill={secondary} opacity="0.55" />
            </>
        ),
        save: (
            <>
                <rect x="0" y="0" width="45" height="100" fill={secondary} opacity="0.35" />
            </>
        ),
        fastbreak: (
            <>
                <polygon points="0,0 30,0 0,50" fill={secondary} opacity="0.45" />
                <polygon points="100,50 100,100 70,100" fill={secondary} opacity="0.45" />
            </>
        ),
        final: (
            <>
                <rect x="0" y="0" width="35" height="100" fill={secondary} opacity="0.5" />
                <rect x="65" y="0" width="35" height="100" fill={secondary} opacity="0.5" />
            </>
        ),
        victory: (
            <>
                <polygon points="0,0 40,0 20,100 0,100" fill={secondary} opacity="0.45" />
            </>
        ),
        city: (
            <>
                <rect x="0" y="0" width="100" height="100" fill={secondary} opacity="0.12" />
                <line x1="0" y1="25" x2="100" y2="25" stroke={secondary} strokeWidth="4" opacity="0.4" />
                <line x1="0" y1="50" x2="100" y2="50" stroke={secondary} strokeWidth="4" opacity="0.4" />
                <line x1="0" y1="75" x2="100" y2="75" stroke={secondary} strokeWidth="4" opacity="0.4" />
            </>
        ),
        pure: (
            <>
                <polygon points="70,0 100,0 100,40" fill={secondary} opacity="0.45" />
            </>
        ),
        level: (
            <>
                <polygon points="0,0 55,0 0,70" fill={secondary} opacity="0.5" />
            </>
        ),
        vivo: (
            <>
                <polygon points="60,100 100,0 100,100" fill={secondary} opacity="0.5" />
            </>
        ),
        orion: (
            <>
                <polygon points="30,20 70,20 90,60 50,90 10,60" fill="white" opacity="0.18" />
                <polygon points="40,30 60,30 70,55 50,72 30,55" fill={secondary} opacity="0.25" />
            </>
        ),
        animal: (
            <>
                <path d="M0,0 Q25,40 50,10 Q75,40 100,0 L100,50 Q75,80 50,55 Q25,80 0,50 Z" fill={secondary} opacity="0.35" />
            </>
        ),
        avatar: (
            <>
                <polygon points="0,100 45,0 55,0 0,100" fill={secondary} opacity="0.5" />
            </>
        ),
        league: (
            <>
                <rect x="0" y="0" width="50" height="100" fill={secondary} opacity="0.3" />
                <rect x="50" y="0" width="50" height="100" fill={primary} opacity="0.2" />
            </>
        ),
        magic: (
            <>
                <radialGradient id="mg" cx="50%" cy="40%">
                    <stop offset="0%" stopColor={secondary} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={secondary} stopOpacity="0" />
                </radialGradient>
                <rect x="0" y="0" width="100" height="100" fill="url(#mg)" />
            </>
        ),
        raid: (
            <>
                <rect x="0" y="0" width="100" height="50" fill={secondary} opacity="0.45" />
            </>
        ),
        rush: (
            <>
                <polygon points="0,0 0,100 40,100" fill={secondary} opacity="0.5" />
            </>
        ),
        score: (
            <>
                <polygon points="0,0 100,0 100,100" fill={secondary} opacity="0.45" />
            </>
        ),
    };

    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* jersey body */}
            <path
                d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
                fill={primary}
            />
            {/* pattern overlay */}
            <clipPath id="jerseyClip">
                <path d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z" />
            </clipPath>
            <g clipPath="url(#jerseyClip)">{patterns[pattern] ?? <></>}</g>
            {/* collar */}
            <path d="M38,18 Q50,30 62,18" fill="none" stroke={secondary} strokeWidth="3.5" strokeLinecap="round" />
            {/* outline */}
            <path
                d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
                fill="none"
                stroke={selected ? "#E63946" : "rgba(0,0,0,0.18)"}
                strokeWidth={selected ? 3 : 1.5}
            />
        </svg>
    );
}

// ─── Design Templates ───────────────────────────────────────────────────────
const JERSEY_DESIGNS = [
    { id: "throw", label: "Throw", pattern: "plain" },
    { id: "strike", label: "Strike", pattern: "strike" },
    { id: "save", label: "Save", pattern: "save" },
    { id: "fastbreak", label: "Fast Break", pattern: "fastbreak" },
    { id: "final", label: "Final", pattern: "final" },
    { id: "victory", label: "Victory", pattern: "victory" },
    { id: "city", label: "City", pattern: "city" },
    { id: "pure", label: "Pure", pattern: "pure" },
    { id: "level", label: "Level", pattern: "level" },
    { id: "vivo", label: "Vivo", pattern: "vivo" },
    { id: "orion", label: "Orion", pattern: "orion" },
    { id: "animal", label: "Animal", pattern: "animal" },
    { id: "avatar", label: "Avatar", pattern: "avatar" },
    { id: "league", label: "League", pattern: "league" },
    { id: "magic", label: "Magic", pattern: "magic" },
    { id: "raid", label: "Raid", pattern: "raid" },
    { id: "rush", label: "Rush", pattern: "rush" },
    { id: "score", label: "Score", pattern: "score" },
];

// ─── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${value ? "bg-zinc-900" : "bg-zinc-300"}`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? "translate-x-5" : "translate-x-0"}`}
            />
        </button>
    );
}

// ─── Sidebar Tabs ───────────────────────────────────────────────────────────
const TABS = [
    { id: "designs", icon: LayoutTemplate, label: "Designs" },
    { id: "colors", icon: Palette, label: "Colors" },
    { id: "patterns", icon: Grid, label: "Patterns" },
    { id: "text", icon: Type, label: "Text" },
    { id: "logos", icon: ImageIcon, label: "Logos" },
    { id: "style", icon: Scissors, label: "Style" },
    { id: "fabric", icon: Box, label: "Fabric" },
    { id: "ai", icon: Sparkles, label: "AI Magic" },
];

// ─── View Handler ───────────────────────────────────────────────────────────
function ViewHandler({ currentView }: { currentView: string }) {
    const controlsRef = useRef<any>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (!controlsRef.current) return;

        let shouldUpdate = false;
        if (currentView === "front") {
            camera.position.set(0, 0.1, 4);
            shouldUpdate = true;
        } else if (currentView === "back") {
            camera.position.set(0, 0.1, -4);
            shouldUpdate = true;
        } else if (currentView === "sleeves") {
            camera.position.set(4, 0.1, 0); // Side view
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            controlsRef.current.target.set(0, 0.1, 0);
            controlsRef.current.update();
        }
    }, [currentView, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI * 0.75}
            minDistance={2.5}
            maxDistance={7}
            autoRotate={currentView === "360"}
            autoRotateSpeed={5}
        />
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CustomizerLayout() {
    const [activeTab, setActiveTab] = useState("designs");
    const [qty, setQty] = useState(1);
    const [selectedDesign, setSelectedDesign] = useState("throw");
    const [currentView, setCurrentView] = useState("360");
    const [state, setState] = useState({
        primary: "#2196F3",
        secondary: "#1A1A2E",
        pattern: "None",
        frontText: "VALKYRIE",
        frontFont: "Bold",
        frontTextColor: "#FFFFFF",
        frontTextSize: 110,
        backText: "PLAYER",
        backFont: "Bold",
        backTextColor: "#FFFFFF",
        backTextSize: 80,
        number: "10",
        numberFont: "Bold",
        numberColor: "#111111",
        numberPosition: "Both",
        sleeve: "Short",
        fabric: "Polyester",
        collar: true,
        zipper: false,
    });

    const updateState = (key: string, value: any) => setState((s) => ({ ...s, [key]: value }));

    const calculatePrice = () => {
        let base = 49;
        if (qty >= 10 && qty < 50) base = 39;
        if (qty >= 50) base = 29;
        if (state.fabric === "Premium") base += 10;
        return base * qty;
    };

    const currentPattern =
        JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.pattern ?? "plain";

    return (
        <div className="flex h-screen w-full bg-white flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200">
                <Link href="/" className="text-zinc-600"><ChevronLeft /></Link>
                <div className="font-bold">Jersey Builder</div>
            </div>

            {/* ── Icon Sidebar ── */}
            <div className="hidden md:flex w-20 flex-col items-center bg-white border-r border-zinc-200 py-6 gap-4 z-20 overflow-y-auto">
                <Link href="/" className="mb-2">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:bg-black transition-colors">V</div>
                </Link>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all w-16 ${activeTab === tab.id ? "bg-zinc-100 text-red-600" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span className="text-[9px] font-bold leading-tight text-center">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Settings Panel ── */}
            <div className="w-full md:w-80 bg-white border-r border-zinc-200 flex flex-col h-full z-10 shadow-lg">
                <div className="p-5 border-b border-zinc-200 bg-zinc-50/60">
                    <h2 className="text-lg font-bold text-zinc-900 capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Customize your jersey</p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.18 }}
                        >

                            {/* ── DESIGNS TAB ── */}
                            {activeTab === "designs" && (
                                <div className="space-y-5">
                                    {/* Collar toggle */}
                                    <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                                        <span className="text-sm font-semibold text-zinc-800">Add Collar</span>
                                        <Toggle value={state.collar} onChange={(v) => updateState("collar", v)} />
                                    </div>
                                    {/* Zipper toggle */}
                                    <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                                        <span className="text-sm font-semibold text-zinc-800">Add Zipper</span>
                                        <Toggle value={state.zipper} onChange={(v) => updateState("zipper", v)} />
                                    </div>

                                    {/* Grid of designs */}
                                    <div className="grid grid-cols-4 gap-3 pt-1">
                                        {JERSEY_DESIGNS.map((d) => (
                                            <button
                                                key={d.id}
                                                onClick={() => setSelectedDesign(d.id)}
                                                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${selectedDesign === d.id
                                                    ? "bg-red-50 ring-2 ring-red-500"
                                                    : "hover:bg-zinc-50"}`}
                                            >
                                                <div className="w-14 h-14">
                                                    <JerseySVG
                                                        primary={state.primary}
                                                        secondary={state.secondary}
                                                        pattern={d.pattern}
                                                        selected={selectedDesign === d.id}
                                                    />
                                                </div>
                                                <span className={`text-[9px] font-bold leading-tight text-center ${selectedDesign === d.id ? "text-red-600" : "text-zinc-500"}`}>
                                                    {d.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── COLORS TAB ── */}
                            {activeTab === "colors" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-3 block">Primary Color</label>
                                        <div className="flex gap-2 flex-wrap mb-3">
                                            {["#E63946", "#2196F3", "#111111", "#FFFFFF", "#457B9D", "#2A9D8F", "#F4A261", "#6C63FF", "#FF6B6B", "#43AA8B"].map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => updateState("primary", c)}
                                                    className={`w-9 h-9 rounded-full border-2 transition-transform ${state.primary === c ? "border-zinc-900 scale-110 ring-2 ring-offset-1 ring-zinc-400" : "border-black/10 hover:scale-105"}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <input
                                                type="color"
                                                value={state.primary}
                                                onChange={(e) => updateState("primary", e.target.value)}
                                                className="w-9 h-9 rounded cursor-pointer border border-zinc-200"
                                            />
                                            <span className="text-xs text-zinc-500 font-mono">{state.primary.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-3 block">Secondary Color</label>
                                        <div className="flex gap-2 flex-wrap mb-3">
                                            {["#1A1A2E", "#111111", "#FFFFFF", "#E63946", "#457B9D", "#2A9D8F", "#F77F00", "#6C63FF", "#264653", "#023047"].map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => updateState("secondary", c)}
                                                    className={`w-9 h-9 rounded-full border-2 transition-transform ${state.secondary === c ? "border-zinc-900 scale-110 ring-2 ring-offset-1 ring-zinc-400" : "border-black/10 hover:scale-105"}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <input
                                                type="color"
                                                value={state.secondary}
                                                onChange={(e) => updateState("secondary", e.target.value)}
                                                className="w-9 h-9 rounded cursor-pointer border border-zinc-200"
                                            />
                                            <span className="text-xs text-zinc-500 font-mono">{state.secondary.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── PATTERNS TAB ── */}
                            {activeTab === "patterns" && (
                                <div className="space-y-2">
                                    {["None", "Lightning", "Stripes", "Abstract", "Geometric", "Camouflage", "Minimal", "Diagonal", "Gradient", "Diamond"].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => updateState("pattern", p)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border font-semibold text-sm transition-all ${state.pattern === p ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 hover:border-zinc-300 text-zinc-700"}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── TEXT TAB ── */}
                            {activeTab === "text" && (
                                <div className="space-y-6">
                                    {/* ── Front Side Section ── */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-2">Front Side</h3>
                                        <div>
                                            <input
                                                type="text"
                                                value={state.frontText}
                                                onChange={(e) => updateState("frontText", e.target.value)}
                                                className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-red-500 text-sm"
                                                placeholder="Front Text..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Font Style</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {["Bold", "Italic", "Script", "Block", "Outline", "Varsity"].map((f) => (
                                                    <button
                                                        key={f}
                                                        onClick={() => updateState("frontFont", f)}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.frontFont === f ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Text Color</label>
                                            <div className="flex gap-1.5 flex-wrap items-center">
                                                {["#FFFFFF", "#111111", "#E63946", "#2196F3", "#FFD700", "#2A9D8F"].map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateState("frontTextColor", c)}
                                                        className={`w-7 h-7 rounded-full border-2 transition-transform ${state.frontTextColor === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                <div className="w-[1px] h-4 bg-zinc-300 mx-1"></div>
                                                <input
                                                    type="color"
                                                    value={state.frontTextColor}
                                                    onChange={(e) => updateState("frontTextColor", e.target.value)}
                                                    className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 flex justify-between">
                                                <span>Text Size</span>
                                                <span className="text-zinc-500">{state.frontTextSize}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="40" max="250"
                                                value={state.frontTextSize}
                                                onChange={(e) => updateState("frontTextSize", parseInt(e.target.value))}
                                                className="w-full accent-red-600"
                                            />
                                        </div>
                                    </div>

                                    {/* ── Back Side Section ── */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-2">Back Side</h3>
                                        <div>
                                            <input
                                                type="text"
                                                value={state.backText}
                                                onChange={(e) => updateState("backText", e.target.value)}
                                                className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-red-500 text-sm"
                                                placeholder="Back Text..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Font Style</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {["Bold", "Italic", "Script", "Block", "Outline", "Varsity"].map((f) => (
                                                    <button
                                                        key={f}
                                                        onClick={() => updateState("backFont", f)}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.backFont === f ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Text Color</label>
                                            <div className="flex gap-1.5 flex-wrap items-center">
                                                {["#FFFFFF", "#111111", "#E63946", "#2196F3", "#FFD700", "#2A9D8F"].map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateState("backTextColor", c)}
                                                        className={`w-7 h-7 rounded-full border-2 transition-transform ${state.backTextColor === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                <div className="w-[1px] h-4 bg-zinc-300 mx-1"></div>
                                                <input
                                                    type="color"
                                                    value={state.backTextColor}
                                                    onChange={(e) => updateState("backTextColor", e.target.value)}
                                                    className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 flex justify-between">
                                                <span>Text Size</span>
                                                <span className="text-zinc-500">{state.backTextSize}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="40" max="250"
                                                value={state.backTextSize}
                                                onChange={(e) => updateState("backTextSize", parseInt(e.target.value))}
                                                className="w-full accent-red-600"
                                            />
                                        </div>
                                    </div>

                                    {/* ── Player Number Section ── */}
                                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                                        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-2">Player Number</h3>
                                        <div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="99"
                                                value={state.number}
                                                onChange={(e) => updateState("number", e.target.value)}
                                                className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-bold text-2xl text-center focus:outline-none focus:border-red-500"
                                                placeholder="10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Number Font</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {["Bold", "Block", "Varsity", "Outline", "College", "Athletic"].map((f) => (
                                                    <button
                                                        key={f}
                                                        onClick={() => updateState("numberFont", f)}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.numberFont === f ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Number Color</label>
                                            <div className="flex gap-1.5 flex-wrap items-center">
                                                {["#FFFFFF", "#111111", "#E63946", "#FFD700", "#2196F3", "#2A9D8F"].map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateState("numberColor", c)}
                                                        className={`w-7 h-7 rounded-full border-2 transition-transform ${state.numberColor === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                <div className="w-[1px] h-4 bg-zinc-300 mx-1"></div>
                                                <input
                                                    type="color"
                                                    value={state.numberColor}
                                                    onChange={(e) => updateState("numberColor", e.target.value)}
                                                    className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">Number Position</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {["Front", "Back", "Both"].map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => updateState("numberPosition", p)}
                                                        className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all ${state.numberPosition === p ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── LOGOS TAB ── */}
                            {activeTab === "logos" && (
                                <div className="space-y-5">
                                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-red-400 cursor-pointer transition-all">
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-bold">Upload Logo</span>
                                        <span className="text-xs mt-1">PNG, SVG up to 5MB</span>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-2 block">Logo Position</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["Left Chest", "Center", "Right Chest", "Back Top", "Back Center", "Sleeve"].map((p) => (
                                                <button key={p} className="p-2 rounded-lg border text-[10px] font-bold border-zinc-200 hover:border-red-400 hover:bg-red-50 transition-all text-zinc-700 leading-tight text-center">
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-2 block">Logo Size</label>
                                        <input type="range" min="1" max="10" defaultValue="5" className="w-full accent-red-600" />
                                        <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                            <span>Small</span><span>Large</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── STYLE TAB ── */}
                            {activeTab === "style" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-2 block">Sleeves</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Short", "Long", "Sleeveless", "3/4"].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateState("sleeve", s)}
                                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${state.sleeve === s ? "border-red-500 bg-red-50 text-red-600" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-2 block">Collar Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["V-Neck", "Round", "Polo", "Henley"].map((c) => (
                                                <button key={c} className="p-3 rounded-xl border text-sm font-bold border-zinc-200 text-zinc-600 hover:border-red-400 hover:bg-red-50 transition-all">
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 mb-2 block">Cut & Fit</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["Slim Fit", "Regular", "Relaxed"].map((f) => (
                                                <button key={f} className="p-2.5 rounded-lg border text-xs font-bold border-zinc-200 text-zinc-600 hover:border-red-400 hover:bg-red-50 transition-all">
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── FABRIC TAB ── */}
                            {activeTab === "fabric" && (
                                <div className="space-y-3">
                                    {[
                                        { name: "Polyester", desc: "Lightweight & durable", extra: "" },
                                        { name: "Mesh", desc: "Max breathability", extra: "" },
                                        { name: "Dry Fit", desc: "Moisture-wicking", extra: "" },
                                        { name: "Premium", desc: "Pro-grade fabric", extra: "+$10" },
                                        { name: "Recycled", desc: "Eco-friendly choice", extra: "" },
                                    ].map((f) => (
                                        <button
                                            key={f.name}
                                            onClick={() => updateState("fabric", f.name)}
                                            className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${state.fabric === f.name ? "border-red-500 bg-red-50" : "border-zinc-200 hover:border-zinc-300"}`}
                                        >
                                            <div>
                                                <div className={`font-bold text-sm ${state.fabric === f.name ? "text-red-700" : "text-zinc-800"}`}>{f.name}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5">{f.desc}</div>
                                            </div>
                                            {f.extra && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">{f.extra}</span>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── AI TAB ── */}
                            {activeTab === "ai" && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-5 rounded-2xl text-white shadow-xl shadow-indigo-500/30">
                                        <Wand2 className="w-7 h-7 mb-2" />
                                        <h3 className="font-bold text-lg mb-1">AI Generator</h3>
                                        <p className="text-xs text-white/80 mb-4">Describe your team's vibe and let AI design the perfect kit.</p>
                                        <textarea
                                            placeholder="e.g. A futuristic cyber punk design with neon green accents..."
                                            className="w-full bg-black/20 rounded-xl p-3 text-sm placeholder:text-white/50 border-none outline-none resize-none h-24"
                                        />
                                        <button className="w-full mt-3 bg-white text-indigo-600 font-bold py-2.5 rounded-xl shadow-sm hover:scale-[1.02] transition-transform text-sm">
                                            ✨ Generate Design
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quick Prompts</p>
                                        {["Fire team energy", "Ocean blue wave", "Midnight galaxy", "Urban street style"].map((p) => (
                                            <button key={p} className="w-full text-left px-4 py-2.5 rounded-xl bg-zinc-50 hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-300 text-sm font-medium text-zinc-700 transition-all">
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── 3D Canvas ── */}
            <div className="flex-1 relative flex flex-col" style={{ background: `radial-gradient(ellipse at 50% 40%, ${state.primary}18 0%, #f0f0f0 65%)` }}>
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 z-10 pointer-events-none">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
                        <Save className="w-4 h-4" /> Save
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>

                {/* Design name badge */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-white/80 backdrop-blur-sm text-xs font-bold text-zinc-700 px-3 py-1.5 rounded-full shadow border border-zinc-200 capitalize">
                        {JERSEY_DESIGNS.find(d => d.id === selectedDesign)?.label ?? "Custom"} Design
                        {state.collar ? " • Collar" : ""}
                        {state.zipper ? " • Zipper" : ""}
                    </span>
                </div>

                <Canvas
                    camera={{ position: [0, 0.1, 4], fov: 38 }}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                >
                    {/* Transparent background so parent div gradient shows through */}
                    <color attach="background" args={["transparent" as any]} />
                    <ambientLight intensity={1.1} />
                    <Environment preset="apartment" />
                    {/* Front key */}
                    <directionalLight position={[1, 4, 5]} intensity={1.4} castShadow />
                    {/* Back fill — critical for back side visibility */}
                    <directionalLight position={[-1, 3, -5]} intensity={1.1} />
                    {/* Accent rim using primary color tint */}
                    <pointLight position={[-3, 1, 2]} intensity={0.8} />
                    <pointLight position={[3, 1, -2]} intensity={0.5} />
                    <Center>
                        <Jersey3D colors={state} collar={state.collar} />
                    </Center>
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={8} blur={3} />
                    <ViewHandler currentView={currentView} />
                </Canvas>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-black/5">
                    <button onClick={() => setCurrentView("360")} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "360" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}>360° View</button>
                    <button onClick={() => setCurrentView("front")} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "front" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}>Front</button>
                    <button onClick={() => setCurrentView("back")} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "back" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}>Back</button>
                    <button onClick={() => setCurrentView("sleeves")} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "sleeves" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}>Sleeves</button>
                </div>
            </div>

            {/* ── Right Pricing Panel ── */}
            <div className="w-full md:w-72 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-20">
                <div className="p-5 border-b border-zinc-200 flex-1 overflow-y-auto">
                    <h2 className="text-lg font-bold text-zinc-900 mb-5">Order Summary</h2>

                    {/* Live preview thumbnail */}
                    <div className="w-24 h-24 mx-auto mb-4">
                        <JerseySVG
                            primary={state.primary}
                            secondary={state.secondary}
                            pattern={currentPattern}
                            selected={false}
                        />
                    </div>
                    <p className="text-center text-xs font-bold text-zinc-500 mb-5 capitalize">
                        {JERSEY_DESIGNS.find(d => d.id === selectedDesign)?.label} · {state.sleeve} Sleeve
                    </p>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Base Jersey</span>
                            <span className="font-bold text-zinc-900">${qty >= 10 ? (qty >= 50 ? "29" : "39") : "49"}</span>
                        </div>
                        {state.fabric === "Premium" && (
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Premium Fabric</span>
                                <span className="font-bold text-zinc-900">+$10</span>
                            </div>
                        )}
                        {state.collar && (
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Collar</span>
                                <span className="font-bold text-zinc-900">Included</span>
                            </div>
                        )}
                        {state.zipper && (
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Zipper</span>
                                <span className="font-bold text-zinc-900">+$5</span>
                            </div>
                        )}

                        <div className="border-t border-zinc-100 pt-4">
                            <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={qty}
                                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full border border-zinc-200 rounded-xl p-2.5 text-center font-bold focus:outline-red-500 text-lg"
                            />
                            <div className="text-[11px] text-green-600 mt-2 font-semibold text-center">
                                {qty >= 50
                                    ? "🎉 50+ Bulk discount applied!"
                                    : qty >= 10
                                        ? `Team discount! Add ${50 - qty} more for bulk rate.`
                                        : `Add ${10 - qty} more for team discount.`}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-zinc-50 border-t border-zinc-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-zinc-600">Total</span>
                        <span className="text-3xl font-extrabold text-zinc-900">${calculatePrice() + (state.zipper ? 5 * qty : 0)}</span>
                    </div>
                    <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm">
                        <ShoppingCart className="w-5 h-5" /> Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
