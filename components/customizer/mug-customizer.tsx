"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Decal } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Undo,
  Upload,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  Type,
  Palette,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Layers,
  Camera,
  Heart,
  Star,
  Coffee,
  Crown,
  Flame,
  Smile,
  Compass,
  Zap,
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- TYPES & INTERFACES ---
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
  letterSpacing: number;
  lineSpacing: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineWidth: number;
}

interface LogoLayer {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  width: number;
  height: number;
  type?: "logo" | "image";
  isPresetSvg?: boolean;
  svgPath?: string;
  svgColor?: string;
}

type Layer =
  | (TextLayer & { layerType: "text" })
  | (LogoLayer & { layerType: "logo" });

// --- PRESET ICONS (Lucide paths for local vector inserts) ---
const PRESET_ICONS = [
  {
    name: "Coffee",
    icon: Coffee,
    path: "M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v2 M10 2v2 M14 2v2",
  },
  {
    name: "Heart",
    icon: Heart,
    path: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  },
  {
    name: "Star",
    icon: Star,
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
  {
    name: "Crown",
    icon: Crown,
    path: "m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14a1 1 0 0 0 1-1v-1H4v1a1 1 0 0 0 1 1z",
  },
  {
    name: "Flame",
    icon: Flame,
    path: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  },
  {
    name: "Smile",
    icon: Smile,
    path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01",
  },
  {
    name: "Compass",
    icon: Compass,
    path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  },
  { name: "Lightning", icon: Zap, path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
];

// --- 3D MUG SCENE COMPONENT ---
interface MugProps {
  outerColor: string;
  innerColor: string;
  handleColor: string;
  rimColor: string;
  materialType: "glossy" | "matte" | "metallic";
  texture: THREE.CanvasTexture | null;
}

function MugModel({
  outerColor,
  innerColor,
  handleColor,
  rimColor,
  materialType,
  texture,
}: MugProps) {
  const roughness =
    materialType === "matte" ? 0.85 : materialType === "metallic" ? 0.3 : 0.15;
  const metalness = materialType === "metallic" ? 0.85 : 0.05;

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Outer Cylinder (Outer wall) - rotated so texture center is facing camera */}
      <mesh rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 2.2, 64, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          map={texture || undefined}
          roughness={roughness}
          metalness={metalness}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Inner Cylinder (Inner wall) */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.94, 0.94, 2.16, 64, 1, true]} />
        <meshStandardMaterial
          color={innerColor}
          roughness={roughness}
          metalness={metalness}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. Outer Bottom Base */}
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 64]} />
        <meshStandardMaterial
          color={outerColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* 4. Inner Bottom Base */}
      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.94, 64]} />
        <meshStandardMaterial
          color={innerColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* 5. Top Rim Torus */}
      <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.97, 0.03, 16, 64]} />
        <meshStandardMaterial
          color={rimColor || outerColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* 6. Handle (attached on the left side at x = -0.9, rotated so it curves out) */}
      <mesh position={[-0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.08, 16, 64, Math.PI]} />
        <meshStandardMaterial
          color={handleColor || outerColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
    </group>
  );
}

// Helper to capture the scene
let globalGl: THREE.WebGLRenderer | null = null;
function SceneCaptureHelper() {
  const { gl } = useThree();
  useEffect(() => {
    globalGl = gl;
    return () => {
      globalGl = null;
    };
  }, [gl]);
  return null;
}

export default function MugCustomizer() {
  // --- STATE ---
  const [outerColor, setOuterColor] = useState("#FFFFFF");
  const [innerColor, setInnerColor] = useState("#008080"); // Teal default
  const [handleColor, setHandleColor] = useState("#FFFFFF");
  const [rimColor, setRimColor] = useState("#008080");
  const [materialType, setMaterialType] = useState<
    "glossy" | "matte" | "metallic"
  >("glossy");

  const [activeTab, setActiveTab] = useState<"colors" | "text" | "uploads">(
    "colors",
  );
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [logoLayers, setLogoLayers] = useState<LogoLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // 2D editor canvas parameters
  const canvasWidth = 1024;
  const canvasHeight = 358;
  const editorWidth = 560; // Increased width for much easier editing/manipulation
  const editorScale = editorWidth / canvasWidth; // Scale down for the 560px visual editor bounding box

  // Dynamic canvas texture references
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mugTexture, setMugTexture] = useState<THREE.CanvasTexture | null>(
    null,
  );

  // --- PRESET TEMPLATES ---
  const COLOR_PRESETS = [
    {
      name: "Teal Classic",
      outer: "#FFFFFF",
      inner: "#008080",
      handle: "#FFFFFF",
      rim: "#008080",
    },
    {
      name: "Midnight Gold",
      outer: "#1E1E24",
      inner: "#D4AF37",
      handle: "#1E1E24",
      rim: "#D4AF37",
    },
    {
      name: "Crimson Minimal",
      outer: "#F5F5F7",
      inner: "#C9184A",
      handle: "#F5F5F7",
      rim: "#C9184A",
    },
    {
      name: "Total Charcoal",
      outer: "#2D2D30",
      inner: "#3E3E42",
      handle: "#2D2D30",
      rim: "#3E3E42",
    },
    {
      name: "Sweet Sakura",
      outer: "#FFFFFF",
      inner: "#FFB5A7",
      handle: "#FFB5A7",
      rim: "#FFB5A7",
    },
    {
      name: "Ocean Breeze",
      outer: "#E8F1F5",
      inner: "#0077B6",
      handle: "#E8F1F5",
      rim: "#0077B6",
    },
  ];

  // Sync rim color to interior color by default when interior color changes
  const handleInnerColorChange = (color: string) => {
    setInnerColor(color);
    setRimColor(color);
  };

  // --- RENDER DYNAMIC CANVAS TEXTURE ---
  const sortedLayers = useMemo(() => {
    const all = [
      ...textLayers.map((l) => ({ ...l, layerType: "text" as const })),
      ...logoLayers.map((l) => ({ ...l, layerType: "logo" as const })),
    ];
    // Keep consistent sorting order
    return all;
  }, [textLayers, logoLayers]);

  // Redraw canvas on state changes
  useEffect(() => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Fill base background with outerColor
    ctx.fillStyle = outerColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid/background guide pattern if needed, but not on the actual texture
    // Draw all layers
    sortedLayers.forEach((layer) => {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);

      if (layer.layerType === "text") {
        ctx.font = `${layer.outlineEnabled ? "bold " : ""}${layer.textSize}px ${layer.font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Shadow
        if (layer.shadowEnabled) {
          ctx.shadowColor = layer.shadowColor;
          ctx.shadowBlur = layer.shadowBlur;
          ctx.shadowOffsetX = layer.shadowOffsetX;
          ctx.shadowOffsetY = layer.shadowOffsetY;
        }

        // Outline / Stroke
        if (layer.outlineEnabled) {
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = layer.outlineWidth;
          ctx.strokeText(layer.text, 0, 0);
        }

        // Fill color
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.text, 0, 0);
      } else {
        // Logo / Image
        const imgElement = document.getElementById(
          `img-preload-${layer.id}`,
        ) as HTMLImageElement;
        if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
          ctx.drawImage(
            imgElement,
            -layer.width / 2,
            -layer.height / 2,
            layer.width,
            layer.height,
          );
        } else if (layer.isPresetSvg && layer.svgPath) {
          // Draw Preset Vector Path
          ctx.fillStyle = layer.svgColor || "#1E1E24";
          const path2D = new Path2D(layer.svgPath);
          ctx.translate(-24, -24); // Center standard 48x48 SVGs
          ctx.scale(1.0, 1.0);
          ctx.fill(path2D);
        }
      }
      ctx.restore();
    });

    // Create or update CanvasTexture
    if (!mugTexture) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      setMugTexture(tex);
    } else {
      mugTexture.needsUpdate = true;
    }
  }, [sortedLayers, mugTexture, outerColor]);

  // --- LAYER MANAGEMENT ---
  const handleAddText = () => {
    const id = `text-${Date.now()}`;
    const newText: TextLayer = {
      id,
      text: "MY CUSTOM TEXT",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      scale: 0.8,
      rotation: 0,
      font: "Impact",
      color: "#FFFFFF",
      textSize: 64,
      letterSpacing: 0,
      lineSpacing: 1.15,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 10,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      outlineEnabled: true,
      outlineColor: "#000000",
      outlineWidth: 3,
    };
    setTextLayers((prev) => [...prev, newText]);
    setSelectedLayerId(id);
    toast.success("Text layer added!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const id = `logo-${Date.now()}`;

      // Preload image to get dimensions
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxDim = 180;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          h = (h / w) * maxDim;
          w = maxDim;
        } else {
          w = (w / h) * maxDim;
          h = maxDim;
        }

        const newLogo: LogoLayer = {
          id,
          src,
          x: canvasWidth / 2,
          y: canvasHeight / 2,
          scale: 1.0,
          rotation: 0,
          width: w,
          height: h,
          type: "image",
        };

        setLogoLayers((prev) => [...prev, newLogo]);
        setSelectedLayerId(id);
        toast.success("Logo uploaded successfully!");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddPresetIcon = (iconName: string, path: string) => {
    const id = `preset-${Date.now()}`;
    const newIcon: LogoLayer = {
      id,
      src: "",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      scale: 1.8,
      rotation: 0,
      width: 48,
      height: 48,
      type: "logo",
      isPresetSvg: true,
      svgPath: path,
      svgColor: "#FFFFFF",
    };
    setLogoLayers((prev) => [...prev, newIcon]);
    setSelectedLayerId(id);
    toast.success(`Preset icon '${iconName}' added!`);
  };

  const handleDeleteLayer = (id: string) => {
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    setLogoLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedLayerId(null);
    toast.info("Layer deleted.");
  };

  // --- INTERACTION HANDLERS FOR 2D EDITOR ---
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedLayerId(id);

    const isText = textLayers.some((t) => t.id === id);
    const layer = isText
      ? textLayers.find((t) => t.id === id)
      : logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const startX = layer.x;
    const startY = layer.y;
    const mouseStartX = e.clientX;
    const mouseStartY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - mouseStartX) / editorScale;
      const deltaY = (moveEvent.clientY - mouseStartY) / editorScale;

      if (isText) {
        setTextLayers((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, x: startX + deltaX, y: startY + deltaY } : t,
          ),
        );
      } else {
        setLogoLayers((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, x: startX + deltaX, y: startY + deltaY } : l,
          ),
        );
      }
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

    const isText = textLayers.some((t) => t.id === id);
    const layer = isText
      ? textLayers.find((t) => t.id === id)
      : logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const canvasContainer = (e.currentTarget as HTMLElement).closest(
      ".editor-bounds",
    );
    if (!canvasContainer) return;
    const rect = canvasContainer.getBoundingClientRect();
    const layerScreenX = rect.left + layer.x * editorScale;
    const layerScreenY = rect.top + layer.y * editorScale;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(
      startMouseY - layerScreenY,
      startMouseX - layerScreenX,
    );
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - layerScreenY,
        moveEvent.clientX - layerScreenX,
      );
      const angleDiff = ((currentAngle - startAngle) * 180) / Math.PI;
      const newRotation = (startRotation + angleDiff) % 360;

      if (isText) {
        setTextLayers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, rotation: newRotation } : t)),
        );
      } else {
        setLogoLayers((prev) =>
          prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l)),
        );
      }
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

    const isText = textLayers.some((t) => t.id === id);
    const layer = isText
      ? textLayers.find((t) => t.id === id)
      : logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const startMouseX = e.clientX;
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      // Change scale proportionally with X drag movement
      const newScale = Math.max(0.1, startScale + deltaX * 0.01);

      if (isText) {
        setTextLayers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, scale: newScale } : t)),
        );
      } else {
        setLogoLayers((prev) =>
          prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l)),
        );
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // --- EXPORTS ---
  const handleExportTemplate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Mug Outer Background Color
    ctx.fillStyle = outerColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Dynamic Canvas content on top
    const printCanvas = hiddenCanvasRef.current;
    if (printCanvas) {
      ctx.drawImage(printCanvas, 0, 0);
    }

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "mug-print-template.png";
    link.href = dataURL;
    link.click();
    toast.success("Flat print template downloaded!");
  };

  const handleCapture3D = () => {
    if (!globalGl) {
      toast.error("3D context not ready yet");
      return;
    }

    // Capture the WebGL context as image
    const dataURL = globalGl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "mug-3d-mockup.png";
    link.href = dataURL;
    link.click();
    toast.success("3D mockup snapshot downloaded!");
  };

  // Clear customization
  const handleReset = () => {
    setTextLayers([]);
    setLogoLayers([]);
    setSelectedLayerId(null);
    setOuterColor("#FFFFFF");
    setInnerColor("#008080");
    setHandleColor("#FFFFFF");
    setRimColor("#008080");
    setMaterialType("glossy");
    toast.info("Customizer reset successfully.");
  };

  const activeLayer = sortedLayers.find((l) => l.id === selectedLayerId);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      <Toaster position="bottom-right" theme="dark" />

      {/* Invisible canvas used to compile texture */}
      <canvas
        ref={hiddenCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="hidden"
      />

      {/* Hidden images preload for canvas drawing */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
        {logoLayers.map((l) =>
          l.src ? (
            <img
              key={l.id}
              id={`img-preload-${l.id}`}
              src={l.src}
              alt="preload"
              onLoad={() => {
                // Trigger state refresh when image finishes loading
                setLogoLayers((prev) => [...prev]);
              }}
            />
          ) : null,
        )}
      </div>

      {/* --- SIDEBAR CUSTOMIZATION PANEL --- */}
      <div className="w-full lg:w-[420px] bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col h-[50vh] lg:h-full z-10">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent uppercase">
              3D Mug Studio
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Reset Customization"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800 p-2 gap-1 bg-zinc-900/40">
          <button
            onClick={() => setActiveTab("colors")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "colors"
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Palette className="w-4 h-4" />
            Colors
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Type className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "uploads"
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Upload className="w-4 h-4" />
            Graphics
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* TAB 1: COLORS */}
          {activeTab === "colors" && (
            <div className="space-y-4">
              {/* Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Preset Templates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setOuterColor(preset.outer);
                        setInnerColor(preset.inner);
                        setHandleColor(preset.handle);
                        setRimColor(preset.rim);
                        toast.info(`Applied ${preset.name} template`);
                      }}
                      className="p-2 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <div className="flex gap-0.5">
                        <span
                          className="w-3 h-3 rounded-full border border-zinc-900"
                          style={{ backgroundColor: preset.outer }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-zinc-900"
                          style={{ backgroundColor: preset.inner }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-300 truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Styles */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Material Finish
                </label>
                <div className="flex gap-2">
                  {(["glossy", "matte", "metallic"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMaterialType(type)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        materialType === type
                          ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Ceramic Parts Colors */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-300">
                      Outer Ceramic
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Mug external wall
                    </span>
                  </div>
                  <input
                    type="color"
                    value={outerColor}
                    onChange={(e) => setOuterColor(e.target.value)}
                    className="w-10 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-300">
                      Inner Ceramic
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Mug interior color
                    </span>
                  </div>
                  <input
                    type="color"
                    value={innerColor}
                    onChange={(e) => handleInnerColorChange(e.target.value)}
                    className="w-10 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-300">
                      Handle Color
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Mug grip color
                    </span>
                  </div>
                  <input
                    type="color"
                    value={handleColor}
                    onChange={(e) => setHandleColor(e.target.value)}
                    className="w-10 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-300">
                      Top Rim Ring
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Mug top edge color
                    </span>
                  </div>
                  <input
                    type="color"
                    value={rimColor}
                    onChange={(e) => setRimColor(e.target.value)}
                    className="w-10 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT LAYERS */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <button
                onClick={handleAddText}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold rounded-lg text-xs tracking-wider uppercase cursor-pointer transition-colors shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" />
                Add Custom Text
              </button>

              {textLayers.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Text Editor Settings
                  </label>

                  {/* Active selection settings */}
                  {activeLayer && activeLayer.layerType === "text" ? (
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          Edit Text String
                        </label>
                        <input
                          type="text"
                          value={activeLayer.text}
                          onChange={(e) =>
                            setTextLayers((prev) =>
                              prev.map((t) =>
                                t.id === activeLayer.id
                                  ? { ...t, text: e.target.value }
                                  : t,
                              ),
                            )
                          }
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={activeLayer.color}
                            onChange={(e) =>
                              setTextLayers((prev) =>
                                prev.map((t) =>
                                  t.id === activeLayer.id
                                    ? { ...t, color: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full h-8 rounded border border-zinc-700 cursor-pointer bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                            Font Style
                          </label>
                          <select
                            value={activeLayer.font}
                            onChange={(e) =>
                              setTextLayers((prev) =>
                                prev.map((t) =>
                                  t.id === activeLayer.id
                                    ? { ...t, font: e.target.value }
                                    : t,
                                ),
                              )
                            }
                            className="w-full p-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200"
                          >
                            <option value="Impact">Impact</option>
                            <option value="Arial">Arial</option>
                            <option value="Brush Script MT">
                              Brush Script
                            </option>
                            <option value="Courier New">Monospace</option>
                            <option value="Georgia">Serif</option>
                          </select>
                        </div>
                      </div>

                      {/* Font Size & Spacing */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">
                            Font Size
                          </span>
                          <span className="text-xs font-bold text-teal-400">
                            {activeLayer.textSize}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="150"
                          value={activeLayer.textSize}
                          onChange={(e) =>
                            setTextLayers((prev) =>
                              prev.map((t) =>
                                t.id === activeLayer.id
                                  ? { ...t, textSize: parseInt(e.target.value) }
                                  : t,
                              ),
                            )
                          }
                          className="w-full accent-teal-500"
                        />
                      </div>

                      {/* Stroke Settings */}
                      <div className="pt-2 border-t border-zinc-700/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Text Border (Stroke)
                          </label>
                          <input
                            type="checkbox"
                            checked={activeLayer.outlineEnabled}
                            onChange={(e) =>
                              setTextLayers((prev) =>
                                prev.map((t) =>
                                  t.id === activeLayer.id
                                    ? { ...t, outlineEnabled: e.target.checked }
                                    : t,
                                ),
                              )
                            }
                            className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                          />
                        </div>
                        {activeLayer.outlineEnabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="color"
                              value={activeLayer.outlineColor}
                              onChange={(e) =>
                                setTextLayers((prev) =>
                                  prev.map((t) =>
                                    t.id === activeLayer.id
                                      ? { ...t, outlineColor: e.target.value }
                                      : t,
                                  ),
                                )
                              }
                              className="w-full h-8 rounded border border-zinc-700 cursor-pointer bg-transparent"
                            />
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={activeLayer.outlineWidth}
                              onChange={(e) =>
                                setTextLayers((prev) =>
                                  prev.map((t) =>
                                    t.id === activeLayer.id
                                      ? {
                                          ...t,
                                          outlineWidth: parseInt(
                                            e.target.value,
                                          ),
                                        }
                                      : t,
                                  ),
                                )
                              }
                              className="w-full p-1 bg-zinc-900 border border-zinc-700 rounded text-center text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Shadow Settings */}
                      <div className="pt-2 border-t border-zinc-700/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Text Shadow
                          </label>
                          <input
                            type="checkbox"
                            checked={activeLayer.shadowEnabled}
                            onChange={(e) =>
                              setTextLayers((prev) =>
                                prev.map((t) =>
                                  t.id === activeLayer.id
                                    ? { ...t, shadowEnabled: e.target.checked }
                                    : t,
                                ),
                              )
                            }
                            className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                          />
                        </div>
                        {activeLayer.shadowEnabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="color"
                              value={activeLayer.shadowColor}
                              onChange={(e) =>
                                setTextLayers((prev) =>
                                  prev.map((t) =>
                                    t.id === activeLayer.id
                                      ? { ...t, shadowColor: e.target.value }
                                      : t,
                                  ),
                                )
                              }
                              className="w-full h-8 rounded border border-zinc-700 cursor-pointer bg-transparent"
                            />
                            <div className="flex flex-col justify-center gap-1">
                              <span className="text-[9px] text-zinc-500 font-bold uppercase">
                                Blur
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                value={activeLayer.shadowBlur}
                                onChange={(e) =>
                                  setTextLayers((prev) =>
                                    prev.map((t) =>
                                      t.id === activeLayer.id
                                        ? {
                                            ...t,
                                            shadowBlur: parseInt(
                                              e.target.value,
                                            ),
                                          }
                                        : t,
                                    ),
                                  )
                                }
                                className="w-full accent-teal-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-zinc-800/30 rounded-lg text-xs text-zinc-500">
                      Select a text layer in the editor/list to modify settings.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GRAPHICS / UPLOADS */}
          {activeTab === "uploads" && (
            <div className="space-y-4">
              {/* File Upload Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Upload Logo / Image
                </label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-700 hover:border-teal-500 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-4 pb-3">
                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-teal-400 mb-1.5 transition-colors" />
                    <p className="text-xs text-zinc-400 font-bold">
                      Upload PNG, JPG
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preset Icons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Preset Vector Badges
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_ICONS.map((iconObj) => {
                    const IconComp = iconObj.icon;
                    return (
                      <button
                        key={iconObj.name}
                        onClick={() =>
                          handleAddPresetIcon(iconObj.name, iconObj.path)
                        }
                        className="p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/30 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.05]"
                      >
                        <IconComp className="w-5 h-5 text-teal-400" />
                        <span className="text-[8px] font-bold text-zinc-400 truncate w-full text-center">
                          {iconObj.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Graphic color settings */}
              {activeLayer &&
                activeLayer.layerType === "logo" &&
                activeLayer.isPresetSvg && (
                  <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">
                        Badge Fill Color
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Preset color overlay
                      </span>
                    </div>
                    <input
                      type="color"
                      value={activeLayer.svgColor || "#FFFFFF"}
                      onChange={(e) =>
                        setLogoLayers((prev) =>
                          prev.map((l) =>
                            l.id === activeLayer.id
                              ? { ...l, svgColor: e.target.value }
                              : l,
                          ),
                        )
                      }
                      className="w-10 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                    />
                  </div>
                )}
            </div>
          )}

          {/* LAYERS LIST VIEW (Always visible at the bottom of panel if layers exist) */}
          {sortedLayers.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Layers List Stack
                </label>
              </div>

              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {sortedLayers.map((layer) => {
                  const isSelected = selectedLayerId === layer.id;
                  const isText = layer.layerType === "text";

                  return (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/10 border-teal-500/30 text-teal-300"
                          : "bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isText ? (
                          <Type className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate">
                          {isText
                            ? `Text: "${layer.text}"`
                            : layer.isPresetSvg
                              ? "Preset Badge"
                              : "Uploaded Graphic"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Save/Export */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-2">
          <button
            onClick={handleExportTemplate}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-lg text-xs tracking-wider uppercase cursor-pointer transition-colors border border-zinc-700"
          >
            <Download className="w-4 h-4 text-teal-400" />
            Download Flat print template
          </button>
          <button
            onClick={handleCapture3D}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-100 font-bold rounded-lg text-xs tracking-wider uppercase cursor-pointer transition-colors border border-zinc-800"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            Capture 3D Mockup
          </button>
        </div>
      </div>

      {/* --- CENTRAL MAIN VIEWPORT AREA --- */}
      <div className="flex-1 flex flex-col relative h-[50vh] lg:h-full bg-zinc-950">
        {/* Top 3D Indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Interactive 3D View
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
          <Canvas
            shadows
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            camera={{ position: [0, 0, 4], fov: 45 }}
          >
            <ambientLight intensity={0.8} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={1.5}
              castShadow
            />
            <directionalLight position={[-5, 5, 5]} intensity={1.0} />
            <directionalLight position={[0, -5, -2]} intensity={0.5} />

            <MugModel
              outerColor={outerColor}
              innerColor={innerColor}
              handleColor={handleColor}
              rimColor={rimColor}
              materialType={materialType}
              texture={mugTexture}
            />

            <OrbitControls
              enablePan={false}
              minDistance={2.5}
              maxDistance={6.0}
              target={[0, 0, 0]}
            />
            <SceneCaptureHelper />
          </Canvas>
        </div>

        {/* --- DYNAMIC 2D CANVAS CONTAINER OVERLAY (Bottom-Right) --- */}
        <div className="absolute bottom-4 right-4 z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 w-[92vw] md:w-[592px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Visual Flat Print Area
            </span>
            <span className="text-[9px] font-bold text-teal-400 px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full">
              Wrap Map ({canvasWidth}x{canvasHeight})
            </span>
          </div>

          {/* Interactive Bounding Box Canvas representation */}
          <div
            className="editor-bounds relative border border-zinc-800/80 bg-zinc-950 overflow-hidden rounded-xl mx-auto"
            style={{
              width: editorWidth,
              height: Math.round(editorWidth * (canvasHeight / canvasWidth)),
              backgroundColor: outerColor,
            }}
          >
            {/* Visual Guide Markers (Handle, Front, Back centers) */}
            <div className="absolute inset-0 pointer-events-none flex">
              {/* Left Safe margin near handle */}
              <div className="h-full border-r border-dashed border-zinc-800/40" style={{ width: Math.round(20 * (editorWidth / 280)) }} />
              {/* Front view center */}
              <div className="h-full border-r border-dashed border-teal-500/10 flex-1 relative">
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-zinc-600 font-bold uppercase tracking-wider">
                  Front
                </span>
              </div>
              {/* Middle boundary */}
              <div className="h-full border-r border-dashed border-zinc-800/40 w-0" />
              {/* Back view center */}
              <div className="h-full border-r border-dashed border-teal-500/10 flex-1 relative">
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-zinc-600 font-bold uppercase tracking-wider">
                  Back
                </span>
              </div>
              {/* Right Safe margin near handle */}
              <div className="h-full border-l border-dashed border-zinc-800/40" style={{ width: Math.round(20 * (editorWidth / 280)) }} />
            </div>

            {/* Render interactive layers */}
            {sortedLayers.map((layer) => {
              const isSelected = selectedLayerId === layer.id;
              const isText = layer.layerType === "text";

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
                  onMouseDown={(e) => handleDragStart(e, layer.id)}
                >
                  {/* Layer content visualization */}
                  <div
                    className={`relative p-1 select-none whitespace-nowrap transition-all ${
                      isSelected
                        ? "border border-red-500 border-dashed bg-red-500/5"
                        : "border border-transparent"
                    }`}
                  >
                    {isText ? (
                      <span
                        style={{
                          fontFamily: layer.font,
                          color: layer.color,
                          fontSize: `${layer.textSize * editorScale}px`,
                          fontWeight: layer.outlineEnabled ? "bold" : "normal",
                        }}
                      >
                        {layer.text}
                      </span>
                    ) : layer.isPresetSvg && layer.svgPath ? (
                      <svg
                        viewBox="0 0 48 48"
                        style={{
                          width: layer.width * editorScale,
                          height: layer.height * editorScale,
                          fill: layer.svgColor || "#FFFFFF",
                        }}
                      >
                        <path d={layer.svgPath} />
                      </svg>
                    ) : (
                      <img
                        src={layer.src}
                        alt="layer logo"
                        style={{
                          width: layer.width * editorScale,
                          height: layer.height * editorScale,
                          objectFit: "contain",
                        }}
                        draggable={false}
                      />
                    )}

                    {/* Resize/Rotate Control Handles (only if selected) */}
                    {isSelected && (
                      <>
                        {/* Top-Right: Rotate */}
                        <div
                          className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-amber-500 rounded-full border border-zinc-950 flex items-center justify-center cursor-alias hover:scale-110 active:scale-95 transition-transform z-50 shadow-md"
                          onMouseDown={(e) => handleRotateStart(e, layer.id)}
                          title="Rotate"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 text-zinc-950 stroke-2 fill-none stroke-current"
                          >
                            <path d="M21.5 2v6h-6M21.34 8a10 10 0 1 0-.5 4.5" />
                          </svg>
                        </div>

                        {/* Bottom-Right: Resize/Scale */}
                        <div
                          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-teal-400 rounded-full border border-zinc-950 flex items-center justify-center cursor-se-resize hover:scale-110 active:scale-95 transition-transform z-50 shadow-md"
                          onMouseDown={(e) => handleScaleStart(e, layer.id)}
                          title="Scale"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 text-zinc-950 stroke-2 fill-none stroke-current"
                          >
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[9px] text-zinc-500 text-center leading-relaxed">
            Drag to reposition. Use the{" "}
            <span className="text-amber-500 font-bold">orange handle</span> to
            rotate and the{" "}
            <span className="text-teal-400 font-bold">blue handle</span> to
            scale.
          </div>
        </div>
      </div>
    </div>
  );
}
