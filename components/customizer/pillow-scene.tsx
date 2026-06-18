"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import {
  Palette,
  Grid,
  Type,
  Image as ImageIcon,
  ChevronLeft,
  Save,
  Share2,
  Download,
  ShoppingCart,
  LayoutTemplate,
  Copy,
  Trash2,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Realistic Pillow Geometry ─────────────────────────────────────────────────
// Keep the mathematical geometry exactly as approved.
function usePillowGeometry(W: number, H: number, D: number) {
  return useMemo(() => {
    const segs = 96; // High resolution smoothness
    const geo = new THREE.BoxGeometry(W, H, 0.01, segs, segs, 1);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Normalized coordinates between -1 and 1
      const nx = x / (W * 0.5);
      const ny = y / (H * 0.5);

      // 1. Inward corner curve (Pinch Factor)
      const pinchFactor = 0.12;
      const newX = x * (1.0 - pinchFactor * (-0.0 - nx * nx) * (ny * ny));
      const newY = y * (1.0 - pinchFactor * (-0.0 - ny * ny) * (nx * nx));

      // 2. Inflation profiles (Cosine bulging)
      const profile = Math.cos((nx * Math.PI) / 2) * Math.cos((ny * Math.PI) / 2);
      const puff = Math.pow(profile, 0.50);

      if (z > 0) {
        z = puff * 1.5 * (D * 0.9);
      } else if (z < 0) {
        z = -puff * 1.5 * (D * 0.9);
      }

      // 3. Fabric noise simulation
      const s = 24;
      const amp = 0.006 * profile;
      const noise =
        Math.sin(nx * s * 2) * Math.sin(ny * s * 2) * amp +
        Math.sin(nx * s * 1.1 + 1.1) * Math.sin(ny * s * 1.1) * amp * 0.45;

      pos.setXYZ(i, newX, newY, z + noise);
    }

    geo.computeVertexNormals();
    return geo;
  }, [W, H, D]);
}

// ── Types ────────────────────────────────────────────────────────────────────
interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  font: string;
  color: string;
  textSize: number;
  side: "Front" | "Back";
  letterSpacing?: number;
  lineSpacing?: number;
  curveRadius?: number;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  outlineEnabled?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
}

interface LogoLayer {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  side: "Front" | "Back";
  baseSize: number;
  opacity?: number;
  eraserPaths?: Array<{
    points: Array<{ x: number; y: number }>;
    size: number;
  }>;
  type?: "logo" | "image";
  zOrder?: "bottom" | "above-text";
}

const TABS = [
  { id: "designs", icon: LayoutTemplate, label: "Designs" },
  { id: "colors", icon: Palette, label: "Colors" },
  { id: "patterns", icon: Grid, label: "Patterns" },
  { id: "text", icon: Type, label: "Text" },
  { id: "logos", icon: ImageIcon, label: "Uploads" },
];

const PILLOW_DESIGNS = [
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

const PATTERN_DEFAULT_COLORS: Record<string, { bg: string; design: string }> = {
  "/assets/images/patterns/pattern_1.png": { bg: "#FFFFFF", design: "#d73099" },
  "/assets/images/patterns/pattern_2.png": { bg: "#FFFFFF", design: "#5A6B7C" },
  "/assets/images/patterns/pattern_3.png": { bg: "#FFFFFF", design: "#0F7643" },
  "/assets/images/patterns/pattern_4.png": { bg: "#FFFFFF", design: "#8db97b" },
  "/assets/images/patterns/pattern_5.png": { bg: "#FFFFFF", design: "#E52E2E" },
};

const getFontFamily = (font: string) => {
  if (font === "Script") return '"Brush Script MT", cursive';
  if (font === "Block") return '"Courier New", monospace';
  if (font === "Varsity") return '"Arial Black", sans-serif';
  if (font === "Serif Athletic") return '"Alfa Slab One", serif';
  if (font === "Cyberpunk") return '"Orbitron", sans-serif';
  if (font === "Grunge") return '"Rubik Glitch", display';
  if (font === "Neon Glow") return '"Monoton", sans-serif';
  if (font === "Gothic") return '"UnifrakturMaguntia", serif';
  return "Impact, sans-serif";
};

const getFontWeight = (font: string) => {
  if (font === "Grunge" || font === "Neon Glow" || font === "Gothic")
    return "400";
  return "900";
};

const getFontStyle = (font: string) => {
  return font === "Italic" ? "italic" : "normal";
};

const ERASER_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 20H7L3 16c-1-1-1-3 0-4L12 3c1-1 3-1 4 0l5 5c1 1 1 3 0 4l-5 5z' fill='%23fca5a5'/><path d='M12 3l4 4'/></svg>") 3 17, auto`;

// ── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
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

// ── Pillow SVG Thumbnail Preview ──────────────────────────────────────────────
function PillowSVG({
  primary = "#FFFFFF",
  secondary = "#111111",
  pattern = "plain",
  selected = false,
}: {
  primary?: string;
  secondary?: string;
  pattern?: string;
  selected?: boolean;
}) {
  const patterns: Record<string, React.JSX.Element> = {
    plain: <></>,
    strike: <polygon points="60,10 80,10 50,90 30,90" fill={secondary} />,
    save: <rect x="0" y="0" width="45" height="100" fill={secondary} />,
    fastbreak: (
      <>
        <polygon points="0,0 30,0 0,50" fill={secondary} />
        <polygon points="100,50 100,100 70,100" fill={secondary} />
      </>
    ),
    final: (
      <>
        <rect x="0" y="0" width="35" height="100" fill={secondary} />
        <rect x="65" y="0" width="35" height="100" fill={secondary} />
      </>
    ),
    victory: <polygon points="0,0 40,0 20,100 0,100" fill={secondary} />,
    city: (
      <>
        <line x1="0" y1="25" x2="100" y2="25" stroke={secondary} strokeWidth="4" />
        <line x1="0" y1="50" x2="100" y2="50" stroke={secondary} strokeWidth="4" />
        <line x1="0" y1="75" x2="100" y2="75" stroke={secondary} strokeWidth="4" />
      </>
    ),
    pure: <polygon points="70,0 100,0 100,40" fill={secondary} />,
    level: <polygon points="0,0 55,0 0,70" fill={secondary} />,
    vivo: <polygon points="60,100 100,0 100,100" fill={secondary} />,
    orion: (
      <>
        <polygon points="30,20 70,20 90,60 50,90 10,60" fill="white" opacity="0.18" />
        <polygon points="40,30 60,30 70,55 50,72 30,55" fill={secondary} />
      </>
    ),
    animal: <path d="M0,0 Q25,40 50,10 Q75,40 100,0 L100,50 Q75,80 50,55 Q25,80 0,50 Z" fill={secondary} />,
    avatar: <polygon points="0,100 45,0 55,0 0,100" fill={secondary} />,
    league: (
      <>
        <rect x="0" y="0" width="50" height="100" fill={secondary} />
        <rect x="50" y="0" width="50" height="100" fill={primary} opacity="0.3" />
      </>
    ),
    magic: (
      <>
        <radialGradient id="mg-pillow" cx="50%" cy="40%">
          <stop offset="0%" stopColor={secondary} stopOpacity="1" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <rect x="0" y="0" width="100" height="100" fill="url(#mg-pillow)" />
      </>
    ),
    raid: <rect x="0" y="0" width="100" height="50" fill={secondary} />,
    rush: <polygon points="0,0 0,100 40,100" fill={secondary} />,
    score: <polygon points="0,0 100,0 100,100" fill={secondary} />,
  };

  return (
    <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <clipPath id="pillowClip">
        <path d="M 15 15 C 30 18, 90 18, 105 15 C 102 30, 102 70, 105 85 C 90 82, 30 82, 15 85 C 18 70, 18 30, 15 15 Z" />
      </clipPath>
      {/* Subtle bottom drop shadow */}
      <path d="M 15 15 C 30 18, 90 18, 105 15 C 102 30, 102 70, 105 85 C 90 82, 30 82, 15 85 C 18 70, 18 30, 15 15 Z" fill="black" opacity="0.08" transform="translate(1, 2)" />
      {/* Primary body */}
      <path d="M 15 15 C 30 18, 90 18, 105 15 C 102 30, 102 70, 105 85 C 90 82, 30 82, 15 85 C 18 70, 18 30, 15 15 Z" fill={primary} />
      {/* Pattern overlay */}
      <g clipPath="url(#pillowClip)">{patterns[pattern] ?? <></>}</g>
      {/* Shading Highlights */}
      <path d="M 15 15 C 30 18, 90 18, 105 15" fill="none" stroke="white" strokeWidth="1.2" opacity="0.18" />
      <path d="M 15 85 C 30 82, 90 82, 105 85" fill="none" stroke="black" strokeWidth="1.2" opacity="0.12" />
      {/* Border outline */}
      <path
        d="M 15 15 C 30 18, 90 18, 105 15 C 102 30, 102 70, 105 85 C 90 82, 30 82, 15 85 C 18 70, 18 30, 15 15 Z"
        fill="none"
        stroke={selected ? "#E63946" : "rgba(0,0,0,0.18)"}
        strokeWidth={selected ? 3 : 1.5}
      />
    </svg>
  );
}

// ── Logo/Badge Bounding Box Preview Canvas ────────────────────────────────────
function LogoCanvasPreview({
  layer,
  editorScale,
  preloadedImage,
}: {
  layer: LogoLayer;
  editorScale: number;
  preloadedImage?: HTMLImageElement;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imgWidth = preloadedImage?.naturalWidth || preloadedImage?.width || 200;
  const imgHeight = preloadedImage?.naturalHeight || preloadedImage?.height || 200;
  const drawWidth = imgWidth * layer.scale * editorScale;
  const drawHeight = imgHeight * layer.scale * editorScale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = drawWidth;
    canvas.height = drawHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (img: HTMLImageElement) => {
      ctx.clearRect(0, 0, drawWidth, drawHeight);
      ctx.save();
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

      if (layer.eraserPaths && layer.eraserPaths.length > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(0,0,0,1)";

        layer.eraserPaths.forEach((path) => {
          ctx.lineWidth = path.size * layer.scale * editorScale;
          ctx.beginPath();
          path.points.forEach((pt, index) => {
            const x = pt.x * layer.scale * editorScale;
            const y = pt.y * layer.scale * editorScale;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
        });
      }
      ctx.restore();
    };

    if (preloadedImage) {
      draw(preloadedImage);
    } else {
      const img = new Image();
      img.src = layer.src;
      img.crossOrigin = "anonymous";
      img.onload = () => draw(img);
    }
  }, [layer, editorScale, preloadedImage, drawWidth, drawHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${drawWidth}px`,
        height: `${drawHeight}px`,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

// ── ThreeJS Context Grabber ───────────────────────────────────────────────────
function ThreeGrabber({
  threeRef,
}: {
  threeRef: React.MutableRefObject<{
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  } | null>;
}) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    threeRef.current = { gl, scene, camera };
  }, [gl, scene, camera, threeRef]);
  return null;
}

// ── View Rotator Handler ──────────────────────────────────────────────────────
function ViewHandler({ currentView }: { currentView: string }) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    let shouldUpdate = false;

    if (currentView === "front") {
      camera.position.set(0, 0.1, 3.4);
      shouldUpdate = true;
    } else if (currentView === "back") {
      camera.position.set(0, 0.1, -3.4);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [currentView, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      enablePan={false}
      minDistance={1.8}
      maxDistance={8}
      autoRotate={currentView === "360"}
      autoRotateSpeed={4.5}
    />
  );
}

// ── Pillow 3D Rendering Component ─────────────────────────────────────────────
function Pillow3D({
  sideColor,
  frontTexture,
  backTexture,
  fabricFinish,
}: {
  sideColor: string;
  frontTexture: THREE.CanvasTexture | null;
  backTexture: THREE.CanvasTexture | null;
  fabricFinish: string;
}) {
  const groupRef = useRef<Group>(null);
  const pillowGeo = usePillowGeometry(2.8, 2.0, 0.58);

  const roughness = fabricFinish === "velvet" ? 0.65 : fabricFinish === "cotton" ? 0.90 : 0.95;
  const metalness = fabricFinish === "velvet" ? 0.08 : 0.0;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Soft float
    groupRef.current.position.y = Math.sin(t * 1.1) * 0.06;
    // Gentle sway
    groupRef.current.rotation.y = Math.sin(t * 0.38) * 0.18 + Math.PI * 0.08;
    groupRef.current.rotation.x = Math.sin(t * 0.28) * 0.04 - 0.08;
    groupRef.current.rotation.z = Math.sin(t * 0.52) * 0.012;
  });

  // Material array mapping for box geometry: right, left, top, bottom, front, back
  const materials = useMemo(() => {
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: roughness,
      metalness: metalness,
    });

    return [
      edgeMaterial, // right
      edgeMaterial, // left
      edgeMaterial, // top
      edgeMaterial, // bottom
      new THREE.MeshStandardMaterial({
        map: frontTexture || undefined,
        roughness: roughness,
        metalness: metalness,
      }), // front
      new THREE.MeshStandardMaterial({
        map: backTexture || undefined,
        roughness: roughness,
        metalness: metalness,
      }), // back
    ];
  }, [sideColor, frontTexture, backTexture, roughness, metalness]);

  return (
    <group ref={groupRef}>
      <mesh
        castShadow
        receiveShadow
        geometry={pillowGeo}
        material={materials}
        scale={0.65}
      />
    </group>
  );
}

// ── Main Custimizer Layout Dashboard ──────────────────────────────────────────
export default function PillowScene() {
  const [activeTab, setActiveTab] = useState("designs");
  const [qty, setQty] = useState(1);
  const [selectedDesign, setSelectedDesign] = useState("throw");
  const [currentView, setCurrentView] = useState("front");
  const [uploadedLogos, setUploadedLogos] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadSubTab, setUploadSubTab] = useState<"logo" | "image">("logo");

  const threeRef = useRef<{
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  } | null>(null);

  // Resolution 1024x731 mirrors pillow geometry aspect ratio 1.4:1
  const canvasWidth = 1024;
  const canvasHeight = 731;
  const editorWidth = 280;
  const editorHeight = 200;
  const editorScale = editorWidth / canvasWidth; // 0.2734

  const activeSide =
    currentView === "back" || currentView === "back-center" ? "Back" : "Front";

  // State options
  const [state, setState] = useState({
    primary: "#FFFFFF",
    primaryColorSide: "Both",
    primaryFront: "#FFFFFF",
    primaryBack: "#FFFFFF",
    secondary: "#111111",
    designColor: "#111111",
    pattern: "None",
    fabricPatternFront: "None",
    fabricPatternBack: "None",
    fabricPatternCustomizeFront: false,
    fabricPatternColorFront: "#d73099",
    fabricPatternBgFront: "#FFFFFF",
    fabricPatternCustomizeBack: false,
    fabricPatternColorBack: "#d73099",
    fabricPatternBgBack: "#FFFFFF",
    sleeve: "Plain Sewn", // Reused sleeve state to record edge welt styles
    collarType: "None",
    cutFit: "18x18", // Size select mapping
    fabric: "Linen", // Fabric finish selection
    collar: false,
    zipper: false,
    designSide: "Both",
    logo: null as string | null,
    logoPosition: "Center",
    logoSize: 0.15,
  });

  const updateState = (key: string, value: any) =>
    setState((s) => ({ ...s, [key]: value }));

  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [logoLayers, setLogoLayers] = useState<LogoLayer[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [loadedLogoImages, setLoadedLogoImages] = useState<Record<string, HTMLImageElement>>({});
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [eraserBrushSize, setEraserBrushSize] = useState<number>(20);

  const [layersOrder, setLayersOrder] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Sync Layers List Ordering
  useEffect(() => {
    const textIds = textLayers.map((l) => l.id);
    const logoIds = logoLayers.map((l) => l.id);
    const allIds = [...textIds, ...logoIds];

    setLayersOrder((prev) => {
      const existing = prev.filter((id) => allIds.includes(id));
      const newIds = allIds.filter((id) => !existing.includes(id));
      if (existing.length === prev.length && newIds.length === 0) return prev;
      return [...existing, ...newIds];
    });
  }, [textLayers, logoLayers]);

  // Load uploaded assets from local storage on mount
  useEffect(() => {
    const savedLogos = localStorage.getItem("pillow_uploaded_logos");
    if (savedLogos) {
      try {
        setUploadedLogos(JSON.parse(savedLogos));
      } catch (e) {
        console.error(e);
      }
    }
    const savedImages = localStorage.getItem("pillow_uploaded_images");
    if (savedImages) {
      try {
        setUploadedImages(JSON.parse(savedImages));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Web font lazy loader
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Orbitron:wght@900&family=Rubik+Glitch&family=Monoton&family=UnifrakturMaguntia&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  // Pre-load patterns dynamically
  const [loadedPatterns, setLoadedPatterns] = useState<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    const activePatterns = [
      state.fabricPatternFront,
      state.fabricPatternBack,
    ].filter((p) => p && p !== "None");

    activePatterns.forEach((patternPath) => {
      if (loadedPatterns[patternPath]) return;
      const img = new Image();
      img.src = patternPath;
      img.onload = () => {
        setLoadedPatterns((prev) => ({ ...prev, [patternPath]: img }));
      };
    });
  }, [state.fabricPatternFront, state.fabricPatternBack, loadedPatterns]);

  // Async load logo images
  useEffect(() => {
    logoLayers.forEach((layer) => {
      if (loadedLogoImages[layer.src]) return;
      const img = new Image();
      img.src = layer.src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setLoadedLogoImages((prev) => ({ ...prev, [layer.src]: img }));
      };
    });
  }, [logoLayers, loadedLogoImages]);

  // Bounding selectors deselect syncing
  useEffect(() => {
    if (!selectedLogoId) setIsEraserMode(false);
  }, [selectedLogoId]);

  useEffect(() => {
    if (activeTab === "text") setSelectedLogoId(null);
    else if (activeTab === "logos") setSelectedLayerId(null);
  }, [activeTab]);

  useEffect(() => {
    const sideLogos = logoLayers.filter((l) => l.side === activeSide);
    if (sideLogos.length > 0) {
      const currentSelected = logoLayers.find((l) => l.id === selectedLogoId);
      if (!currentSelected || currentSelected.side !== activeSide) {
        setSelectedLogoId(sideLogos[0].id);
      }
    } else {
      setSelectedLogoId(null);
    }
  }, [currentView, activeSide]);

  useEffect(() => {
    const sideText = textLayers.filter((l) => l.side === activeSide);
    if (sideText.length > 0) {
      const currentSelected = textLayers.find((l) => l.id === selectedLayerId);
      if (!currentSelected || currentSelected.side !== activeSide) {
        setSelectedLayerId(sideText[0].id);
      }
    } else {
      setSelectedLayerId(null);
    }
  }, [currentView, activeSide]);

  // Reorder layers mapping
  const reorderLayers = (fromUIIndex: number, toUIIndex: number) => {
    const sideText = textLayers.filter((l) => l.side === activeSide);
    const sideLogos = logoLayers.filter((l) => l.side === activeSide);
    const activeSideLayers = [
      ...sideText.map((l) => ({ ...l, layerType: "text" })),
      ...sideLogos.map((l) => ({ ...l, layerType: "logo" })),
    ];

    const sortedActiveSideLayers = [...activeSideLayers].sort((a, b) => {
      const idxA = layersOrder.indexOf(a.id);
      const idxB = layersOrder.indexOf(b.id);
      return (idxB !== -1 ? idxB : 0) - (idxA !== -1 ? idxA : 0);
    });

    const reorderedSideLayers = [...sortedActiveSideLayers];
    const [movedItem] = reorderedSideLayers.splice(fromUIIndex, 1);
    reorderedSideLayers.splice(toUIIndex, 0, movedItem);

    setLayersOrder((prev) => {
      const newOrder = [...prev];
      const sideLayerIds = sortedActiveSideLayers.map((l) => l.id);
      const newDrawOrderSideIds = [...reorderedSideLayers].reverse().map((l) => l.id);
      const indices = newOrder
        .map((id, index) => (sideLayerIds.includes(id) ? index : -1))
        .filter((index) => index !== -1);

      indices.forEach((indexInOrder, idx) => {
        newOrder[indexInOrder] = newDrawOrderSideIds[idx];
      });
      return newOrder;
    });
  };

  // ── Drag / Scale / Rotate Handlers ──────────────────────────────────────────
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedLayerId(id);
    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = layer.x;
    const startY = layer.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / editorScale;
      const deltaY = (moveEvent.clientY - startMouseY) / editorScale;
      setTextLayers((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, x: startX + deltaX, y: startY + deltaY } : l
        )
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleRotateStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = (e.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX);
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const angleDiff = currentAngle - startAngle;
      let newRotation = startRotation + angleDiff * (180 / Math.PI);
      newRotation = ((newRotation % 360) + 360) % 360;

      setTextLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleScaleStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = (e.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDist = Math.sqrt(Math.pow(startMouseX - centerX, 2) + Math.pow(startMouseY - centerY, 2));
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const curDist = Math.sqrt(Math.pow(moveEvent.clientX - centerX, 2) + Math.pow(moveEvent.clientY - centerY, 2));
      const newScale = Math.max(0.2, Math.min(5.0, startScale * (curDist / startDist)));

      setTextLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleCopy = (id: string) => {
    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;
    const newLayer: TextLayer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      x: Math.min(canvasWidth - 10, layer.x + 30),
      y: Math.min(canvasHeight - 10, layer.y + 30),
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleDelete = (id: string) => {
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // ── Logo Layer Handlers ─────────────────────────────────────────────────────
  const handleLogoDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedLogoId(id);
    setSelectedLayerId(null);
    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = layer.x;
    const startY = layer.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / editorScale;
      const deltaY = (moveEvent.clientY - startMouseY) / editorScale;
      setLogoLayers((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, x: startX + deltaX, y: startY + deltaY } : l
        )
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleLogoRotateStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = (e.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX);
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const angleDiff = currentAngle - startAngle;
      let newRotation = startRotation + angleDiff * (180 / Math.PI);
      newRotation = ((newRotation % 360) + 360) % 360;

      setLogoLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleLogoScaleStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = (e.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDist = Math.sqrt(Math.pow(startMouseX - centerX, 2) + Math.pow(startMouseY - centerY, 2));
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const curDist = Math.sqrt(Math.pow(moveEvent.clientX - centerX, 2) + Math.pow(moveEvent.clientY - centerY, 2));
      const newScale = Math.max(0.01, startScale * (curDist / startDist));

      setLogoLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleLogoCopy = (id: string) => {
    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;
    const newLayer: LogoLayer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      x: Math.min(canvasWidth - 10, layer.x + 30),
      y: Math.min(canvasHeight - 10, layer.y + 30),
    };
    setLogoLayers((prev) => [...prev, newLayer]);
    setSelectedLogoId(newLayer.id);
    setSelectedLayerId(null);
  };

  const handleLogoDelete = (id: string) => {
    setLogoLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLogoId === id) setSelectedLogoId(null);
  };

  const handleAddLogoLayer = (src: string, type: "logo" | "image" = "logo") => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imgWidth = img.naturalWidth || img.width || 200;
      const imgHeight = img.naturalHeight || img.height || 200;
      const maxDim = Math.max(imgWidth, imgHeight);

      const targetSize = type === "image" ? 400 : 200;
      const initialScale = targetSize / maxDim;

      const newId = `custom-logo-${Date.now()}`;
      const newLayer: LogoLayer = {
        id: newId,
        src,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        scale: initialScale,
        rotation: 0,
        side: activeSide,
        baseSize: 200,
        opacity: 1.0,
        type,
        zOrder: type === "image" ? "bottom" : undefined,
      };

      setLoadedLogoImages((prev) => ({ ...prev, [src]: img }));
      setLogoLayers((prev) => [...prev, newLayer]);
      setSelectedLogoId(newId);
      setSelectedLayerId(null);
    };
  };

  const handleAddCustomText = () => {
    const newId = `custom-text-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      text: "CUSTOM TEXT",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      scale: 1.0,
      rotation: 0,
      font: "Varsity",
      color: "#E63946",
      textSize: 80,
      side: activeSide,
      letterSpacing: 0,
      lineSpacing: 1.15,
      curveRadius: 0,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 10,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      outlineEnabled: false,
      outlineColor: "#FFFFFF",
      outlineWidth: 4,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newId);
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    uploadType: "logo" | "image" = "logo",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleAddLogoLayer(dataUrl, uploadType);

      if (uploadType === "image") {
        setUploadedImages((prev) => {
          const next = [dataUrl, ...prev.filter((item) => item !== dataUrl)].slice(0, 12);
          setTimeout(() => {
            try {
              localStorage.setItem("pillow_uploaded_images", JSON.stringify(next));
            } catch (err) {
              console.warn("localStorage quota exceeded for pillow_uploaded_images:", err);
            }
          }, 0);
          return next;
        });
      } else {
        setUploadedLogos((prev) => {
          const next = [dataUrl, ...prev.filter((item) => item !== dataUrl)].slice(0, 12);
          setTimeout(() => {
            try {
              localStorage.setItem("pillow_uploaded_logos", JSON.stringify(next));
            } catch (err) {
              console.warn("localStorage quota exceeded for pillow_uploaded_logos:", err);
            }
          }, 0);
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Background Pixel Eraser Implementation ──────────────────────────────
  const handleEraserStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedLayer = logoLayers.find((l) => l.id === selectedLogoId);
    if (!selectedLayer) return;

    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const getCoords = (evt: MouseEvent | TouchEvent) => {
      if ("touches" in evt && evt.touches.length > 0) {
        return { clientX: evt.touches[0].clientX, clientY: evt.touches[0].clientY };
      }
      const me = evt as MouseEvent;
      return { clientX: me.clientX, clientY: me.clientY };
    };

    const initCoords = "touches" in e ? e.touches[0] : e;
    const startMouseX = initCoords.clientX;
    const startMouseY = initCoords.clientY;

    const getLocalPoint = (clientX: number, clientY: number) => {
      const logoCenterX = container.left + selectedLayer.x * editorScale;
      const logoCenterY = container.top + selectedLayer.y * editorScale;

      const dx = (clientX - logoCenterX) / editorScale;
      const dy = (clientY - logoCenterY) / editorScale;

      const rad = (-selectedLayer.rotation * Math.PI) / 180;
      const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

      const img = loadedLogoImages[selectedLayer.src];
      const imgWidth = img ? img.naturalWidth || img.width || 200 : 200;
      const imgHeight = img ? img.naturalHeight || img.height || 200 : 200;

      const lx = localX / selectedLayer.scale + imgWidth / 2;
      const ly = localY / selectedLayer.scale + imgHeight / 2;

      return { x: lx, y: ly };
    };

    const initialPoint = getLocalPoint(startMouseX, startMouseY);
    const localBrushSize = eraserBrushSize / selectedLayer.scale;

    const newStroke = {
      points: [initialPoint],
      size: localBrushSize,
    };

    const updatedPaths = [...(selectedLayer.eraserPaths || []), newStroke];
    setLogoLayers((prev) =>
      prev.map((l) =>
        l.id === selectedLayer.id ? { ...l, eraserPaths: updatedPaths } : l
      )
    );

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getCoords(moveEvt);
      const pt = getLocalPoint(clientX, clientY);

      setLogoLayers((prev) =>
        prev.map((l) => {
          if (l.id !== selectedLayer.id) return l;
          const paths = l.eraserPaths || [];
          if (paths.length === 0) return l;
          const lastPath = paths[paths.length - 1];
          const updatedLastPath = {
            ...lastPath,
            points: [...lastPath.points, pt],
          };
          return {
            ...l,
            eraserPaths: [...paths.slice(0, -1), updatedLastPath],
          };
        })
      );
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  };

  // ── Dynamic Canvas Rendering & CanvasTexture Mapping ───────────────────────
  const [frontTexture, setFrontTexture] = useState<THREE.CanvasTexture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.CanvasTexture | null>(null);

  const currentPattern =
    PILLOW_DESIGNS.find((d) => d.id === selectedDesign)?.pattern ?? "plain";

  const renderTextLayerOnCtx = (ctx: CanvasRenderingContext2D, layer: TextLayer) => {
    const isOutline = layer.font === "Outline";
    const letterSpacing = layer.letterSpacing || 0;
    const lineSpacing = layer.lineSpacing || 1.15;
    const curveVal = layer.curveRadius || 0;

    const sizeStr = layer.textSize;
    const fontStyle = layer.font;
    const getFontString = (sz: number) => {
      if (fontStyle === "Italic") return `italic 900 ${sz}px Impact, sans-serif`;
      if (fontStyle === "Script") return `bold ${sz}px "Brush Script MT", cursive`;
      if (fontStyle === "Block") return `900 ${sz}px "Courier New", monospace`;
      if (fontStyle === "Varsity") return `900 ${sz}px "Arial Black", sans-serif`;
      if (fontStyle === "Serif Athletic") return `900 ${sz}px "Alfa Slab One", serif`;
      if (fontStyle === "Cyberpunk") return `900 ${sz}px "Orbitron", sans-serif`;
      if (fontStyle === "Grunge") return `400 ${sz}px "Rubik Glitch", display`;
      if (fontStyle === "Neon Glow") return `400 ${sz}px "Monoton", sans-serif`;
      if (fontStyle === "Gothic") return `400 ${sz}px "UnifrakturMaguntia", serif`;
      return `900 ${sz}px Impact, sans-serif`;
    };

    ctx.save();
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);

    const lines = layer.text.split("\n");
    const lineSpacingHeight = sizeStr * lineSpacing;
    const totalHeight = (lines.length - 1) * lineSpacingHeight;
    const verticalOffset = -totalHeight / 2;

    lines.forEach((line, lineIndex) => {
      const curY = verticalOffset + lineIndex * lineSpacingHeight;
      ctx.font = getFontString(sizeStr);
      ctx.textBaseline = "middle";

      if (layer.shadowEnabled) {
        ctx.shadowColor = layer.shadowColor || "#000000";
        ctx.shadowBlur = layer.shadowBlur ?? 10;
        ctx.shadowOffsetX = layer.shadowOffsetX ?? 4;
        ctx.shadowOffsetY = layer.shadowOffsetY ?? 4;
      } else if (fontStyle === "Neon Glow") {
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = Math.max(10, sizeStr * 0.15);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      const chars = Array.from(line);
      const charWidths = chars.map((c) => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing;

      if (!curveVal || curveVal === 0) {
        if (!letterSpacing || letterSpacing === 0) {
          ctx.textAlign = "center";
          if (layer.outlineEnabled) {
            ctx.strokeStyle = layer.outlineColor || "#FFFFFF";
            ctx.lineWidth = layer.outlineWidth ?? 4;
            ctx.strokeText(line, 0, curY);
          } else if (isOutline) {
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = Math.max(2, sizeStr * 0.04);
            ctx.strokeText(line, 0, curY);
          }
          if (!isOutline) {
            ctx.fillStyle = layer.color;
            ctx.fillText(line, 0, curY);
          }
        } else {
          let curX = -totalWidth / 2;
          ctx.textAlign = "left";
          chars.forEach((char, charIdx) => {
            const charW = charWidths[charIdx];
            if (layer.outlineEnabled) {
              ctx.strokeStyle = layer.outlineColor || "#FFFFFF";
              ctx.lineWidth = layer.outlineWidth ?? 4;
              ctx.strokeText(char, curX, curY);
            } else if (isOutline) {
              ctx.strokeStyle = layer.color;
              ctx.lineWidth = Math.max(2, sizeStr * 0.04);
              ctx.strokeText(char, curX, curY);
            }
            if (!isOutline) {
              ctx.fillStyle = layer.color;
              ctx.fillText(char, curX, curY);
            }
            curX += charW + letterSpacing;
          });
        }
      } else {
        const totalAngle = (curveVal * Math.PI) / 180;
        const R = totalWidth / totalAngle;
        let currentS = 0;
        ctx.textAlign = "center";

        chars.forEach((char, charIdx) => {
          const charW = charWidths[charIdx];
          const charCenterS = currentS + charW / 2;
          const angle = (charCenterS - totalWidth / 2) / R;

          const cx = R * Math.sin(angle);
          const cy = curY + R * (1 - Math.cos(angle));

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);

          if (layer.outlineEnabled) {
            ctx.strokeStyle = layer.outlineColor || "#FFFFFF";
            ctx.lineWidth = layer.outlineWidth ?? 4;
            ctx.strokeText(char, 0, 0);
          } else if (isOutline) {
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = Math.max(2, sizeStr * 0.04);
            ctx.strokeText(char, 0, 0);
          }
          if (!isOutline) {
            ctx.fillStyle = layer.color;
            ctx.fillText(char, 0, 0);
          }
          ctx.restore();
          currentS += charW + letterSpacing;
        });
      }
    });
    ctx.restore();
  };

  const renderLogoLayerOnCtx = (ctx: CanvasRenderingContext2D, layer: LogoLayer) => {
    const img = loadedLogoImages[layer.src];
    if (!img) return;

    ctx.save();
    ctx.shadowBlur = 0;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalAlpha = typeof layer.opacity === "number" ? layer.opacity : 1.0;

    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);

    const imgWidth = img.naturalWidth || img.width || 200;
    const imgHeight = img.naturalHeight || img.height || 200;

    if (layer.eraserPaths && layer.eraserPaths.length > 0) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = imgWidth;
      tempCanvas.height = imgHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0, imgWidth, imgHeight);
        tempCtx.globalCompositeOperation = "destination-out";
        tempCtx.lineCap = "round";
        tempCtx.lineJoin = "round";
        tempCtx.strokeStyle = "rgba(0,0,0,1)";

        layer.eraserPaths.forEach((path) => {
          tempCtx.lineWidth = path.size;
          tempCtx.beginPath();
          path.points.forEach((pt, idx) => {
            if (idx === 0) tempCtx.moveTo(pt.x, pt.y);
            else tempCtx.lineTo(pt.x, pt.y);
          });
          tempCtx.stroke();
        });

        ctx.drawImage(tempCanvas, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      } else {
        ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      }
    } else {
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    }
    ctx.restore();
  };

  const drawDesignPattern = (ctx: CanvasRenderingContext2D, patternName: string, secColor: string) => {
    if (!patternName || patternName === "plain") return;
    const scX = canvasWidth / 100;
    const scY = canvasHeight / 100;
    ctx.save();
    ctx.fillStyle = secColor;
    ctx.strokeStyle = secColor;

    switch (patternName) {
      case "strike":
        ctx.beginPath();
        ctx.moveTo(60 * scX, 10 * scY);
        ctx.lineTo(80 * scX, 10 * scY);
        ctx.lineTo(50 * scX, 90 * scY);
        ctx.lineTo(30 * scX, 90 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "save":
        ctx.fillRect(0, 0, 45 * scX, canvasHeight);
        break;
      case "fastbreak":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30 * scX, 0);
        ctx.lineTo(0, 50 * scY);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(100 * scX, 50 * scY);
        ctx.lineTo(100 * scX, 100 * scY);
        ctx.lineTo(70 * scX, 100 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "final":
        ctx.fillRect(0, 0, 35 * scX, canvasHeight);
        ctx.fillRect(65 * scX, 0, 35 * scX, canvasHeight);
        break;
      case "victory":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40 * scX, 0);
        ctx.lineTo(20 * scX, 100 * scY);
        ctx.lineTo(0, 100 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "city":
        ctx.lineWidth = 4 * scY;
        [25, 50, 75].forEach((y) => {
          ctx.beginPath();
          ctx.moveTo(0, y * scY);
          ctx.lineTo(canvasWidth, y * scY);
          ctx.stroke();
        });
        break;
      case "pure":
        ctx.beginPath();
        ctx.moveTo(70 * scX, 0);
        ctx.lineTo(100 * scX, 0);
        ctx.lineTo(100 * scX, 40 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "level":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(55 * scX, 0);
        ctx.lineTo(0, 70 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "vivo":
        ctx.beginPath();
        ctx.moveTo(60 * scX, 100 * scY);
        ctx.lineTo(100 * scX, 0);
        ctx.lineTo(100 * scX, 100 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "orion":
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        [
          [30, 20],
          [70, 20],
          [90, 60],
          [50, 90],
          [10, 60],
        ].forEach(([x, y], i) => {
          i === 0 ? ctx.moveTo(x * scX, y * scY) : ctx.lineTo(x * scX, y * scY);
        });
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = secColor;
        ctx.beginPath();
        [
          [40, 30],
          [60, 30],
          [70, 55],
          [50, 72],
          [30, 55],
        ].forEach(([x, y], i) => {
          i === 0 ? ctx.moveTo(x * scX, y * scY) : ctx.lineTo(x * scX, y * scY);
        });
        ctx.closePath();
        ctx.fill();
        break;
      case "animal":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(25 * scX, 40 * scY, 50 * scX, 10 * scY);
        ctx.quadraticCurveTo(75 * scX, 40 * scY, 100 * scX, 0);
        ctx.lineTo(100 * scX, 50 * scY);
        ctx.quadraticCurveTo(75 * scX, 80 * scY, 50 * scX, 55 * scY);
        ctx.quadraticCurveTo(25 * scX, 80 * scY, 0, 50 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "avatar":
        ctx.beginPath();
        ctx.moveTo(0, 100 * scY);
        ctx.lineTo(45 * scX, 0);
        ctx.lineTo(55 * scX, 0);
        ctx.lineTo(0, 100 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "league":
        ctx.fillRect(0, 0, 50 * scX, canvasHeight);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = secColor;
        ctx.fillRect(50 * scX, 0, 50 * scX, canvasHeight);
        break;
      case "magic": {
        const grad = ctx.createRadialGradient(
          50 * scX,
          40 * scY,
          0,
          50 * scX,
          40 * scY,
          80 * Math.max(scX, scY)
        );
        grad.addColorStop(0, secColor);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        break;
      }
      case "raid":
        ctx.fillRect(0, 0, canvasWidth, 50 * scY);
        break;
      case "rush":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 100 * scY);
        ctx.lineTo(40 * scX, 100 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      case "score":
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(100 * scX, 0);
        ctx.lineTo(100 * scX, 100 * scY);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        break;
    }
    ctx.restore();
  };

  const drawFabricPatternOnCtx = (
    ctx: CanvasRenderingContext2D,
    patternName: string,
    isFront: boolean
  ) => {
    if (!patternName || patternName === "None") return;
    const loadedImg = loadedPatterns[patternName];
    if (loadedImg) {
      const customize = isFront ? state.fabricPatternCustomizeFront : state.fabricPatternCustomizeBack;
      if (!customize) {
        ctx.drawImage(loadedImg, 0, 0, canvasWidth, canvasHeight);
        return;
      }

      const fgColor = isFront ? state.fabricPatternColorFront : state.fabricPatternColorBack;
      const bgColor = isFront ? state.fabricPatternBgFront : state.fabricPatternBgBack;

      const hexToRgb = (hex: string) => {
        const clean = hex.replace("#", "");
        const num = parseInt(clean, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      };

      const bgIsTransparent = bgColor.toLowerCase() === "transparent" || bgColor === "";
      const fgRgb = hexToRgb(fgColor);

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.drawImage(loadedImg, 0, 0, canvasWidth, canvasHeight);
      const imgData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
        const t = Math.max(0, Math.min(1, (dist - 30) / 60));

        data[i] = fgRgb.r;
        data[i + 1] = fgRgb.g;
        data[i + 2] = fgRgb.b;
        data[i + 3] = Math.round(a * t);
      }

      tempCtx.putImageData(imgData, 0, 0);

      ctx.save();
      if (!bgIsTransparent) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
  };

  // Regeneration of textures
  useEffect(() => {
    const buildTexture = (side: "Front" | "Back") => {
      const cv = document.createElement("canvas");
      cv.width = canvasWidth;
      cv.height = canvasHeight;
      const ctx = cv.getContext("2d");
      if (!ctx) return null;

      // 1. Draw base color / background fabric pattern
      const fabricPattern = side === "Front" ? state.fabricPatternFront : state.fabricPatternBack;
      if (fabricPattern && fabricPattern !== "None") {
        drawFabricPatternOnCtx(ctx, fabricPattern, side === "Front");
      } else {
        ctx.fillStyle = side === "Front" ? state.primaryFront : state.primaryBack;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // 2. Draw design pattern
      if (
        state.designSide === "Both" ||
        (side === "Front" && state.designSide === "Front") ||
        (side === "Back" && state.designSide === "Back")
      ) {
        drawDesignPattern(ctx, currentPattern, state.designColor || state.secondary);
      }

      // 3. Draw image layers (Wrap/BG layers of zOrder = bottom)
      const sideLogos = logoLayers.filter((l) => l.side === side);
      sideLogos
        .filter((l) => l.type === "image" && l.zOrder === "bottom")
        .forEach((l) => renderLogoLayerOnCtx(ctx, l));

      // 4. Draw text layers
      const sideTexts = textLayers.filter((l) => l.side === side);
      sideTexts.forEach((l) => renderTextLayerOnCtx(ctx, l));

      // 5. Draw image layers (zOrder = above-text / default logos)
      sideLogos
        .filter((l) => l.type !== "image" || l.zOrder !== "bottom")
        .forEach((l) => renderLogoLayerOnCtx(ctx, l));

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      return tex;
    };

    const frontTex = buildTexture("Front");
    const backTex = buildTexture("Back");
    if (frontTex) setFrontTexture(frontTex);
    if (backTex) setBackTexture(backTex);
  }, [
    state.primary,
    state.primaryFront,
    state.primaryBack,
    state.secondary,
    state.designColor,
    state.designSide,
    selectedDesign,
    state.fabricPatternFront,
    state.fabricPatternCustomizeFront,
    state.fabricPatternColorFront,
    state.fabricPatternBgFront,
    state.fabricPatternBack,
    state.fabricPatternCustomizeBack,
    state.fabricPatternColorBack,
    state.fabricPatternBgBack,
    textLayers,
    logoLayers,
    loadedPatterns,
    loadedLogoImages,
  ]);

  // ── Pricing calculation ───────────────────────────────────────────────────────
  const calculatePrice = () => {
    let base = 25; // Base pillow price
    if (qty >= 10 && qty < 50) base = 21;
    if (qty >= 50) base = 18;

    // Edge seam addons
    if (state.sleeve === "Welt / Piping Edge") base += 5;
    if (state.sleeve === "Zipper Edge") base += 3;

    // Size addons
    if (state.cutFit === "20x20") base += 6;

    // Fabric addons
    if (state.fabric === "Velvet") base += 8;

    return base * qty;
  };

  // ── File Exports ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const triggerLocalDownload = (dataUrl: string, fileName: string) => {
      try {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentNode) document.body.removeChild(link);
          if (dataUrl.startsWith("blob:")) URL.revokeObjectURL(dataUrl);
        }, 100);
      } catch (err) {
        console.error("Export failure:", err);
      }
    };

    // Export 3D Viewport snapshot
    setTimeout(() => {
      if (threeRef.current) {
        const { gl, scene, camera } = threeRef.current;
        gl.render(scene, camera);
        const dataURL = gl.domElement.toDataURL("image/png");
        triggerLocalDownload(dataURL, "pillow-3d-preview.png");
      }
    }, 0);

    // Export flat printable textures
    setTimeout(() => {
      const activeTexture = activeSide === "Back" ? backTexture : frontTexture;
      if (activeTexture && activeTexture.image) {
        const dataURL = (activeTexture.image as HTMLCanvasElement).toDataURL("image/png");
        triggerLocalDownload(dataURL, `pillow-${activeSide.toLowerCase()}-print-template.png`);
      }
    }, 300);
  };

  // ── Render 2D Layer Helpers ──────────────────────────────────────────────────
  const renderTextLayer = (layer: TextLayer, isHidden = false, children?: React.ReactNode) => {
    const isOutline = layer.font === "Outline";
    const letterSpacing = layer.letterSpacing || 0;
    const lineSpacing = layer.lineSpacing || 1.15;
    const curveVal = layer.curveRadius || 0;
    const fontSize = layer.textSize * layer.scale * editorScale;

    const baseStyle: React.CSSProperties = {
      position: "relative",
      padding: "6px 10px",
      fontFamily: getFontFamily(layer.font),
      fontWeight: getFontWeight(layer.font),
      fontStyle: getFontStyle(layer.font),
      userSelect: "none",
      visibility: isHidden ? "hidden" : "visible",
    };

    if (curveVal === 0) {
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: `${fontSize}px`,
            whiteSpace: "pre-line",
            textAlign: "center",
            letterSpacing: `${letterSpacing * editorScale}px`,
            lineHeight: lineSpacing,
            WebkitTextStroke:
              layer.outlineEnabled && layer.outlineWidth
                ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#FFFFFF"}`
                : isOutline
                  ? `1px ${layer.color}`
                  : "none",
            color: isOutline ? "transparent" : layer.color,
            textShadow: layer.shadowEnabled
              ? `${(layer.shadowOffsetX ?? 4) * editorScale}px ${(layer.shadowOffsetY ?? 4) * editorScale}px ${(layer.shadowBlur ?? 10) * editorScale}px ${layer.shadowColor || "#000000"}`
              : undefined,
          }}
        >
          {layer.text}
          {children}
        </div>
      );
    }

    const lines = layer.text.split("\n");
    const lineSpacingHeight = fontSize * lineSpacing;
    const totalHeight = (lines.length - 1) * lineSpacingHeight;
    const verticalOffset = -totalHeight / 2;

    const lineTotalWidths = lines.map((line) => {
      const chars = Array.from(line);
      const charWidths = chars.map((c) => {
        if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ")
          return fontSize * 0.25;
        if (c === "M" || c === "W" || c === "m" || c === "w")
          return fontSize * 0.8;
        return fontSize * 0.55;
      });
      return charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing * editorScale;
    });

    const maxLineWidth = Math.max(...lineTotalWidths);

    return (
      <div
        style={{
          ...baseStyle,
          position: "relative",
          width: `${maxLineWidth}px`,
          height: `${totalHeight + fontSize}px`,
        }}
      >
        {lines.map((line, lineIndex) => {
          const curY = verticalOffset + lineIndex * lineSpacingHeight;
          const chars = Array.from(line);
          const charWidths = chars.map((c) => {
            if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ")
              return fontSize * 0.25;
            if (c === "M" || c === "W" || c === "m" || c === "w")
              return fontSize * 0.8;
            return fontSize * 0.55;
          });

          const lineTotalWidth =
            charWidths.reduce((a, b) => a + b, 0) +
            (chars.length - 1) * letterSpacing * editorScale;

          const totalAngle = (curveVal * Math.PI) / 180;
          const R = lineTotalWidth / totalAngle;
          let currentS = 0;

          return (
            <div
              key={lineIndex}
              style={{
                position: "absolute",
                width: "100%",
                height: `${fontSize}px`,
                top: `calc(50% + ${curY}px)`,
                left: 0,
              }}
            >
              {chars.map((char, charIdx) => {
                const charW = charWidths[charIdx];
                const charCenterS = currentS + charW / 2;
                const angle = (charCenterS - lineTotalWidth / 2) / R;

                const cx = R * Math.sin(angle);
                const cy = R * (1 - Math.cos(angle));

                currentS += charW + letterSpacing * editorScale;

                return (
                  <span
                    key={charIdx}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${cx}px)`,
                      top: `calc(50% + ${cy}px)`,
                      transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                      fontSize: `${fontSize}px`,
                      fontFamily: getFontFamily(layer.font),
                      fontWeight: getFontWeight(layer.font),
                      fontStyle: getFontStyle(layer.font),
                      whiteSpace: "nowrap",
                      WebkitTextStroke:
                        layer.outlineEnabled && layer.outlineWidth
                          ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#FFFFFF"}`
                          : isOutline
                            ? `1px ${layer.color}`
                            : "none",
                      color: isOutline ? "transparent" : layer.color,
                      textShadow: layer.shadowEnabled
                        ? `${(layer.shadowOffsetX ?? 4) * editorScale}px ${(layer.shadowOffsetY ?? 4) * editorScale}px ${(layer.shadowBlur ?? 10) * editorScale}px ${layer.shadowColor || "#000000"}`
                        : undefined,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
        {children}
      </div>
    );
  };

  const renderLogoLayer = (layer: LogoLayer, isHidden = false, children?: React.ReactNode) => {
    const img = loadedLogoImages[layer.src];
    const imgWidth = img ? img.naturalWidth || img.width || 200 : 200;
    const imgHeight = img ? img.naturalHeight || img.height || 200 : 200;
    const drawWidth = imgWidth * layer.scale * editorScale;
    const drawHeight = imgHeight * layer.scale * editorScale;

    return (
      <div
        style={{
          position: "relative",
          width: `${drawWidth}px`,
          height: `${drawHeight}px`,
          visibility: isHidden ? "hidden" : "visible",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isHidden && (
          <div
            style={{
              opacity: typeof layer.opacity === "number" ? layer.opacity : 1.0,
              width: "100%",
              height: "100%",
            }}
          >
            <LogoCanvasPreview layer={layer} editorScale={editorScale} preloadedImage={img} />
          </div>
        )}
        {children}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-white flex-col md:flex-row" data-lenis-prevent>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
        <Link href="/" className="text-zinc-600">
          <ChevronLeft />
        </Link>
        <div className="font-bold">Pillow customizer</div>
      </div>

      {/* ── Column 1: Vertical Tab Navigation Strip ── */}
      <div className="hidden md:flex w-20 flex-col items-center bg-white border-r border-zinc-200 py-6 gap-4 z-20 overflow-y-auto">
        <Link href="/" className="mb-2">
          {/* Logo element placeholder matching brand-new-design */}
          <span className="font-bold text-lg text-zinc-900 tracking-wider">BIGFISH</span>
        </Link>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative group py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer gap-1 transition-all duration-300 w-16 ${
                isActive ? "text-[#00263C]" : "text-zinc-400 hover:text-[#00263C]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#00263C]/5 border-l-2 border-[#00263C] rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              />
              <span className="text-[10px] tracking-wide text-center font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Column 2: Detailed Option Settings Panel ── */}
      <div className="w-full md:w-80 bg-white border-r border-zinc-200 flex flex-col h-full z-10 shadow-lg">
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/60">
          <h2 className="text-xl font-bold text-[#00263C] capitalize">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">Customize your cushion</p>
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
              {/* DESIGNS TAB */}
              {activeTab === "designs" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-4 gap-3 pt-1">
                    {PILLOW_DESIGNS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDesign(d.id)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                          selectedDesign === d.id ? "bg-red-50 ring-2 ring-red-500" : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="w-14 h-14">
                          <PillowSVG
                            primary={state.primary}
                            secondary={
                              selectedDesign === d.id
                                ? state.designColor || state.secondary
                                : state.secondary
                            }
                            pattern={d.pattern}
                            selected={selectedDesign === d.id}
                          />
                        </div>
                        <span className={`text-[9px] font-bold text-center ${selectedDesign === d.id ? "text-red-600" : "text-zinc-500"}`}>
                          {d.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedDesign !== "throw" && (
                    <div className="pt-2 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                          Apply Design To
                        </label>
                        <div className="flex gap-2">
                          {["Front", "Back", "Both"].map((side) => (
                            <button
                              key={side}
                              onClick={() => updateState("designSide", side)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                state.designSide === side
                                  ? "border-red-500 bg-red-50 text-red-600"
                                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                              }`}
                            >
                              {side}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                          Design Color
                        </label>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {[
                            "#111111",
                            "#FFFFFF",
                            "#E63946",
                            "#2196F3",
                            "#FFD166",
                            "#06D6A0",
                            "#8D99AE",
                            "#FF5E7E",
                            "#7B2CBF",
                          ].map((c) => (
                            <button
                              key={c}
                              onClick={() => updateState("designColor", c)}
                              className={`w-7 h-7 rounded-full border transition-transform ${
                                state.designColor === c ? "border-zinc-950 scale-110 ring-1 ring-offset-1 ring-zinc-400" : "border-black/10 hover:scale-105"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={state.designColor || "#111111"}
                            onChange={(e) => updateState("designColor", e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
                          />
                          <span className="text-xs text-zinc-500 font-mono">
                            {(state.designColor || "#111111").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COLORS TAB */}
              {activeTab === "colors" && (
                <div className="space-y-6">
                  {(() => {
                    const activeColor = state.primary;

                    const handleColorChange = (c: string) => {
                      setState((s) => ({ ...s, primary: c, primaryFront: c, primaryBack: c }));
                    };

                    return (
                      <div>
                        <label className="text-sm font-bold text-zinc-900 mb-3 block">
                          Fabric Color
                        </label>

                        <div className="flex gap-2 flex-wrap mb-3">
                          {[
                            "#F6F4F0",
                            "#E63946",
                            "#2196F3",
                            "#111111",
                            "#FFFFFF",
                            "#CCCCCC",
                            "#457B9D",
                            "#2A9D8F",
                            "#F4A261",
                            "#726DE8",
                            "#80C670",
                            "#EFBD4E",
                          ].map((c) => (
                            <button
                              key={c}
                              onClick={() => handleColorChange(c)}
                              className={`w-9 h-9 rounded border-2 transition-transform ${
                                activeColor === c ? "border-zinc-900 scale-110 ring-2 ring-offset-1 ring-zinc-400" : "border-black/10 hover:scale-105"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <input
                            type="color"
                            value={activeColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-9 h-9 rounded cursor-pointer border border-zinc-200"
                          />
                          <span className="text-xs text-zinc-500 font-mono">
                            {activeColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* PATTERNS TAB */}
              {activeTab === "patterns" && (
                <div className="space-y-4">
                  <div className="flex gap-1.5 p-1 bg-zinc-100 rounded border">
                    <button
                      onClick={() => updateState("primaryColorSide", "Front")}
                      className={`flex-1 py-2 text-xs font-bold rounded cursor-pointer transition-all text-center ${
                        state.primaryColorSide === "Front" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Front Side
                    </button>
                    <button
                      onClick={() => updateState("primaryColorSide", "Back")}
                      className={`flex-1 py-2 text-xs font-bold rounded cursor-pointer transition-all text-center ${
                        state.primaryColorSide === "Back" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      Back Side
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      { id: "None", label: "Solid Color", url: "" },
                      { id: "/assets/images/patterns/pattern_1.png", label: "Pattern 1", url: "/assets/images/patterns/pattern_1.png" },
                      { id: "/assets/images/patterns/pattern_2.png", label: "Pattern 2", url: "/assets/images/patterns/pattern_2.png" },
                      { id: "/assets/images/patterns/pattern_3.png", label: "Pattern 3", url: "/assets/images/patterns/pattern_3.png" },
                      { id: "/assets/images/patterns/pattern_4.png", label: "Pattern 4", url: "/assets/images/patterns/pattern_4.png" },
                      { id: "/assets/images/patterns/pattern_5.png", label: "Pattern 5", url: "/assets/images/patterns/pattern_5.png" },
                    ].map((p) => {
                      const isSelected =
                        state.primaryColorSide === "Back"
                          ? state.fabricPatternBack === p.id
                          : state.fabricPatternFront === p.id;

                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            updateState(
                              state.primaryColorSide === "Back" ? "fabricPatternBack" : "fabricPatternFront",
                              p.id
                            )
                          }
                          className={`flex flex-col p-2.5 rounded-lg border transition-all text-left ${
                            isSelected ? "border-red-500 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="w-full h-20 rounded-lg overflow-hidden mb-2 bg-zinc-100 border border-zinc-200/50 flex items-center justify-center relative">
                            {p.id === "None" ? (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-500 font-bold text-xs">
                                Solid
                              </div>
                            ) : (
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <span className={`text-[11px] font-medium text-center w-full ${isSelected ? "text-red-700 font-bold" : "text-[#002337]"}`}>
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pattern color customizers */}
                  {(() => {
                    const selectedPattern = state.primaryColorSide === "Back" ? state.fabricPatternBack : state.fabricPatternFront;
                    if (!selectedPattern || selectedPattern === "None") return null;

                    const customizeActive = state.primaryColorSide === "Back" ? state.fabricPatternCustomizeBack : state.fabricPatternCustomizeFront;
                    const customizeKey = state.primaryColorSide === "Back" ? "fabricPatternCustomizeBack" : "fabricPatternCustomizeFront";
                    const colorVal = state.primaryColorSide === "Back" ? state.fabricPatternColorBack : state.fabricPatternColorFront;
                    const colorKey = state.primaryColorSide === "Back" ? "fabricPatternColorBack" : "fabricPatternColorFront";
                    const bgVal = state.primaryColorSide === "Back" ? state.fabricPatternBgBack : state.fabricPatternBgFront;
                    const bgKey = state.primaryColorSide === "Back" ? "fabricPatternBgBack" : "fabricPatternBgFront";

                    return (
                      <div className="mt-6 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-800">Customize Colors</h4>
                          </div>
                          <Toggle
                            value={customizeActive}
                            onChange={(v) => {
                              updateState(customizeKey, v);
                              if (v) {
                                const defaults = PATTERN_DEFAULT_COLORS[selectedPattern];
                                if (defaults) {
                                  if (!colorVal) updateState(colorKey, defaults.design);
                                  if (!bgVal) updateState(bgKey, defaults.bg);
                                }
                              }
                            }}
                          />
                        </div>

                        {customizeActive && (
                          <div className="space-y-4 pt-2 border-t border-zinc-100">
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-zinc-600 block">Foreground Color</label>
                              <div className="flex gap-2 flex-wrap mb-2">
                                {["#E63946", "#2196F3", "#111111", "#FFFFFF", "#F4A261", "#80C670"].map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => updateState(colorKey, c)}
                                    className={`w-7 h-7 rounded-full border-2 ${colorVal === c ? "border-zinc-900 scale-110" : "border-black/10 hover:scale-105"}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                              <input type="color" value={colorVal} onChange={(e) => updateState(colorKey, e.target.value)} />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-zinc-600 block">Background Color</label>
                              <div className="flex gap-2 flex-wrap mb-2">
                                <button
                                  onClick={() => updateState(bgKey, "transparent")}
                                  className={`h-7 px-3 rounded-full border text-[10px] font-bold ${bgVal === "transparent" ? "bg-zinc-900 text-white" : "bg-white text-zinc-700"}`}
                                >
                                  Transparent
                                </button>
                                {["#E63946", "#2196F3", "#FFFFFF", "#111111"].map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => updateState(bgKey, c)}
                                    className={`w-7 h-7 rounded-full border-2 ${bgVal === c ? "border-zinc-900 scale-110" : "border-black/10"}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                              {bgVal !== "transparent" && (
                                <input type="color" value={bgVal} onChange={(e) => updateState(bgKey, e.target.value)} />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── TEXT TAB ── */}
              {/* ── TEXT TAB ── */}
              {activeTab === "text" && (
                <div className="space-y-6">
                  {/* Front/Back View Segmented Switcher */}
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCurrentView("front")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        activeSide === "Front"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Front Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("back")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        activeSide === "Back"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Back Side
                    </button>
                  </div>

                  {/* Visual 2D Editor Canvas representation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                        Visual Text Editor ({activeSide} View)
                      </label>
                      <button
                        onClick={handleAddCustomText}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <Type className="w-3.5 h-3.5" /> Add Text
                      </button>
                    </div>

                    {/* Bounding Box Customizer Canvas area (280x280) */}
                    <div
                      className="relative rounded border border-zinc-200 shadow-inner mx-auto select-none"
                      style={{
                        width: `${editorWidth}px`,
                        height: `${editorHeight}px`,
                        background:
                          "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                      }}
                    >
                      {/* 1. Backdrop (inside overflow-hidden) */}
                      <div className="absolute inset-0 rounded overflow-hidden pointer-events-none">
                        {/* Pillow Silhouette Backdrop helper */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-40 h-28 fill-none stroke-white stroke-2"
                          >
                            <rect x="10" y="20" width="80" height="60" rx="10" />
                          </svg>
                        </div>
                        {/* Canvas area grid lines */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[20px_20px]" />
                      </div>

                      {/* Active side text label */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-zinc-500 tracking-widest uppercase pointer-events-none">
                        {activeSide} Texture Map (1024x731)
                      </div>

                      {/* 2. Text Content Container (Clipped at bounds) */}
                      <div className="absolute inset-0 rounded overflow-hidden">
                        {textLayers
                          .filter((layer) => layer.side === activeSide)
                          .map((layer) => {
                            const isSelected = selectedLayerId === layer.id;
                            return (
                              <div
                                key={layer.id}
                                style={{
                                  position: "absolute",
                                  left: layer.x * editorScale,
                                  top: layer.y * editorScale,
                                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                                  cursor: "move",
                                  zIndex: isSelected ? 40 : 10,
                                }}
                                onMouseDown={(e) =>
                                  handleDragStart(e, layer.id)
                                }
                              >
                                {renderTextLayer(layer, false)}
                              </div>
                            );
                          })}
                      </div>

                      {/* 3. Bounding Box & Handles Overlay (Visible outside bounds) */}
                      <div className="absolute inset-0 pointer-events-none">
                        {textLayers
                          .filter(
                            (layer) =>
                              layer.side === activeSide &&
                              selectedLayerId === layer.id,
                          )
                          .map((layer) => {
                            return (
                              <div
                                key={`handles-${layer.id}`}
                                style={{
                                  position: "absolute",
                                  left: layer.x * editorScale,
                                  top: layer.y * editorScale,
                                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                                  pointerEvents: "none",
                                  zIndex: 50,
                                }}
                              >
                                {renderTextLayer(
                                  layer,
                                  true,
                                  <>
                                    {/* Bounding Box Border */}
                                    <div
                                      className="absolute inset-0 border border-dashed border-red-500"
                                      style={{ visibility: "visible" }}
                                    />

                                    {/* Interactive Handles */}
                                    <div style={{ visibility: "visible" }}>
                                      {/* Top-Left: Duplicate */}
                                      <button
                                        className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleCopy(layer.id);
                                        }}
                                        title="Duplicate"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5 text-zinc-600"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                          />
                                        </svg>
                                      </button>

                                      {/* Top-Right: Rotate */}
                                      <div
                                        className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-alias active:scale-90 transition-transform pointer-events-auto"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleRotateStart(e, layer.id);
                                        }}
                                        title="Rotate"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5 text-zinc-600"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89"
                                          />
                                        </svg>
                                      </div>

                                      {/* Bottom-Left: Delete */}
                                      <button
                                        className="absolute -bottom-3.5 -left-3.5 w-6 h-6 bg-red-500 hover:bg-red-600 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleDelete(layer.id);
                                        }}
                                        title="Delete"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>

                                      {/* Bottom-Right: Scale */}
                                      <div
                                        className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-blue-500 hover:bg-blue-600 shadow-md rounded-full flex items-center justify-center cursor-se-resize active:scale-90 transition-transform pointer-events-auto"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleScaleStart(e, layer.id);
                                        }}
                                        title="Scale"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </>,
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Layers List Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Text Layers List ({activeSide} Side)
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {textLayers.filter((l) => l.side === activeSide)
                        .length === 0 ? (
                        <div className="text-xs text-zinc-400 italic text-center py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                          No text layers on this side. Add one above!
                        </div>
                      ) : (
                        textLayers
                          .filter((l) => l.side === activeSide)
                          .map((layer) => {
                            const isSelected = selectedLayerId === layer.id;
                            return (
                              <div
                                key={layer.id}
                                onClick={() => setSelectedLayerId(layer.id)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-red-500 bg-red-50/30"
                                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Type
                                    className={`w-4 h-4 ${isSelected ? "text-red-500" : "text-zinc-400"}`}
                                  />
                                  <span
                                    className={`text-xs font-bold truncate max-w-[150px] ${isSelected ? "text-red-700" : "text-zinc-700"}`}
                                  >
                                    {layer.text || "(Empty Text)"}
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => handleCopy(layer.id)}
                                    className="p-1 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-600"
                                    title="Duplicate"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(layer.id)}
                                    className="p-1 hover:bg-red-50 rounded-md text-zinc-400 hover:text-red-500"
                                    title="Delete"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Properties Panel of the Selected Layer */}
                  {(() => {
                    const selectedLayer = textLayers.find(
                      (l) => l.id === selectedLayerId,
                    );
                    if (!selectedLayer) return null;

                    return (
                      <div className="space-y-4 pt-4 border-t border-zinc-100">
                        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Layer Settings (
                          {selectedLayer.id.startsWith("front-") ||
                          selectedLayer.id.startsWith("back-")
                            ? "System Layer"
                            : "Custom Layer"}
                          )
                        </h4>

                        <div>
                          <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                            Text Content
                          </label>
                          <textarea
                            value={selectedLayer.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextLayers((prev) =>
                                prev.map((l) =>
                                  l.id === selectedLayer.id
                                    ? { ...l, text: val }
                                    : l,
                                ),
                              );
                              if (selectedLayer.id === "front-text")
                                updateState("frontText", val);
                              if (selectedLayer.id === "back-text")
                                updateState("backText", val);
                              if (
                                selectedLayer.id === "front-number" ||
                                selectedLayer.id === "back-number"
                              ) {
                                updateState("number", val);
                              }
                            }}
                            className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-red-500 text-sm resize-y min-h-[72px]"
                            placeholder="Enter text..."
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                            Font Style
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              "Bold",
                              "Italic",
                              "Script",
                              "Block",
                              "Outline",
                              "Varsity",
                              "Serif Athletic",
                              "Cyberpunk",
                              "Grunge",
                              "Neon Glow",
                              "Gothic",
                            ].map((f) => (
                              <button
                                key={f}
                                onClick={() => {
                                  setTextLayers((prev) =>
                                    prev.map((l) =>
                                      l.id === selectedLayer.id
                                        ? { ...l, font: f }
                                        : l,
                                    ),
                                  );
                                  if (selectedLayer.id === "front-text")
                                    updateState("frontFont", f);
                                  if (selectedLayer.id === "back-text")
                                    updateState("backFont", f);
                                  if (
                                    selectedLayer.id === "front-number" ||
                                    selectedLayer.id === "back-number"
                                  ) {
                                    updateState("numberFont", f);
                                  }
                                }}
                                className={`p-1.5 rounded-full cursor-pointer border text-[10px] font-bold transition-all active:scale-90 duration-300 ${
                                  selectedLayer.font === f
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-[#002337] text-[#002337] hover:border-zinc-300"
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
                            Text Color
                          </label>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            {[
                              "#FFFFFF",
                              "#111111",
                              "#E63946",
                              "#2196F3",
                              "#FFD700",
                              "#2A9D8F",
                            ].map((c) => (
                              <button
                                key={c}
                                onClick={() => {
                                  setTextLayers((prev) =>
                                    prev.map((l) =>
                                      l.id === selectedLayer.id
                                        ? { ...l, color: c }
                                        : l,
                                    ),
                                  );
                                  if (selectedLayer.id === "front-text")
                                    updateState("frontTextColor", c);
                                  if (selectedLayer.id === "back-text")
                                    updateState("backTextColor", c);
                                  if (
                                    selectedLayer.id === "front-number" ||
                                    selectedLayer.id === "back-number"
                                  ) {
                                    updateState("numberColor", c);
                                  }
                                }}
                                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                  selectedLayer.color === c
                                    ? "border-zinc-900 scale-110"
                                    : "border-black/10 hover:scale-105"
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                            <div className="w-px h-4 bg-zinc-300 mx-1"></div>
                            <input
                              type="color"
                              value={selectedLayer.color}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? { ...l, color: val }
                                      : l,
                                  ),
                                );
                                if (selectedLayer.id === "front-text")
                                  updateState("frontTextColor", val);
                                if (selectedLayer.id === "back-text")
                                  updateState("backTextColor", val);
                                if (
                                  selectedLayer.id === "front-number" ||
                                  selectedLayer.id === "back-number"
                                ) {
                                  updateState("numberColor", val);
                                }
                              }}
                              className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
                            />
                          </div>
                        </div>

                        {/* Base Font Size */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">
                            Base Font Size
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="15"
                              max="300"
                              value={selectedLayer.textSize}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? { ...l, textSize: val }
                                      : l,
                                  ),
                                );
                                if (selectedLayer.id === "front-text")
                                  updateState("frontTextSize", val);
                                if (selectedLayer.id === "back-text")
                                  updateState("backTextSize", val);
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-zinc-700">
                              {selectedLayer?.textSize}
                            </div>
                          </div>
                        </div>

                        {/* Letter spacing */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">
                            Letter spacing
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="500"
                              value={selectedLayer.letterSpacing || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? { ...l, letterSpacing: val }
                                      : l,
                                  ),
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {selectedLayer.letterSpacing || 0}
                            </div>
                          </div>
                        </div>

                        {/* Line spacing */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">
                            Line spacing
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0.5"
                              max="3.0"
                              step="0.05"
                              value={selectedLayer.lineSpacing || 1.15}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? { ...l, lineSpacing: val }
                                      : l,
                                  ),
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {(selectedLayer.lineSpacing || 1.15).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Text Curve */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">
                            Text Curve
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="-120"
                              max="120"
                              value={selectedLayer.curveRadius || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? { ...l, curveRadius: val }
                                      : l,
                                  ),
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {selectedLayer.curveRadius || 0}°
                            </div>
                          </div>
                        </div>

                        {/* Text Outline */}
                        <div className="space-y-3 pt-3 border-t border-zinc-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-800">
                              Enable Text Outline
                            </label>
                            <input
                              type="checkbox"
                              checked={!!selectedLayer.outlineEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? {
                                          ...l,
                                          outlineEnabled: checked,
                                          outlineColor:
                                            l.outlineColor || "#FFFFFF",
                                          outlineWidth:
                                            typeof l.outlineWidth === "number"
                                              ? l.outlineWidth
                                              : 4,
                                        }
                                      : l,
                                  ),
                                );
                              }}
                              className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500 cursor-pointer"
                            />
                          </div>

                          {selectedLayer.outlineEnabled && (
                            <div className="space-y-3 pl-2 border-l-2 border-red-100">
                              {/* Outline Color */}
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-zinc-600">
                                  Outline Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={
                                      selectedLayer.outlineColor || "#FFFFFF"
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTextLayers((prev) =>
                                        prev.map((l) =>
                                          l.id === selectedLayer.id
                                            ? { ...l, outlineColor: val }
                                            : l,
                                        ),
                                      );
                                    }}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                  />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                    {selectedLayer.outlineColor || "#FFFFFF"}
                                  </span>
                                </div>
                              </div>

                              {/* Outline Width */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                                  <span>Outline Width</span>
                                  <span>
                                    {selectedLayer.outlineWidth ?? 4}px
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="20"
                                  value={selectedLayer.outlineWidth ?? 4}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((l) =>
                                        l.id === selectedLayer.id
                                          ? { ...l, outlineWidth: val }
                                          : l,
                                      ),
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Text Shadow */}
                        <div className="space-y-3 pt-3 border-t border-zinc-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-800">
                              Enable Text Shadow
                            </label>
                            <input
                              type="checkbox"
                              checked={!!selectedLayer.shadowEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTextLayers((prev) =>
                                  prev.map((l) =>
                                    l.id === selectedLayer.id
                                      ? {
                                          ...l,
                                          shadowEnabled: checked,
                                          shadowColor:
                                            l.shadowColor || "#000000",
                                          shadowBlur:
                                            typeof l.shadowBlur === "number"
                                              ? l.shadowBlur
                                              : 10,
                                          shadowOffsetX:
                                            typeof l.shadowOffsetX === "number"
                                              ? l.shadowOffsetX
                                              : 4,
                                          shadowOffsetY:
                                            typeof l.shadowOffsetY === "number"
                                              ? l.shadowOffsetY
                                              : 4,
                                        }
                                      : l,
                                  ),
                                );
                              }}
                              className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500 cursor-pointer"
                            />
                          </div>

                          {selectedLayer.shadowEnabled && (
                            <div className="space-y-3 pl-2 border-l-2 border-red-100">
                              {/* Shadow Color */}
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-zinc-600">
                                  Shadow Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={
                                      selectedLayer.shadowColor || "#000000"
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTextLayers((prev) =>
                                        prev.map((l) =>
                                          l.id === selectedLayer.id
                                            ? { ...l, shadowColor: val }
                                            : l,
                                        ),
                                      );
                                    }}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                  />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                    {selectedLayer.shadowColor || "#000000"}
                                  </span>
                                </div>
                              </div>

                              {/* Shadow Blur */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                                  <span>Shadow Blur</span>
                                  <span>
                                    {selectedLayer.shadowBlur ?? 10}px
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="30"
                                  value={selectedLayer.shadowBlur ?? 10}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((l) =>
                                        l.id === selectedLayer.id
                                          ? { ...l, shadowBlur: val }
                                          : l,
                                      ),
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>

                              {/* Offset X */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                                  <span>Offset X</span>
                                  <span>
                                    {selectedLayer.shadowOffsetX ?? 4}px
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="-20"
                                  max="20"
                                  value={selectedLayer.shadowOffsetX ?? 4}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((l) =>
                                        l.id === selectedLayer.id
                                          ? { ...l, shadowOffsetX: val }
                                          : l,
                                      ),
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>

                              {/* Offset Y */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                                  <span>Offset Y</span>
                                  <span>
                                    {selectedLayer.shadowOffsetY ?? 4}px
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="-20"
                                  max="20"
                                  value={selectedLayer.shadowOffsetY ?? 4}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((l) =>
                                        l.id === selectedLayer.id
                                          ? { ...l, shadowOffsetY: val }
                                          : l,
                                      ),
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}


              {/* UPLOADS TAB */}
              {activeTab === "logos" && (
                <div className="space-y-5">
                  <input
                    id="logo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, uploadSubTab)}
                    className="hidden"
                  />

                  {/* Two-Tab Sub-navigation Layout: Logo & Image */}
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSubTab("logo");
                        setSelectedLogoId(null); // Deselect on switch
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        uploadSubTab === "logo"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSubTab("image");
                        setSelectedLogoId(null); // Deselect on switch
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        uploadSubTab === "image"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Image (Wrap/BG)
                    </button>
                  </div>

                  {/* Front/Back View Segmented Switcher */}
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCurrentView("front")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        activeSide === "Front"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Front Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("back")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        activeSide === "Back"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Back Side
                    </button>
                  </div>

                  {/* Visual Logo/Image Editor */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                      Visual {uploadSubTab === "logo" ? "Logo" : "Image"} Editor ({activeSide} View)
                    </label>

                    {/* Bounding Box Customizer Canvas area (280x200) */}
                    <div
                      className="relative rounded border border-zinc-200 shadow-inner mx-auto select-none"
                      style={{
                        width: `${editorWidth}px`,
                        height: `${editorHeight}px`,
                        background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                        cursor: isEraserMode && selectedLogoId ? ERASER_CURSOR : "default",
                      }}
                      onMouseDown={(e) => {
                        if (isEraserMode && selectedLogoId) {
                          handleEraserStart(e);
                          return;
                        }
                        if (e.target === e.currentTarget) {
                          setSelectedLogoId(null);
                        }
                      }}
                      onTouchStart={(e) => {
                        if (isEraserMode && selectedLogoId) {
                          handleEraserStart(e);
                        }
                      }}
                    >
                      {/* Silhouette helper */}
                      <div className="absolute inset-0 rounded overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-40 h-28 fill-none stroke-white stroke-2"
                          >
                            <rect x="10" y="20" width="80" height="60" rx="10" />
                          </svg>
                        </div>
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[20px_20px]" />
                      </div>

                      {/* Active side text label */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-zinc-500 tracking-widest uppercase pointer-events-none">
                        {activeSide} Texture Map (1024x731)
                      </div>

                      {/* Content Container */}
                      <div className="absolute inset-0 rounded overflow-hidden">
                        {logoLayers
                          .filter(
                            (layer) =>
                              layer.side === activeSide &&
                              (uploadSubTab === "logo"
                                ? layer.type === "logo" || !layer.type
                                : layer.type === "image"),
                          )
                          .map((layer) => {
                            const isSelected = selectedLogoId === layer.id;
                            return (
                              <div
                                key={layer.id}
                                style={{
                                  position: "absolute",
                                  left: layer.x * editorScale,
                                  top: layer.y * editorScale,
                                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                                  cursor: isEraserMode ? ERASER_CURSOR : "move",
                                  zIndex: isSelected ? 40 : 10,
                                }}
                                onMouseDown={(e) => {
                                  if (isEraserMode) {
                                    // Bubble up to visual customizer div
                                    return;
                                  }
                                  handleLogoDragStart(e, layer.id);
                                }}
                              >
                                {renderLogoLayer(layer, false)}
                              </div>
                            );
                          })}
                      </div>

                      {/* Bounding Box & Handles Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {!isEraserMode &&
                          logoLayers
                            .filter(
                              (layer) =>
                                layer.side === activeSide &&
                                selectedLogoId === layer.id &&
                                (uploadSubTab === "logo"
                                  ? layer.type === "logo" || !layer.type
                                  : layer.type === "image"),
                            )
                            .map((layer) => {
                              return (
                                <div
                                  key={`handles-logo-${layer.id}`}
                                  style={{
                                    position: "absolute",
                                    left: layer.x * editorScale,
                                    top: layer.y * editorScale,
                                    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                                    pointerEvents: "none",
                                    zIndex: 50,
                                  }}
                                >
                                  {renderLogoLayer(
                                    layer,
                                    true,
                                    <>
                                      {/* Bounding Box Border */}
                                      <div
                                        className="absolute inset-0 border border-dashed border-red-500"
                                        style={{ visibility: "visible" }}
                                      />

                                      {/* Interactive Handles */}
                                      <div style={{ visibility: "visible" }}>
                                        {/* Top-Left: Duplicate */}
                                        <button
                                          type="button"
                                          className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleLogoCopy(layer.id);
                                          }}
                                          title="Duplicate"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5 text-zinc-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2.5}
                                              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                            />
                                          </svg>
                                        </button>

                                        {/* Top-Right: Rotate */}
                                        <div
                                          className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-alias active:scale-90 transition-transform pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleLogoRotateStart(e, layer.id);
                                          }}
                                          title="Rotate"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5 text-zinc-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2.5}
                                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89"
                                            />
                                          </svg>
                                        </div>

                                        {/* Bottom-Left: Delete */}
                                        <button
                                          type="button"
                                          className="absolute -bottom-3.5 -left-3.5 w-6 h-6 bg-red-500 hover:bg-red-600 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleLogoDelete(layer.id);
                                          }}
                                          title="Delete"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2.5}
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                        </button>

                                        {/* Bottom-Right: Scale */}
                                        <div
                                          className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-blue-500 hover:bg-blue-600 shadow-md rounded-full flex items-center justify-center cursor-se-resize active:scale-90 transition-transform pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleLogoScaleStart(e, layer.id);
                                          }}
                                          title="Scale"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2.5}
                                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    </>,
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  </div>

                  {/* Background Eraser - Conditional on selected layer matching sub-tab */}
                  {(() => {
                    const selectedLayer = logoLayers.find(
                      (l) => l.id === selectedLogoId,
                    );
                    if (!selectedLayer) return null;
                    const isLogoTab = uploadSubTab === "logo";
                    const layerIsLogo =
                      selectedLayer.type === "logo" || !selectedLayer.type;
                    if (isLogoTab !== layerIsLogo) return null;

                    return (
                      <div className="space-y-2.5 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 shadow-sm mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                            Background Eraser
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEraserMode((prev) => !prev)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                              isEraserMode
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300"
                            }`}
                            title={
                              isEraserMode
                                ? "Click to lock artwork"
                                : "Click to erase background"
                            }
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {isEraserMode ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              )}
                            </svg>
                            <span>
                              {isEraserMode ? "Lock Drawing" : "Erase Pixels"}
                            </span>
                          </button>
                        </div>

                        {isEraserMode && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                              <span>Eraser Brush Size</span>
                              <span>{eraserBrushSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="100"
                              value={eraserBrushSize}
                              onChange={(e) =>
                                setEraserBrushSize(parseInt(e.target.value))
                              }
                              className="w-full accent-red-500 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                            />
                            <p className="text-[10px] text-zinc-400 italic">
                              Drag mouse/finger over image edges in the Visual
                              Editor to clean up background pixels.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Upload Container */}
                  {uploadSubTab === "logo" ? (
                    <div
                      onClick={() =>
                        document.getElementById("logo-upload-input")?.click()
                      }
                      className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-red-400 cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold">
                        Upload Custom Logo
                      </span>
                      <span className="text-[10px] mt-0.5">
                        PNG, SVG up to 5MB
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        document.getElementById("logo-upload-input")?.click()
                      }
                      className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-red-400 cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold">
                        Upload Background / Wrap Image
                      </span>
                      <span className="text-[10px] mt-0.5">
                        PNG, SVG up to 5MB
                      </span>
                    </div>
                  )}

                  {/* Presets Grid */}
                  {uploadSubTab === "logo" && (
                    <div>
                      <label className="text-xs font-bold text-zinc-900 mb-2 block">
                        Preset Badges
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            name: "Valkyrie",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSI1MCwxMCA5MCwzMCA5MCw3MCA1MCw5NSAxMCw3MCAxMCwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmYzMzY2IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNNTAsMjAgTDc1LDQ1IEw2MCw0NSBMNTAsMzAgTDQwLDQ1IEwyNSw0NSBaIiBmaWxsPSIjZmYzMzY2Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI2NSIgcj0iMTIiIGZpbGw9IiNmZjMzNjYiLz4vPjwvc3ZnPg==",
                          },
                          {
                            name: "Gold Tiger",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwLDIwIFE1MCwwIDgwLDIwIEw4MCw1MCBMNTAsOTAgTDIwLDUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmY2MwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTM1LDM1IFE1MCwyMCA2NSwzNSBNMzAsNTAgUTUwLDQwIDcwLDUwIE00NSw2NSBMNTAsNzUgTDU1LDY1IiBzdHJva2U9IiNmZmNjMDAiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==",
                          },
                          {
                            name: "Blue Shield",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwLDEwIEw4NSwyMCBMODUsNjAgQzg1LDgwIDUwLDk1IDUwLDk1IEM1MCw5NSAxNSw4MCAxNSw2MCBMMTUsMjAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2Y1MWI1IiBzdHJva2Utd2lkdGg9IjYiLz4gPGNpcmNsZSBjeD0iNTAiIGN5PSI0NSIgcj0iMTUiIGZpbGw9IiMzZjUxYjUiLz48cGF0aCBkPSJNNDAsNjUgTDUwLDU1IEw2MCw2NSIgc3Ryb2tlPSIjM2Y1MWI1IiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=",
                          },
                          {
                            name: "Red Phoenix",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSI1MCw1IDk1LDI4IDk1LDcyIDUwLDk1IDUsNzIgNSwyOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTUzZTNlIiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNNTAsMjUgQzY1LDI1IDc1LDM1IDcwLDU1IEM2NSw0NSA1NSw0NSA1MCw1MCBDNDUsNDUgMzUsNDUgMzAsNTUgQzI1LDM1IDM1LDI1IDUwLDI1IFoiIGZpbGw9IiNlNTNlM2UiLz48cG9seWdvbiBwb2ludHM9IjUwLDU1IDYwLDcwIDUwLDY1IDQwLDcwIiBmaWxsPSIjZTUzZTNlIi8+PC9zdmc+",
                          },
                          {
                            name: "Neon Light",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM5ZmYxNCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBvbHlnb24gcG9pbnRzPSI1NSwxOCAyOCw1MiA0OCw1MiA0Miw4MiA3Miw0OCA1Miw0OCIgZmlsbD0iIzM5ZmYxNCIvPjwvc3ZnPg==",
                          },
                          {
                            name: "Iron Crown",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwLDkwIEw5MCw2NSBMOTAsMjAgTDUwLDEwIEwxMCwyMCBMMTAsNjUgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTg1NWY3IiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNMjUsNjUgTDMyLDQwIEw4NSw1NSBMNTAsMzAgTDU1LDU1IEw2OCw0MCBMNzUsNjUgWiIgZmlsbD0iI2E4NTVmNyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjYiIGZpbGw9IiNhODU1ZjciLz48L3N2Zz4=",
                          },
                          {
                            name: "Green Cobra",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSI1MCwxMCA4NSwzMCA3NSw4MCA1MCw5NSAyNSw4MCAxNSwzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjYiLz48cGF0aCBkPSJNNTAsMjIgQzQwLDIyIDMyLDMwIDMyLDQwIEMzMiw1NSA1MCw3NSA1MCw3NSBDNTAsNzUgNjgsNTUgNjgsNDAgQzY4LDMwIDYwLDIyIDUwLDIyIFogTTUwLDMyIEM1MywzMiA1NSwzNCA1NSwzNyBDNTUsNDAgNTAsNDUgNTAsNDUgQzUwLDk1IDQ1LDQwIDQ1LDM3IEM0NSwzNCA0NywzMiA1MCwzMiBaIiBmaWxsPSIjMTBiOTgxIi8+PC9zdmc+",
                          },
                          {
                            name: "Cyber Star",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y0M2Y1ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSI4IDYiLz48cG9seWdvbiBwb2ludHM9IjUwLDE1IDYxLDM4IDg2LDQwIDY3LDU3IDczLDgyIDUwLDY4IDI3LDgyIDMzLDU3IDI0LDQwIDM5LDM4IiBmaWxsPSIjZjQzZjVlIi8+PC9zdmc+",
                          },
                          {
                            name: "Ocean Anchor",
                            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBlYTVlOSIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTUwLDE4IEw1MCw2OCBNMzIsNDggTDY4LDQ4IE01MCwxOCBBNiw2IDAgMSwxIDUwLDMwIEE2LDYgMCAxLDEgNTAsMTggTTMwLDU1IEEyMCwyMCAwIDAsMCA3MCw1NSBNMzgwLDUyIEwyNiw1NyBNNzAsNTIgTDc0LDU3IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZWE1ZTkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+",
                          },
                        ].map((preset) => (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() =>
                              handleAddLogoLayer(preset.url, "logo")
                            }
                            className="p-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-[8px] font-bold text-zinc-500">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* My Uploaded Badges Gallery */}
                  {uploadSubTab === "logo" && uploadedLogos.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-900">
                          My Uploaded Badges
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedLogos([]);
                            localStorage.removeItem("pillow_uploaded_logos");
                          }}
                          className="text-[9px] text-zinc-400 hover:text-red-500 font-bold transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedLogos.map((url, index) => {
                          return (
                            <div
                              key={index}
                              onClick={() => handleAddLogoLayer(url, "logo")}
                              className="relative aspect-square rounded-xl border flex items-center justify-center p-1.5 transition-all bg-white cursor-pointer border-zinc-200 hover:border-zinc-300 hover:shadow-md group"
                            >
                              <img
                                src={url}
                                alt={`Uploaded badge ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedLogos((prev) => {
                                    const next = prev.filter(
                                      (item) => item !== url,
                                    );
                                    setTimeout(() => {
                                      try {
                                        localStorage.setItem(
                                          "pillow_uploaded_logos",
                                          JSON.stringify(next),
                                        );
                                      } catch (err) {
                                        console.warn(err);
                                      }
                                    }, 0);
                                    return next;
                                  });
                                }}
                                className="absolute top-1 right-1 w-4 h-4 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full border border-zinc-200 shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <svg
                                  className="w-2.5 h-2.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* My Uploaded Images Gallery */}
                  {uploadSubTab === "image" && uploadedImages.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-900">
                          My Uploaded Images
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImages([]);
                            localStorage.removeItem("pillow_uploaded_images");
                          }}
                          className="text-[9px] text-zinc-400 hover:text-red-500 font-bold transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((url, index) => {
                          return (
                            <div
                              key={index}
                              onClick={() => handleAddLogoLayer(url, "image")}
                              className="relative aspect-square rounded-xl border flex items-center justify-center p-1.5 transition-all bg-white cursor-pointer border-zinc-200 hover:border-zinc-300 hover:shadow-md group"
                            >
                              <img
                                src={url}
                                alt={`Uploaded image ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedImages((prev) => {
                                    const next = prev.filter(
                                      (item) => item !== url,
                                    );
                                    setTimeout(() => {
                                      try {
                                        localStorage.setItem(
                                          "pillow_uploaded_images",
                                          JSON.stringify(next),
                                        );
                                      } catch (err) {
                                        console.warn(err);
                                      }
                                    }, 0);
                                    return next;
                                  });
                                }}
                                className="absolute top-1 right-1 w-4 h-4 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full border border-zinc-200 shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <svg
                                  className="w-2.5 h-2.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Unified Active Layers List */}
                  {(() => {
                    const sideTextLayers = textLayers.filter(
                      (l) => l.side === activeSide,
                    );
                    const sideLogoLayers = logoLayers.filter(
                      (l) => l.side === activeSide,
                    );
                    const activeSideLayers = [
                      ...sideTextLayers.map((l) => ({
                        ...l,
                        layerType: "text",
                      })),
                      ...sideLogoLayers.map((l) => ({
                        ...l,
                        layerType: "logo",
                      })),
                    ];

                    const sortedActiveSideLayers = [...activeSideLayers].sort(
                      (a, b) => {
                        const idxA = layersOrder.indexOf(a.id);
                        const idxB = layersOrder.indexOf(b.id);
                        const getPriority = (l: any) => {
                          if (l.layerType === "text") return 1;
                          if (l.type === "image") {
                            return l.zOrder === "above-text" ? 2 : 0;
                          }
                          return 3;
                        };
                        const valA = idxA !== -1 ? idxA : getPriority(a) * 1000;
                        const valB = idxB !== -1 ? idxB : getPriority(b) * 1000;
                        return valB - valA;
                      },
                    );

                    return (
                      <div className="space-y-2 mt-2 pt-2 border-t border-zinc-100">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Layers List ({activeSide} Side)
                        </label>
                        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                          {sortedActiveSideLayers.length === 0 ? (
                            <div className="text-xs text-zinc-400 italic text-center py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                              No layers on this side. Add one above or from the
                              Text tab!
                            </div>
                          ) : (
                            sortedActiveSideLayers.map((layer, index) => {
                              const isText = layer.layerType === "text";
                              const isSelected = isText
                                ? selectedLayerId === layer.id
                                : selectedLogoId === layer.id;
                              const displayName = isText
                                ? `Text ("${(layer as any).text}")`
                                : (layer as any).type === "image"
                                  ? `Image (${layer.id.split("-").pop()})`
                                  : `Logo (${layer.id.split("-").pop()})`;

                              return (
                                <div
                                  key={layer.id}
                                  draggable
                                  onDragStart={(e) => {
                                    setDraggedIdx(index);
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    if (draggedIdx !== index) {
                                      setDragOverIdx(index);
                                    }
                                  }}
                                  onDragEnd={() => {
                                    if (
                                      draggedIdx !== null &&
                                      dragOverIdx !== null &&
                                      draggedIdx !== dragOverIdx
                                    ) {
                                      reorderLayers(draggedIdx, dragOverIdx);
                                    }
                                    setDraggedIdx(null);
                                    setDragOverIdx(null);
                                  }}
                                  onClick={() => {
                                    if (isText) {
                                      setSelectedLayerId(layer.id);
                                      setSelectedLogoId(null);
                                    } else {
                                      setSelectedLogoId(layer.id);
                                      setSelectedLayerId(null);
                                    }
                                  }}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                    isSelected
                                      ? "border-red-500 bg-red-50/30 font-semibold"
                                      : dragOverIdx === index
                                        ? "border-dashed border-red-400 bg-zinc-50 scale-[0.98]"
                                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                                  } ${draggedIdx === index ? "opacity-45" : ""}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Drag Handle */}
                                    <div className="text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing p-0.5">
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>

                                    {/* Thumbnail Preview */}
                                    <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                                      {isText ? (
                                        <span className="text-xs font-bold text-zinc-500">
                                          T
                                        </span>
                                      ) : (
                                        <img
                                          src={(layer as any).src}
                                          alt="Layer badge"
                                          className="w-full h-full object-contain"
                                        />
                                      )}
                                    </div>

                                    {/* Name */}
                                    <div className="text-xs text-zinc-700 truncate max-w-[130px]">
                                      {displayName}
                                    </div>
                                  </div>

                                  {/* Controls */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isText) {
                                          handleCopy(layer.id);
                                        } else {
                                          handleLogoCopy(layer.id);
                                        }
                                      }}
                                      title="Duplicate Layer"
                                      className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isText) {
                                          handleDelete(layer.id);
                                        } else {
                                          handleLogoDelete(layer.id);
                                        }
                                      }}
                                      title="Delete Layer"
                                      className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Selected Logo Properties */}
                  {(() => {
                    const selectedLayer = logoLayers.find(
                      (l) => l.id === selectedLogoId,
                    );
                    if (!selectedLayer) return null;
                    const isLogoTab = uploadSubTab === "logo";
                    const layerIsLogo =
                      selectedLayer.type === "logo" || !selectedLayer.type;
                    if (isLogoTab !== layerIsLogo) return null;

                    return (
                      <div className="space-y-4 pt-2 border-t border-zinc-100">
                        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Selected {isLogoTab ? "Logo" : "Image"} Settings
                        </h4>

                        {/* Layer Position control for Image tab */}
                        {!isLogoTab && (
                          <div className="space-y-1.5 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 shadow-sm">
                            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                              Layer Position (Z-Index)
                            </span>
                            <div className="flex bg-zinc-200/60 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoLayers((prev) =>
                                    prev.map((l) =>
                                      l.id === selectedLayer.id
                                        ? { ...l, zOrder: "bottom" }
                                        : l,
                                    ),
                                  );
                                }}
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                                  selectedLayer.zOrder !== "above-text"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900"
                                }`}
                              >
                                Send to Back
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoLayers((prev) =>
                                    prev.map((l) =>
                                      l.id === selectedLayer.id
                                        ? { ...l, zOrder: "above-text" }
                                        : l,
                                    ),
                                  );
                                }}
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                                  selectedLayer.zOrder === "above-text"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900"
                                }`}
                              >
                                Bring to Front
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Size slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-zinc-800">
                            <span>
                              {isLogoTab ? "Logo" : "Image"} Size / Scale
                            </span>
                            <span className="text-zinc-500">
                              {selectedLayer.scale.toFixed(2)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.01"
                            max="20.0"
                            step="0.05"
                            value={selectedLayer.scale}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setLogoLayers((prev) =>
                                prev.map((l) =>
                                  l.id === selectedLayer.id
                                    ? { ...l, scale: val }
                                    : l,
                                ),
                              );
                            }}
                            className="w-full accent-red-600 cursor-pointer"
                          />
                        </div>

                        {/* Rotation slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-zinc-800">
                            <span>{isLogoTab ? "Logo" : "Image"} Rotation</span>
                            <span className="text-zinc-500">
                              {Math.round(selectedLayer.rotation)}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={Math.round(selectedLayer.rotation)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setLogoLayers((prev) =>
                                prev.map((l) =>
                                  l.id === selectedLayer.id
                                    ? { ...l, rotation: val }
                                    : l,
                                ),
                              );
                            }}
                            className="w-full accent-red-600 cursor-pointer"
                          />
                        </div>

                        {/* Opacity slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-zinc-800">
                            <span>{isLogoTab ? "Logo" : "Image"} Opacity</span>
                            <span className="text-zinc-500">
                              {Math.round(
                                (typeof selectedLayer.opacity === "number"
                                  ? selectedLayer.opacity
                                  : 1.0) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={Math.round(
                              (typeof selectedLayer.opacity === "number"
                                ? selectedLayer.opacity
                                : 1.0) * 100,
                            )}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) / 100;
                              setLogoLayers((prev) =>
                                prev.map((l) =>
                                  l.id === selectedLayer.id
                                    ? { ...l, opacity: val }
                                    : l,
                                ),
                              );
                            }}
                            className="w-full accent-red-600 cursor-pointer"
                          />
                        </div>

                        {/* Presets Placement */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">
                            Quick Position Placement
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { name: "Top Left", x: 310, y: 240 },
                              { name: "Top Center", x: 512, y: 240 },
                              { name: "Top Right", x: 714, y: 240 },
                              { name: "Bottom Left", x: 310, y: 490 },
                              { name: "Center", x: 512, y: 365 },
                              { name: "Bottom Right", x: 714, y: 490 },
                            ].map((p) => (
                              <button
                                type="button"
                                key={p.name}
                                onClick={() => {
                                  const targetSide = activeSide; // Keep it on the active side
                                  setLogoLayers((prev) =>
                                    prev.map((l) =>
                                      l.id === selectedLayer.id
                                        ? {
                                            ...l,
                                            x: p.x,
                                            y: p.y,
                                            side: targetSide,
                                          }
                                        : l,
                                    ),
                                  );
                                }}
                                className="p-1.5 rounded border text-[9px] font-medium transition-all duration-300 active:scale-90 leading-tight text-center border-[#002337] text-[#002337] hover:border-zinc-300 cursor-pointer"
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Column 3: Center 3D Viewport Area ── */}
      <div
        className="flex-1 relative flex flex-col"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${state.primary}22 0%, #eaeaea 65%)`,
        }}
      >
        {/* Header Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-3 z-10">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 rounded-lg shadow-sm font-bold text-xs border border-zinc-200 transition-all">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 rounded-lg shadow-sm font-bold text-xs border border-zinc-200 transition-all">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 rounded-lg shadow-sm font-bold text-xs border border-zinc-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Dynamic Badge */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="bg-white/80 backdrop-blur-sm text-xs font-bold text-zinc-700 px-3 py-1.5 rounded-full shadow border border-zinc-200 capitalize">
            {selectedDesign} Style • {state.fabric} Fabric • {state.sleeve} Edge
          </span>
        </div>

        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0.1, 3.4], fov: 52 }}
          shadows
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ThreeGrabber threeRef={threeRef} />
          <color attach="background" args={["transparent" as any]} />
          <ambientLight intensity={1.2} />

          <directionalLight
            position={[1, 4, 5]}
            intensity={1.0}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.001}
          />
          <directionalLight position={[-1, 3, -5]} intensity={1.0} />
          <pointLight position={[-3, 1, 2]} intensity={0.5} />
          <pointLight position={[3, 1, -2]} intensity={0.5} />

          <Environment preset="city" />

          <Pillow3D
            sideColor={state.sleeve === "Welt / Piping Edge" ? state.secondary : state.primary}
            frontTexture={frontTexture}
            backTexture={backTexture}
            fabricFinish={state.fabric.toLowerCase()}
          />

          <ViewHandler currentView={currentView} />
        </Canvas>

        {/* Bottom View Switchers */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-white/85 backdrop-blur-md p-1.5 rounded-full shadow border border-zinc-200">
          <button
            onClick={() => setCurrentView("front")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentView === "front" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-50"}`}
          >
            Front View
          </button>
          <button
            onClick={() => setCurrentView("back")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentView === "back" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-50"}`}
          >
            Back View
          </button>
          <button
            onClick={() => setCurrentView("360")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentView === "360" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-50"}`}
          >
            360° View
          </button>
        </div>
      </div>

      {/* ── Column 4: Right Summary & Pricing Panel ── */}
      <div className="w-full md:w-72 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-5 border-b border-zinc-200 flex-1 overflow-y-auto space-y-6">
          <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>

          {/* Pillow SVG thumbnail */}
          <div className="w-24 h-24 mx-auto">
            <PillowSVG
              primary={state.primaryFront || state.primary}
              secondary={state.designColor || state.secondary}
              pattern={currentPattern}
              selected={false}
            />
          </div>
          <p className="text-center text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Cushion Customizer
          </p>

          <div className="space-y-4">
            {/* Welt seam style price breakdown */}
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Base Cushion</span>
              <span className="font-bold text-zinc-900">
                ${qty >= 10 ? (qty >= 50 ? "18" : "21") : "25"}
              </span>
            </div>

            {state.sleeve === "Welt / Piping Edge" && (
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Piping Seam edge</span>
                <span className="font-bold text-zinc-900">+$5</span>
              </div>
            )}
            {state.sleeve === "Zipper Edge" && (
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Zipper seam edge</span>
                <span className="font-bold text-zinc-900">+$3</span>
              </div>
            )}

            {state.fabric === "Velvet" && (
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Premium Soft Velvet</span>
                <span className="font-bold text-zinc-900">+$8</span>
              </div>
            )}

            {state.cutFit === "20x20" && (
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">20"x20" Large Size</span>
                <span className="font-bold text-zinc-900">+$6</span>
              </div>
            )}

            {/* Size selector */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-zinc-500 block uppercase tracking-wider mb-1.5">
                Cushion Dimensions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "18x18", label: "18\" x 18\" (Standard)" },
                  { id: "20x20", label: "20\" x 20\" (+$6)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateState("cutFit", s.id)}
                    className={`py-2 rounded-xl text-center text-xs font-bold border transition-all ${
                      state.cutFit === s.id ? "border-red-500 bg-red-50/50 text-red-700" : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="border-t border-zinc-100 pt-4">
              <label className="text-[11px] font-bold text-zinc-500 mb-2 block uppercase tracking-wider">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-zinc-200 rounded-xl p-2 text-center font-bold outline-none focus:border-red-500 text-lg"
              />
              <div className="text-[10px] text-green-600 mt-2 font-bold text-center">
                {qty >= 50
                  ? "🎉 Bulk discount rate applied!"
                  : qty >= 10
                    ? `Add ${50 - qty} more for wholesale rates.`
                    : `Add ${10 - qty} more for wholesale discount.`}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-zinc-600">Total Price</span>
            <span className="text-3xl font-extrabold text-zinc-900">${calculatePrice()}</span>
          </div>
          <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm">
            <ShoppingCart className="w-4 h-4" /> Checkout Cushion
          </button>
        </div>
      </div>
    </div>
  );
}
