"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LogoImg from "@/assets/images/logo.png";
import {
  LayoutTemplate,
  Palette,
  Grid,
  Type,
  Image as ImageIcon,
  Scissors,
  Box,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Upload,
  Briefcase,
  Coffee,
  Heart,
  Star,
  Crown,
  Flame,
  Smile,
  Compass,
  Zap,
  Camera as CameraIcon,
  Layers,
  GripVertical,
  Copy,
} from "lucide-react";
import { toast, Toaster } from "sonner";

// --- TYPES & INTERFACES ---
interface TextLayer {
  id: string;
  side: "front" | "back";
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
  curveRadius?: number;
}

interface LogoLayer {
  id: string;
  side: "front" | "back";
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

// --- PRESET ICONS ---
const PRESET_ICONS = [
  {
    name: "Briefcase",
    icon: Briefcase,
    path: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M2 10h20",
  },
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

// --- 3D CARD PREVIEW MODEL COMPONENT ---
interface CardModelProps {
  frontBgColor: string;
  backBgColor: string;
  edgeColor: string;
  materialType: "glossy" | "matte" | "metallic" | "velvet";
  frontTexture: THREE.CanvasTexture | null;
  backTexture: THREE.CanvasTexture | null;
  activeSide: "front" | "back";
  roundedCorners: boolean;
  isStatic?: boolean;
  staticRotationY?: number;
}

// 3D Studio Showcase Stage: Concrete pedestal
function ShowcaseStage() {
  return (
    <group position={[0, -0.1, 0]}>
      {/* 1. Concrete Pedestal at the bottom */}
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[1.5, 1.55, 0.15, 64]} />
        <meshStandardMaterial color="#E2E2E5" roughness={0.85} metalness={0.15} />
      </mesh>
    </group>
  );
}

// Helper component to add out-of-phase floating animation to cards in showcase mode
function ShowcaseGroup({
  children,
  speed = 1.2,
  factor = 0.08,
  offset = 0,
}: {
  children: React.ReactNode;
  speed?: number;
  factor?: number;
  offset?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * speed + offset;
      ref.current.position.y = Math.sin(t) * factor;
    }
  });
  return <group ref={ref}>{children}</group>;
}

function CardModel({
  frontBgColor,
  backBgColor,
  edgeColor,
  materialType,
  frontTexture,
  backTexture,
  activeSide,
  roundedCorners,
  isStatic = false,
  staticRotationY = 0,
}: CardModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotationY = activeSide === "front" ? 0 : Math.PI;

  // Smooth Y-axis spin when activeSide changes
  useFrame((state, delta) => {
    if (isStatic) {
      if (groupRef.current) {
        groupRef.current.rotation.y = staticRotationY;
      }
      return;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        7 * delta
      );
    }
  });

  const roughness =
    materialType === "matte"
      ? 0.95
      : materialType === "velvet"
        ? 0.9
        : materialType === "metallic"
          ? 0.35
          : 0.18; // glossy
  const metalness = materialType === "metallic" ? 0.85 : 0.04;

  // Slight inset for the central edge box if corners are rounded to prevent corner protrusion
  const edgeSizeX = roundedCorners ? 3.47 : 3.492;
  const edgeSizeY = roundedCorners ? 1.97 : 1.992;

  return (
    <group ref={groupRef} rotation={isStatic ? [0, staticRotationY, 0] : undefined}>
      {/* Front Side Plane */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial
          map={frontTexture || undefined}
          roughness={roughness}
          metalness={metalness}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back Side Plane */}
      <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial
          map={backTexture || undefined}
          roughness={roughness}
          metalness={metalness}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge Core Mesh */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[edgeSizeX, edgeSizeY, 0.008]} />
        <meshStandardMaterial
          color={edgeColor}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// WebGL screenshot helper
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

// --- SIDEBAR TABS DEFINITION ---
const TABS = [
  { id: "designs", icon: LayoutTemplate, label: "Designs" },
  { id: "colors", icon: Palette, label: "Colors" },
  { id: "patterns", icon: Grid, label: "Patterns" },
  { id: "text", icon: Type, label: "Text" },
  { id: "logos", icon: ImageIcon, label: "Uploads" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "style", icon: Scissors, label: "Style" },
  { id: "fabric", icon: Box, label: "Fabric" },
];

export default function BusinessCardCustomizer() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState<string>("designs");
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [activeColorSide, setActiveColorSide] = useState<"Both" | "Front" | "Back">("Both");
  const [viewMode, setViewMode] = useState<"standard" | "showcase">("standard");

  // Core properties
  const [frontBgColor, setFrontBgColor] = useState<string>("#111115"); // luxury dark color
  const [backBgColor, setBackBgColor] = useState<string>("#111115");
  const [edgeColor, setEdgeColor] = useState<string>("#D4AF37"); // Luxury Gold Default
  const [paperPattern, setPaperPattern] = useState<"plain" | "linen" | "marble" | "grid" | "kraft" | "stripe">("plain");
  const [roundedCorners, setRoundedCorners] = useState<boolean>(false);
  const [cardWeight, setCardWeight] = useState<string>("300 GSM");
  const [materialType, setMaterialType] = useState<
    "glossy" | "matte" | "metallic" | "velvet"
  >("matte");

  // Layers State
  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    {
      id: "front-txt-name",
      side: "front",
      text: "ALEXANDER VAIL",
      x: 525,
      y: 260,
      scale: 0.85,
      rotation: 0,
      font: "Playfair Display",
      color: "#D4AF37",
      textSize: 44,
      letterSpacing: 4,
      lineSpacing: 1.2,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      outlineEnabled: false,
      outlineColor: "#000000",
      outlineWidth: 2,
    },
    {
      id: "front-txt-title",
      side: "front",
      text: "CHIEF EXECUTIVE OFFICER",
      x: 525,
      y: 330,
      scale: 0.8,
      rotation: 0,
      font: "Montserrat",
      color: "#A1A1AA",
      textSize: 16,
      letterSpacing: 6,
      lineSpacing: 1.2,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      outlineEnabled: false,
      outlineColor: "#000000",
      outlineWidth: 2,
    },
    {
      id: "back-txt-logo",
      side: "back",
      text: "VAIL DIGITAL",
      x: 525,
      y: 350,
      scale: 0.9,
      rotation: 0,
      font: "Playfair Display",
      color: "#FFFFFF",
      textSize: 38,
      letterSpacing: 8,
      lineSpacing: 1.2,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      outlineEnabled: false,
      outlineColor: "#000000",
      outlineWidth: 2,
    },
  ]);

  const [logoLayers, setLogoLayers] = useState<LogoLayer[]>([
    {
      id: "back-preset-logo",
      side: "back",
      src: "",
      x: 525,
      y: 220,
      scale: 1.4,
      rotation: 0,
      width: 48,
      height: 48,
      isPresetSvg: true,
      svgPath: "m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14a1 1 0 0 0 1-1v-1H4v1a1 1 0 0 0 1 1z",
      svgColor: "#D4AF37",
    },
  ]);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [layersOrder, setLayersOrder] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Keep layersOrder in sync with all active layers
  useEffect(() => {
    setLayersOrder((prev) => {
      const existing = prev.filter((id) =>
        textLayers.some((t) => t.id === id) || logoLayers.some((l) => l.id === id)
      );
      const allActive = [
        ...textLayers.map((t) => ({ ...t, layerType: "text" })),
        ...logoLayers.map((l) => ({ ...l, layerType: "logo" })),
      ];
      const newLayers = allActive.filter((l) => !existing.includes(l.id));
      const sortedNew = newLayers.sort((a, b) => {
        const getPriority = (l: any) => {
          if (l.layerType === "text") return 1;
          return 3;
        };
        return getPriority(a) - getPriority(b);
      });
      return [...existing, ...sortedNew.map((l) => l.id)];
    });
  }, [textLayers, logoLayers]);

  const reorderLayers = (fromUIIndex: number, toUIIndex: number) => {
    const sideTextLayers = textLayers.filter((l) => l.side === activeSide);
    const sideLogoLayers = logoLayers.filter((l) => l.side === activeSide);
    const activeSideLayers = [
      ...sideTextLayers.map((l) => ({ ...l, layerType: "text" as const })),
      ...sideLogoLayers.map((l) => ({ ...l, layerType: "logo" as const })),
    ];

    const sortedActiveSideLayers = [...activeSideLayers].sort((a, b) => {
      const idxA = layersOrder.indexOf(a.id);
      const idxB = layersOrder.indexOf(b.id);
      const getPriority = (l: any) => {
        if (l.layerType === "text") return 1;
        return 3;
      };
      const valA = idxA !== -1 ? idxA : getPriority(a) * 1000;
      const valB = idxB !== -1 ? idxB : getPriority(b) * 1000;
      return valB - valA;
    });

    const reorderedSideLayers = [...sortedActiveSideLayers];
    const [movedItem] = reorderedSideLayers.splice(fromUIIndex, 1);
    reorderedSideLayers.splice(toUIIndex, 0, movedItem);

    // Map new UI order back into layersOrder
    setLayersOrder((prev) => {
      const newOrder = [...prev];
      const sideLayerIds = sortedActiveSideLayers.map((l) => l.id);
      const newDrawOrderSideIds = [...reorderedSideLayers]
        .reverse()
        .map((l) => l.id);

      const indices = newOrder
        .map((id, index) => (sideLayerIds.includes(id) ? index : -1))
        .filter((index) => index !== -1);

      indices.forEach((indexInOrder, idx) => {
        newOrder[indexInOrder] = newDrawOrderSideIds[idx];
      });

      return newOrder;
    });
  };

  const currentSideLayers = useMemo(() => {
    const texts = textLayers.filter((l) => l.side === activeSide).map((l) => ({ ...l, layerType: "text" as const }));
    const logos = logoLayers.filter((l) => l.side === activeSide).map((l) => ({ ...l, layerType: "logo" as const }));
    return [...texts, ...logos].sort((a, b) => {
      const idxA = layersOrder.indexOf(a.id);
      const idxB = layersOrder.indexOf(b.id);
      const getPriority = (l: any) => {
        if (l.layerType === "text") return 1;
        return 3;
      };
      const valA = idxA !== -1 ? idxA : getPriority(a) * 1000;
      const valB = idxB !== -1 ? idxB : getPriority(b) * 1000;
      return valB - valA;
    });
  }, [textLayers, logoLayers, activeSide, layersOrder]);

  // PRESET DESIGN TEMPLATES (Matching exact flow)
  const CARD_PRESETS = [
    {
      name: "Luxury Gold",
      frontBg: "#111115",
      backBg: "#111115",
      edge: "#D4AF37",
      textColor: "#D4AF37",
      pattern: "plain" as const,
      rounded: false,
      finish: "matte" as const,
    },
    {
      name: "Neon Tech",
      frontBg: "#05070C",
      backBg: "#05070C",
      edge: "#00FFCC",
      textColor: "#00FFCC",
      pattern: "grid" as const,
      rounded: true,
      finish: "glossy" as const,
    },
    {
      name: "Crimson Velvet",
      frontBg: "#5C061E",
      backBg: "#5C061E",
      edge: "#FFFFFF",
      textColor: "#FFFFFF",
      pattern: "plain" as const,
      rounded: false,
      finish: "velvet" as const,
    },
    {
      name: "Brushed Steel",
      frontBg: "#3E3E42",
      backBg: "#3E3E42",
      edge: "#A1A1AA",
      textColor: "#FFFFFF",
      pattern: "stripe" as const,
      rounded: false,
      finish: "metallic" as const,
    },
    {
      name: "Minimalist Ivory",
      frontBg: "#F9F6F0",
      backBg: "#F9F6F0",
      edge: "#1A1A1E",
      textColor: "#1A1A1E",
      pattern: "linen" as const,
      rounded: true,
      finish: "matte" as const,
    },
  ];

  const FONTS_LIST = [
    "Arial",
    "Georgia",
    "Courier New",
    "Impact",
    "Playfair Display",
    "Montserrat",
    "Trebuchet MS",
    "Verdana",
  ];

  // Flat canvas sizes
  const canvasWidth = 1050;
  const canvasHeight = 600;

  // Adjusted flat width so both stacked editors fit cleanly on desktop screen height
  const editorWidth = 450;
  const editorScale = editorWidth / canvasWidth;

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [frontTexture, setFrontTexture] = useState<THREE.CanvasTexture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.CanvasTexture | null>(null);

  // Redraw Canvas on variables/state modification
  useEffect(() => {
    const drawSide = (
      canvas: HTMLCanvasElement | null,
      side: "front" | "back",
      bgColor: string,
      setTexture: React.Dispatch<React.SetStateAction<THREE.CanvasTexture | null>>
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear Canvas to allow rounded corner transparencies
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Clip Rounded Corners if active
      ctx.save();
      ctx.beginPath();
      if (roundedCorners) {
        ctx.roundRect(0, 0, canvasWidth, canvasHeight, 46);
      } else {
        ctx.rect(0, 0, canvasWidth, canvasHeight);
      }
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.clip(); // Keeps overlays restricted within the rounded shape

      // Procedural paper pattern overlays
      if (paperPattern === "linen") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1.0;
        for (let i = 0; i < canvasHeight; i += 6) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvasWidth, i);
          ctx.stroke();
        }
        for (let i = 0; i < canvasWidth; i += 6) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvasHeight);
          ctx.stroke();
        }
      } else if (paperPattern === "grid") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        for (let x = 15; x < canvasWidth; x += 30) {
          for (let y = 15; y < canvasHeight; y += 30) {
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (paperPattern === "stripe") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1.5;
        for (let i = -canvasHeight; i < canvasWidth; i += 24) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + canvasHeight, canvasHeight);
          ctx.stroke();
        }
      } else if (paperPattern === "kraft") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
        for (let i = 0; i < 240; i++) {
          const rx = Math.random() * canvasWidth;
          const ry = Math.random() * canvasHeight;
          const rsize = 1 + Math.random() * 2;
          ctx.fillRect(rx, ry, rsize, rsize);
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        for (let i = 0; i < 150; i++) {
          const rx = Math.random() * canvasWidth;
          const ry = Math.random() * canvasHeight;
          const rsize = 1 + Math.random() * 1.5;
          ctx.fillRect(rx, ry, rsize, rsize);
        }
      } else if (paperPattern === "marble") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvasWidth, 0);
          ctx.bezierCurveTo(
            Math.random() * canvasWidth, Math.random() * canvasHeight,
            Math.random() * canvasWidth, Math.random() * canvasHeight,
            Math.random() * canvasWidth, canvasHeight
          );
          ctx.stroke();
        }
      }

      // Draw all layers on this card face in order
      const sideText = textLayers.filter((t) => t.side === side);
      const sideLogo = logoLayers.filter((l) => l.side === side);

      const allSideLayers = [
        ...sideText.map((l) => ({ ...l, layerType: "text" as const })),
        ...sideLogo.map((l) => ({ ...l, layerType: "logo" as const })),
      ];

      allSideLayers.sort((a, b) => {
        const idxA = layersOrder.indexOf(a.id);
        const idxB = layersOrder.indexOf(b.id);
        return idxA - idxB;
      });

      allSideLayers.forEach((layer) => {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);

        if (layer.layerType === "text") {
          ctx.font = `${layer.outlineEnabled ? "bold " : ""}${layer.textSize}px ${layer.font}`;
          ctx.textBaseline = "middle";

          // Shadow settings
          if (layer.shadowEnabled) {
            ctx.shadowColor = layer.shadowColor;
            ctx.shadowBlur = layer.shadowBlur;
            ctx.shadowOffsetX = layer.shadowOffsetX;
            ctx.shadowOffsetY = layer.shadowOffsetY;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          const text = layer.text;
          const letterSpacing = layer.letterSpacing || 0;
          const lineSpacing = layer.lineSpacing || 1.15;
          const curveRadius = layer.curveRadius || 0;

          const lines = text.split("\n");
          const lineSpacingHeight = layer.textSize * lineSpacing;
          const totalHeight = (lines.length - 1) * lineSpacingHeight;
          const verticalOffset = -totalHeight / 2;

          lines.forEach((line, lineIndex) => {
            const curY = verticalOffset + lineIndex * lineSpacingHeight;

            const chars = Array.from(line);
            const charWidths = chars.map((c) => ctx.measureText(c).width);
            const totalWidth =
              charWidths.reduce((a, b) => a + b, 0) +
              (chars.length - 1) * letterSpacing;

            if (!curveRadius || curveRadius === 0) {
              if (!letterSpacing || letterSpacing === 0) {
                ctx.textAlign = "center";
                if (layer.outlineEnabled) {
                  ctx.strokeStyle = layer.outlineColor;
                  ctx.lineWidth = layer.outlineWidth;
                  ctx.strokeText(line, 0, curY);
                }
                ctx.fillStyle = layer.color;
                ctx.fillText(line, 0, curY);
              } else {
                let curX = -totalWidth / 2;
                ctx.textAlign = "left";
                chars.forEach((char, charIdx) => {
                  const charW = charWidths[charIdx];
                  if (layer.outlineEnabled) {
                    ctx.strokeStyle = layer.outlineColor;
                    ctx.lineWidth = layer.outlineWidth;
                    ctx.strokeText(char, curX, curY);
                  }
                  ctx.fillStyle = layer.color;
                  ctx.fillText(char, curX, curY);
                  curX += charW + letterSpacing;
                });
              }
            } else {
              // Curved text
              const totalAngle = (curveRadius * Math.PI) / 180;
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
                  ctx.strokeStyle = layer.outlineColor;
                  ctx.lineWidth = layer.outlineWidth;
                  ctx.strokeText(char, 0, 0);
                }
                ctx.fillStyle = layer.color;
                ctx.fillText(char, 0, 0);
                ctx.restore();

                currentS += charW + letterSpacing;
              });
            }
          });
        } else {
          // Preset Vector SVGs
          if (layer.isPresetSvg && layer.svgPath) {
            ctx.fillStyle = layer.svgColor || "#FFFFFF";
            const path2D = new Path2D(layer.svgPath);
            ctx.translate(-24, -24);
            ctx.fill(path2D);
          } else if (layer.src) {
            // Uploaded Image
            const imgElement = document.getElementById(
              `img-preload-${layer.id}`
            ) as HTMLImageElement;
            if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
              ctx.drawImage(
                imgElement,
                -layer.width / 2,
                -layer.height / 2,
                layer.width,
                layer.height
              );
            }
          }
        }
        ctx.restore();
      });

      ctx.restore(); // restore raw context clipping

      // Update texture
      setTexture((prev) => {
        if (!prev) {
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          return tex;
        } else {
          prev.needsUpdate = true;
          return prev;
        }
      });
    };

    drawSide(frontCanvasRef.current, "front", frontBgColor, setFrontTexture);
    drawSide(backCanvasRef.current, "back", backBgColor, setBackTexture);
  }, [textLayers, logoLayers, frontBgColor, backBgColor, paperPattern, roundedCorners, layersOrder]);

  // --- HANDLERS ---
  const handleAddText = () => {
    const id = `text-${Date.now()}`;
    const newText: TextLayer = {
      id,
      side: activeSide,
      text: "YOUR TEXT HERE",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      scale: 0.8,
      rotation: 0,
      font: "Montserrat",
      color: activeSide === "front" ? (frontBgColor === "#FFFFFF" ? "#1A1A1E" : "#FFFFFF") : (backBgColor === "#FFFFFF" ? "#1A1A1E" : "#FFFFFF"),
      textSize: 32,
      letterSpacing: 2,
      lineSpacing: 1.2,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 5,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      outlineEnabled: false,
      outlineColor: "#000000",
      outlineWidth: 2,
      curveRadius: 0,
    };
    setTextLayers((prev) => [...prev, newText]);
    setSelectedLayerId(id);
    toast.success("Text layer added to " + activeSide);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const id = `logo-${Date.now()}`;

      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxDim = 150;
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
          side: activeSide,
          src,
          x: canvasWidth / 2,
          y: canvasHeight / 2,
          scale: 0.8,
          rotation: 0,
          width: w,
          height: h,
        };

        setLogoLayers((prev) => [...prev, newLogo]);
        setSelectedLayerId(id);
        toast.success("Logo uploaded!");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddPresetLogo = (preset: typeof PRESET_ICONS[0]) => {
    const id = `logo-preset-${Date.now()}`;
    const newLogo: LogoLayer = {
      id,
      side: activeSide,
      src: "",
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      scale: 1.2,
      rotation: 0,
      width: 48,
      height: 48,
      isPresetSvg: true,
      svgPath: preset.path,
      svgColor: activeSide === "front" ? (frontBgColor === "#FFFFFF" ? "#1A1A1E" : "#D4AF37") : (backBgColor === "#FFFFFF" ? "#1A1A1E" : "#D4AF37"),
    };

    setLogoLayers((prev) => [...prev, newLogo]);
    setSelectedLayerId(id);
    toast.success(`Preset '${preset.name}' added to ${activeSide}`);
  };

  const handleDeleteLayer = (id: string) => {
    setTextLayers((prev) => prev.filter((t) => t.id !== id));
    setLogoLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
    toast.info("Layer removed");
  };

  const handleCopy = (id: string) => {
    const isText = textLayers.some((t) => t.id === id);
    if (isText) {
      const layer = textLayers.find((t) => t.id === id);
      if (!layer) return;
      const newId = `text-copy-${Date.now()}`;
      const newLayer: TextLayer = {
        ...layer,
        id: newId,
        x: Math.min(canvasWidth - 50, layer.x + 30),
        y: Math.min(canvasHeight - 50, layer.y + 30),
      };
      setTextLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newId);
      toast.success("Text layer duplicated");
    } else {
      const layer = logoLayers.find((l) => l.id === id);
      if (!layer) return;
      const newId = `logo-copy-${Date.now()}`;
      const newLayer: LogoLayer = {
        ...layer,
        id: newId,
        x: Math.min(canvasWidth - 50, layer.x + 30),
        y: Math.min(canvasHeight - 50, layer.y + 30),
      };
      setLogoLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newId);
      toast.success("Graphic layer duplicated");
    }
  };

  const handleReset = () => {
    if (confirm("Reset card customizations to defaults?")) {
      setFrontBgColor("#111115");
      setBackBgColor("#111115");
      setEdgeColor("#D4AF37");
      setPaperPattern("plain");
      setRoundedCorners(false);
      setMaterialType("matte");
      setTextLayers([]);
      setLogoLayers([]);
      setSelectedLayerId(null);
      toast.success("Card customizations reset.");
    }
  };

  // --- INTERACTIONS ---
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
            t.id === id ? { ...t, x: startX + deltaX, y: startY + deltaY } : t
          )
        );
      } else {
        setLogoLayers((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, x: startX + deltaX, y: startY + deltaY } : l
          )
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

    const boundsElement = (e.currentTarget as HTMLElement).closest(".editor-bounds");
    if (!boundsElement) return;
    const rect = boundsElement.getBoundingClientRect();
    const layerScreenX = rect.left + layer.x * editorScale;
    const layerScreenY = rect.top + layer.y * editorScale;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(
      startMouseY - layerScreenY,
      startMouseX - layerScreenX
    );
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - layerScreenY,
        moveEvent.clientX - layerScreenX
      );
      const angleDiff = ((currentAngle - startAngle) * 180) / Math.PI;
      const newRotation = (startRotation + angleDiff) % 360;

      if (isText) {
        setTextLayers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, rotation: newRotation } : t))
        );
      } else {
        setLogoLayers((prev) =>
          prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l))
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
      const newScale = Math.max(0.1, startScale + deltaX * 0.01);

      if (isText) {
        setTextLayers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, scale: newScale } : t))
        );
      } else {
        setLogoLayers((prev) =>
          prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l))
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
  const downloadFlatMap = (side: "front" | "back") => {
    const canvas = side === "front" ? frontCanvasRef.current : backCanvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `business-card-${side}-print.png`;
    link.href = dataURL;
    link.click();
    toast.success(`Downloaded ${side} flat print map.`);
  };

  const download3DPreview = () => {
    if (!globalGl) {
      toast.error("3D screenshot context not ready. Click card preview to initialize.");
      return;
    }
    const dataURL = globalGl.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "business-card-3d-mockup.png";
    link.href = dataURL;
    link.click();
    toast.success("Downloaded 3D card mockup rendering.");
  };

  const selectedTextLayer = useMemo(() => {
    if (!selectedLayerId) return null;
    return textLayers.find((t) => t.id === selectedLayerId) || null;
  }, [textLayers, selectedLayerId]);

  const selectedLogoLayer = useMemo(() => {
    if (!selectedLayerId) return null;
    return logoLayers.find((l) => l.id === selectedLayerId) || null;
  }, [logoLayers, selectedLayerId]);

  // Front Side Layers filter helper
  const frontSideLayers = useMemo(() => {
    const texts = textLayers.filter((l) => l.side === "front").map((l) => ({ ...l, layerType: "text" as const }));
    const logos = logoLayers.filter((l) => l.side === "front").map((l) => ({ ...l, layerType: "logo" as const }));
    return [...texts, ...logos].sort((a, b) => {
      const idxA = layersOrder.indexOf(a.id);
      const idxB = layersOrder.indexOf(b.id);
      return idxA - idxB;
    });
  }, [textLayers, logoLayers, layersOrder]);

  // Back Side Layers filter helper
  const backSideLayers = useMemo(() => {
    const texts = textLayers.filter((l) => l.side === "back").map((l) => ({ ...l, layerType: "text" as const }));
    const logos = logoLayers.filter((l) => l.side === "back").map((l) => ({ ...l, layerType: "logo" as const }));
    return [...texts, ...logos].sort((a, b) => {
      const idxA = layersOrder.indexOf(a.id);
      const idxB = layersOrder.indexOf(b.id);
      return idxA - idxB;
    });
  }, [textLayers, logoLayers, layersOrder]);

  const renderTextLayer = (layer: TextLayer, isHidden = false, children?: React.ReactNode) => {
    const letterSpacing = layer.letterSpacing || 0;
    const lineSpacing = layer.lineSpacing || 1.15;
    const curveVal = layer.curveRadius || 0;
    const fontSize = layer.textSize * layer.scale * editorScale;

    const baseStyle: React.CSSProperties = {
      position: "relative",
      padding: "6px 10px",
      fontFamily: layer.font,
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
            WebkitTextStroke: layer.outlineEnabled
              ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#000000"}`
              : "none",
            color: layer.color,
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

    // Curved text rendering
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
      return (
        charWidths.reduce((a, b) => a + b, 0) +
        (chars.length - 1) * letterSpacing * editorScale
      );
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
                      fontFamily: layer.font,
                      whiteSpace: "nowrap",
                      WebkitTextStroke: layer.outlineEnabled
                        ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#000000"}`
                        : "none",
                      color: layer.color,
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

  return (
    <div className="flex h-screen w-full bg-white flex-col lg:flex-row text-zinc-800 overflow-hidden" data-lenis-prevent>
      <Toaster position="top-right" theme="light" closeButton />

      {/* Hidden offscreen canvases */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0">
        <canvas ref={frontCanvasRef} width={canvasWidth} height={canvasHeight} />
        <canvas ref={backCanvasRef} width={canvasWidth} height={canvasHeight} />
        {logoLayers.map((l) =>
          l.src ? (
            <img
              key={l.id}
              id={`img-preload-${l.id}`}
              src={l.src}
              alt="preload"
              onLoad={() => {
                // refresh drawing
                setTextLayers((prev) => [...prev]);
              }}
            />
          ) : null
        )}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
        <Link href="/" className="text-zinc-650">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="font-extrabold text-sm uppercase tracking-wider text-[#00263C] font-mono">
          Card Customizer
        </div>
      </div>

      {/* ── LEFT CONTAINER: SIDEBAR + PANEL + PERSISTENT FRONT/BACK DUAL WORKSPACES ── */}
      <div className="w-full lg:w-[55%] xl:w-[51%] flex flex-row bg-white border-r border-zinc-200 h-1/2 lg:h-full z-10 overflow-hidden">

        {/* ── VERTICAL NAVIGATION SIDEBAR ── */}
        <div className="hidden md:flex w-20 flex-col items-center bg-white border-r border-zinc-200 py-6 gap-4 z-20 overflow-y-auto">
          {/* Brand Logo Link */}
          <Link href="/" className="mb-4">
            <img
              src={LogoImg.src}
              alt="Logo"
              width={60}
              height={40}
              className="cursor-pointer object-contain"
            />
          </Link>

          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer gap-1 transition-all duration-300 w-16 ${isActive ? "text-[#00263C]" : "text-zinc-400 hover:text-[#00263C]"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#00263C]/5 border-l-2 border-[#00263C] rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <TabIcon
                  className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                />
                <span
                  className={`text-[9px] tracking-wide text-center transition-all duration-300 ${isActive
                    ? "font-extrabold"
                    : "font-medium text-zinc-500 group-hover:text-[#00263C]"
                    }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── SETTINGS SIDE PANEL ── */}
        <div className="w-72 bg-white border-r border-zinc-200 flex flex-col h-full z-10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200 bg-zinc-50/60 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#00263C] capitalize tracking-wide">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-[#00263C]/70 mt-0.5">Customize your card</p>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="Reset customizations"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
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
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                      Preset Card Templates
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {CARD_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setFrontBgColor(preset.frontBg);
                            setBackBgColor(preset.backBg);
                            setEdgeColor(preset.edge);
                            setPaperPattern(preset.pattern);
                            setRoundedCorners(preset.rounded);
                            setMaterialType(preset.finish);
                            toast.info(`Applied template: ${preset.name}`);
                          }}
                          className="p-3 bg-zinc-55 hover:bg-zinc-100/50 border border-zinc-200 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5 border border-zinc-250 p-1 rounded bg-white">
                              <div className="w-8 h-4 rounded-sm border" style={{ backgroundColor: preset.frontBg }} />
                              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: preset.edge }} />
                            </div>
                            <span className="text-xs font-bold text-[#00263C]">{preset.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* COLORS TAB */}
                {activeTab === "colors" && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Card Background Color
                      </label>

                      {/* Color Side Segmented Selector */}
                      <div className="flex gap-1.5 p-1 bg-zinc-100 rounded border mb-4">
                        {[
                          { id: "Both", label: "Both" },
                          { id: "Front", label: "Front" },
                          { id: "Back", label: "Back" },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setActiveColorSide(option.id as any)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer transition-all text-center ${activeColorSide === option.id
                              ? "bg-white text-[#00263C] shadow-sm font-extrabold"
                              : "text-zinc-500 hover:text-zinc-800"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {/* Preset Swatches Grid */}
                      <div className="flex gap-2 flex-wrap mb-4">
                        {[
                          "#111115",
                          "#2196F3",
                          "#FFFFFF",
                          "#E63946",
                          "#F9F6F0",
                          "#3E3E42",
                          "#2A9D8F",
                          "#F4A261",
                          "#726DE8",
                          "#FF6B6B",
                          "#80C670",
                          "#EFBD4E",
                        ].map((c) => {
                          const activeVal =
                            activeColorSide === "Front"
                              ? frontBgColor
                              : activeColorSide === "Back"
                                ? backBgColor
                                : frontBgColor; // show front if both

                          return (
                            <button
                              key={c}
                              onClick={() => {
                                if (activeColorSide === "Both") {
                                  setFrontBgColor(c);
                                  setBackBgColor(c);
                                } else if (activeColorSide === "Front") {
                                  setFrontBgColor(c);
                                } else {
                                  setBackBgColor(c);
                                }
                              }}
                              className={`w-9 h-9 rounded-full border transition-transform ${activeVal === c
                                ? "border-zinc-850 scale-110 ring-2 ring-offset-1 ring-zinc-350"
                                : "border-black/10 hover:scale-105"
                                }`}
                              style={{ backgroundColor: c }}
                            />
                          );
                        })}
                      </div>

                      {/* Manual hex and picker */}
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={
                            activeColorSide === "Back"
                              ? backBgColor
                              : frontBgColor
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (activeColorSide === "Both") {
                              setFrontBgColor(val);
                              setBackBgColor(val);
                            } else if (activeColorSide === "Front") {
                              setFrontBgColor(val);
                            } else {
                              setBackBgColor(val);
                            }
                          }}
                          className="w-9 h-9 rounded cursor-pointer border border-zinc-200 p-0"
                        />
                        <span className="text-xs text-zinc-555 font-mono font-bold">
                          {(activeColorSide === "Back" ? backBgColor : frontBgColor).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PATTERNS TAB */}
                {activeTab === "patterns" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                      Card Paper Textures
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "plain", label: "Plain Smooth" },
                        { id: "linen", label: "Linen Paper" },
                        { id: "marble", label: "Soft Marble" },
                        { id: "grid", label: "Technical Grid" },
                        { id: "kraft", label: "Kraft Cardstock" },
                        { id: "stripe", label: "Fine Stripe" },
                      ].map((p) => {
                        const isSelected = paperPattern === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setPaperPattern(p.id as any)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${isSelected
                              ? "border-[#00263C] bg-[#00263C]/5"
                              : "border-zinc-200 hover:border-zinc-300 bg-white"
                              }`}
                          >
                            <span className={`text-xs font-bold ${isSelected ? "text-[#00263C]" : "text-zinc-600"}`}>
                              {p.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TEXT TAB */}
                {activeTab === "text" && (
                  <div className="space-y-4">
                    <button
                      onClick={handleAddText}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#00263C] hover:bg-[#003856] text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Text Layer
                    </button>

                    {selectedTextLayer ? (
                      <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                          <span className="text-[10px] font-bold text-[#00263C] uppercase tracking-wider">
                            Edit Text Layer ({selectedTextLayer.side})
                          </span>
                          <button
                            onClick={() => handleDeleteLayer(selectedTextLayer.id)}
                            className="p-1 hover:text-red-500 rounded transition-colors text-zinc-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Text value */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800 block">Text String</label>
                          <textarea
                            value={selectedTextLayer.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextLayers((prev) =>
                                prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, text: val } : t))
                              );
                            }}
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-400 text-zinc-800"
                          />
                        </div>

                        {/* Font */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800 block">Font Face</label>
                          <select
                            value={selectedTextLayer.font}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextLayers((prev) =>
                                prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, font: val } : t))
                              );
                            }}
                            className="w-full px-2 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold"
                          >
                            {FONTS_LIST.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">Color</label>
                          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2 py-1 shadow-sm w-full">
                            <input
                              type="color"
                              value={selectedTextLayer.color}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTextLayers((prev) =>
                                  prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, color: val } : t))
                                );
                              }}
                              className="w-8 h-8 cursor-pointer shrink-0 border border-zinc-200 rounded"
                            />
                            <span className="text-xs font-mono font-bold text-zinc-700">
                              {selectedTextLayer.color.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Base Font Size Slider */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">Base Font Size</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="8"
                              max="120"
                              value={selectedTextLayer.textSize}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, textSize: val } : t))
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {selectedTextLayer.textSize}
                            </div>
                          </div>
                        </div>

                        {/* Letter Spacing Slider */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">Letter spacing</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={selectedTextLayer.letterSpacing || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, letterSpacing: val } : t))
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {selectedTextLayer.letterSpacing || 0}
                            </div>
                          </div>
                        </div>

                        {/* Line Spacing Slider */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">Line spacing</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0.5"
                              max="3.0"
                              step="0.05"
                              value={selectedTextLayer.lineSpacing || 1.15}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, lineSpacing: val } : t))
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {(selectedTextLayer.lineSpacing || 1.15).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Text Curve Slider */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-800 block">Text Curve</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="-120"
                              max="120"
                              value={selectedTextLayer.curveRadius || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setTextLayers((prev) =>
                                  prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, curveRadius: val } : t))
                                );
                              }}
                              className="flex-1 accent-red-600 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                              {selectedTextLayer.curveRadius || 0}°
                            </div>
                          </div>
                        </div>

                        {/* Outline Enable & Sub-Controls */}
                        <div className="space-y-3 pt-3 border-t border-zinc-150">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-800">Enable Text Outline</label>
                            <input
                              type="checkbox"
                              checked={!!selectedTextLayer.outlineEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTextLayers((prev) =>
                                  prev.map((t) =>
                                    t.id === selectedTextLayer.id
                                      ? {
                                        ...t,
                                        outlineEnabled: checked,
                                        outlineColor: t.outlineColor || "#FFFFFF",
                                        outlineWidth: typeof t.outlineWidth === "number" ? t.outlineWidth : 4,
                                      }
                                      : t
                                  )
                                );
                              }}
                              className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500 cursor-pointer"
                            />
                          </div>

                          {selectedTextLayer.outlineEnabled && (
                            <div className="space-y-3 pl-2 border-l-2 border-red-100">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-zinc-600">Outline Color</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={selectedTextLayer.outlineColor || "#FFFFFF"}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTextLayers((prev) =>
                                        prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, outlineColor: val } : t))
                                      );
                                    }}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                  />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                    {selectedTextLayer.outlineColor || "#FFFFFF"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-650">
                                  <span>Outline Width</span>
                                  <span>{selectedTextLayer.outlineWidth ?? 4}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="20"
                                  value={selectedTextLayer.outlineWidth ?? 4}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, outlineWidth: val } : t))
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Shadow Enable & Sub-Controls */}
                        <div className="space-y-3 pt-3 border-t border-zinc-150">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-800">Enable Text Shadow</label>
                            <input
                              type="checkbox"
                              checked={!!selectedTextLayer.shadowEnabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTextLayers((prev) =>
                                  prev.map((t) =>
                                    t.id === selectedTextLayer.id
                                      ? {
                                        ...t,
                                        shadowEnabled: checked,
                                        shadowColor: t.shadowColor || "#000000",
                                        shadowBlur: typeof t.shadowBlur === "number" ? t.shadowBlur : 10,
                                        shadowOffsetX: typeof t.shadowOffsetX === "number" ? t.shadowOffsetX : 4,
                                        shadowOffsetY: typeof t.shadowOffsetY === "number" ? t.shadowOffsetY : 4,
                                      }
                                      : t
                                  )
                                );
                              }}
                              className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500 cursor-pointer"
                            />
                          </div>

                          {selectedTextLayer.shadowEnabled && (
                            <div className="space-y-3 pl-2 border-l-2 border-red-100">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-zinc-650">Shadow Color</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={selectedTextLayer.shadowColor || "#000000"}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTextLayers((prev) =>
                                        prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, shadowColor: val } : t))
                                      );
                                    }}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                  />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                    {selectedTextLayer.shadowColor || "#000000"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-650">
                                  <span>Shadow Blur</span>
                                  <span>{selectedTextLayer.shadowBlur ?? 10}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="30"
                                  value={selectedTextLayer.shadowBlur ?? 10}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, shadowBlur: val } : t))
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-650">
                                  <span>Offset X</span>
                                  <span>{selectedTextLayer.shadowOffsetX ?? 4}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="-20"
                                  max="20"
                                  value={selectedTextLayer.shadowOffsetX ?? 4}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, shadowOffsetX: val } : t))
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-zinc-650">
                                  <span>Offset Y</span>
                                  <span>{selectedTextLayer.shadowOffsetY ?? 4}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="-20"
                                  max="20"
                                  value={selectedTextLayer.shadowOffsetY ?? 4}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTextLayers((prev) =>
                                      prev.map((t) => (t.id === selectedTextLayer.id ? { ...t, shadowOffsetY: val } : t))
                                    );
                                  }}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-zinc-450 text-xs bg-zinc-50 border border-zinc-150 border-dashed rounded-xl">
                        Select a text layer in flat workspace to edit
                      </div>
                    )}
                  </div>
                )}

                {/* UPLOADS TAB */}
                {activeTab === "logos" && (
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        Upload Logo Asset
                      </span>
                      <label className="flex flex-col items-center justify-center border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/40 rounded-xl p-5 text-center cursor-pointer transition-colors duration-200">
                        <Upload className="w-5 h-5 text-zinc-500 mb-1.5" />
                        <span className="text-xs font-bold text-zinc-700">Choose PNG, SVG or JPG</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* SVG Preset Icons */}
                    <div className="space-y-2 border-t border-zinc-150 pt-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                        Studio Vectors
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_ICONS.map((preset) => {
                          const IconComponent = preset.icon;
                          return (
                            <button
                              key={preset.name}
                              onClick={() => handleAddPresetLogo(preset)}
                              className="p-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer flex flex-col items-center gap-1 transition-all hover:scale-105"
                            >
                              <IconComponent className="w-4 h-4 text-[#00263C]" />
                              <span className="text-[9px] font-bold text-zinc-450 tracking-wide">{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected logo edit */}
                    {selectedLogoLayer && (
                      <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 mt-2">
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-1.5">
                          <span className="text-[10px] font-bold text-[#00263C] uppercase tracking-wider">
                            Edit Graphic ({selectedLogoLayer.side})
                          </span>
                          <button
                            onClick={() => handleDeleteLayer(selectedLogoLayer.id)}
                            className="p-1 hover:text-red-500 text-zinc-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {selectedLogoLayer.isPresetSvg && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-650">Color</span>
                            <input
                              type="color"
                              value={selectedLogoLayer.svgColor || "#FFFFFF"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLogoLayers((prev) =>
                                  prev.map((l) => (l.id === selectedLogoLayer.id ? { ...l, svgColor: val } : l))
                                );
                              }}
                              className="w-10 h-7 rounded border border-zinc-250 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* LAYERS TAB */}
                {activeTab === "layers" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                      Manage Layers Order
                    </span>

                    {/* Side Switcher Tab buttons inside Layers tab */}
                    <div className="flex gap-1.5 p-1 bg-zinc-100 rounded border mb-4">
                      {[
                        { id: "front", label: "Front Side" },
                        { id: "back", label: "Back Side" },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setActiveSide(option.id as any);
                          }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer transition-all text-center ${activeSide === option.id
                            ? "bg-white text-[#00263C] shadow-sm font-extrabold"
                            : "text-zinc-500 hover:text-zinc-800"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto pr-1">
                        {currentSideLayers.length === 0 ? (
                          <div className="text-xs text-zinc-400 italic text-center py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                            No layers on this side. Add some text or graphics!
                          </div>
                        ) : (
                          currentSideLayers.map((layer, index) => {
                            const isText = layer.layerType === "text";
                            const isSelected = selectedLayerId === layer.id;
                            const displayName = isText
                              ? `Text ("${layer.text}")`
                              : layer.isPresetSvg
                                ? `Vector (${layer.id.split("-")[0]})`
                                : `Logo Image`;

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
                                  setSelectedLayerId(layer.id);
                                }}
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${isSelected
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

                                  {/* Icon preview type */}
                                  <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                                    {isText ? (
                                      <span className="text-xs font-bold text-zinc-500">T</span>
                                    ) : layer.isPresetSvg ? (
                                      <span className="text-xs font-bold text-amber-500">★</span>
                                    ) : (
                                      <img
                                        src={layer.src}
                                        alt="badge"
                                        className="w-full h-full object-contain"
                                      />
                                    )}
                                  </div>

                                  {/* Layer Label */}
                                  <div className="text-xs text-zinc-700 truncate max-w-[130px]">
                                    {displayName}
                                  </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(layer.id);
                                    }}
                                    title="Duplicate Layer"
                                    className="p-1 text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteLayer(layer.id);
                                    }}
                                    title="Delete Layer"
                                    className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
                  </div>
                )}

                {/* STYLE TAB */}
                {activeTab === "style" && (
                  <div className="space-y-4">
                    {/* Card Edge Color */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        Painted Card Foil Edge
                      </span>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {["#D4AF37", "#C0C0C0", "#E5A93C", "#111115", "#E63946", "#00FFCC"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setEdgeColor(c)}
                            className={`w-8 h-8 rounded-full border transition-transform ${edgeColor === c
                              ? "border-zinc-850 scale-110 ring-2 ring-offset-1 ring-zinc-350"
                              : "border-black/10 hover:scale-105"
                              }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={edgeColor}
                          onChange={(e) => setEdgeColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
                        />
                        <span className="text-xs text-zinc-555 font-mono font-bold">{edgeColor.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Rounded corners */}
                    <div className="pt-3 border-t border-zinc-150 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-800 block">Die-Cut Rounded Corners</span>
                        <span className="text-[10px] text-zinc-500">Smooth 1/8" radius card shape</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={roundedCorners}
                        onChange={(e) => setRoundedCorners(e.target.checked)}
                        className="w-4.5 h-4.5 accent-[#00263C] cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* FABRIC TAB */}
                {activeTab === "fabric" && (
                  <div className="space-y-4">
                    {/* Card Stock GSM */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        Paper Thickness (Weight)
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { weight: "300 GSM", desc: "Standard heavy cardstock" },
                          { weight: "450 GSM", desc: "Premium extra-thick cardstock" },
                          { weight: "600 GSM Duplex", desc: "Ultra-heavy double layer cardstock (+$15)" },
                        ].map((w) => (
                          <button
                            key={w.weight}
                            onClick={() => setCardWeight(w.weight)}
                            className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${cardWeight === w.weight
                              ? "border-[#00263C] bg-[#00263C]/5 font-extrabold"
                              : "border-zinc-200 hover:border-zinc-300 bg-white"
                              }`}
                          >
                            <span className="text-xs font-bold text-[#00263C]">{w.weight}</span>
                            <span className="text-[9px] text-zinc-550 font-semibold mt-0.5">{w.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Finish */}
                    <div className="space-y-2 border-t border-zinc-150 pt-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        Finish Type
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["matte", "glossy", "metallic", "velvet"] as const).map((finish) => (
                          <button
                            key={finish}
                            onClick={() => setMaterialType(finish)}
                            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer text-center ${materialType === finish
                              ? "bg-[#00263C] text-white border-[#00263C]"
                              : "bg-white text-zinc-500 border-zinc-200 hover:text-zinc-700"
                              }`}
                          >
                            {finish}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Panel Footer: Export Actions */}
          <div className="p-4 border-t border-zinc-200 space-y-2 bg-zinc-50">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadFlatMap("front")}
                className="flex items-center justify-center gap-1 py-2 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-300 text-zinc-700 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer border border-zinc-250"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" /> Front Map
              </button>
              <button
                onClick={() => downloadFlatMap("back")}
                className="flex items-center justify-center gap-1 py-2 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-300 text-zinc-700 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer border border-zinc-250"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" /> Back Map
              </button>
            </div>
            <button
              onClick={download3DPreview}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00263C] hover:bg-[#003856] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider cursor-pointer shadow transition-all active:scale-[0.98]"
            >
              <CameraIcon className="w-4 h-4 text-white" /> Download 3D Render
            </button>
          </div>
        </div>

        {/* ── PERSISTENT 2D FLAT WORKSPACE EDITORS (Column 3 - Stacked Frontside & Backside) ── */}
        <div className="hidden md:flex flex-1 bg-zinc-50/50 flex-col items-center justify-around p-3 min-w-[340px] overflow-y-auto select-none border-r border-zinc-200">

          {/* FRONTSIDE EDITOR BLOCK */}
          <div
            onClick={() => setActiveSide("front")}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all w-full max-w-[500px] border ${activeSide === "front" ? "bg-white shadow border-zinc-200" : "border-transparent"
              }`}
          >
            <div className="flex items-center justify-between w-full mb-2.5 px-2">
              <span className="text-sm font-medium text-[#00263C] tracking-widest">
                Frontside Workspace
              </span>
              <span className="text-xs text-[#00263C] px-1.5 py-0.5 bg-[#00263C]/5 border border-[#00263C]/10 rounded">
                Front Map
              </span>
            </div>

            {/* Interactive workspace frame */}
            <div
              className="editor-bounds relative border border-zinc-200/80 overflow-hidden rounded cursor-default shadow-inner"
              style={{
                width: editorWidth,
                height: Math.round(editorWidth * (canvasHeight / canvasWidth)),
                backgroundColor: frontBgColor,
              }}
              onMouseDown={() => {
                setActiveSide("front");
              }}
            >
              {/* Safe boundaries */}
              <div className="absolute inset-2 border border-dashed border-[#00263C]/15 pointer-events-none rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-zinc-400/20 uppercase tracking-widest pointer-events-none select-none">
                  Safety Border
                </span>
              </div>

              {/* Render interactive layers */}
              {frontSideLayers.map((layer) => {
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
                    <div
                      className={`relative p-1.5 select-none whitespace-nowrap transition-all rounded ${isSelected
                        ? "border border-red-500 border-dashed bg-red-500/5 shadow-lg"
                        : "border border-transparent"
                        }`}
                    >
                      {isText ? (
                        renderTextLayer(layer)
                      ) : layer.isPresetSvg && layer.svgPath ? (
                        <svg
                          viewBox="0 0 48 48"
                          style={{
                            width: layer.width * layer.scale * editorScale,
                            height: layer.height * layer.scale * editorScale,
                            fill: layer.svgColor || "#FFFFFF",
                          }}
                        >
                          <path d={layer.svgPath} />
                        </svg>
                      ) : (
                        <img
                          src={layer.src}
                          alt="logo"
                          style={{
                            width: layer.width * layer.scale * editorScale,
                            height: layer.height * layer.scale * editorScale,
                            objectFit: "contain",
                          }}
                          draggable={false}
                        />
                      )}

                      {/* Transform handles */}
                      {isSelected && (
                        <>
                          {/* Top-Left: Duplicate */}
                          <button
                            className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-50 pointer-events-auto"
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
                            className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-alias active:scale-90 transition-transform z-50 pointer-events-auto"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleRotateStart(e, layer.id);
                            }}
                            title="Rotate"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-zinc-650"
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
                            className="absolute -bottom-3.5 -left-3.5 w-6 h-6 bg-red-500 hover:bg-red-600 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-50 pointer-events-auto"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteLayer(layer.id);
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
                            className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-blue-500 hover:bg-blue-655 shadow-md rounded-full flex items-center justify-center cursor-se-resize active:scale-90 transition-transform z-50 pointer-events-auto"
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BACKSIDE EDITOR BLOCK */}
          <div
            onClick={() => setActiveSide("back")}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all w-full max-w-[500px] border ${activeSide === "back" ? "bg-white shadow border-zinc-200" : "border-transparent"
              }`}
          >
            <div className="flex items-center justify-between w-full mb-2.5 px-2">
              <span className="text-sm font-medium text-[#00263C] tracking-widest">
                Backside Workspace
              </span>
              <span className="text-[8px] font-bold text-[#00263C] px-1.5 py-0.5 bg-[#00263C]/5 border border-[#00263C]/10 rounded">
                Back Map
              </span>
            </div>

            {/* Interactive workspace frame */}
            <div
              className="editor-bounds relative border border-zinc-200/80 overflow-hidden rounded mx-auto cursor-default shadow-inner"
              style={{
                width: editorWidth,
                height: Math.round(editorWidth * (canvasHeight / canvasWidth)),
                backgroundColor: backBgColor,
              }}
              onMouseDown={() => {
                setActiveSide("back");
              }}
            >
              {/* Safe boundaries */}
              <div className="absolute inset-2 border border-dashed border-[#00263C]/15 pointer-events-none rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-zinc-400/20 uppercase tracking-widest pointer-events-none select-none">
                  Safety Border
                </span>
              </div>

              {/* Render interactive layers */}
              {backSideLayers.map((layer) => {
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
                    <div
                      className={`relative p-1.5 select-none whitespace-nowrap transition-all rounded ${isSelected
                        ? "border border-red-500 border-dashed bg-red-500/5 shadow-lg"
                        : "border border-transparent"
                        }`}
                    >
                      {isText ? (
                        renderTextLayer(layer)
                      ) : layer.isPresetSvg && layer.svgPath ? (
                        <svg
                          viewBox="0 0 48 48"
                          style={{
                            width: layer.width * layer.scale * editorScale,
                            height: layer.height * layer.scale * editorScale,
                            fill: layer.svgColor || "#FFFFFF",
                          }}
                        >
                          <path d={layer.svgPath} />
                        </svg>
                      ) : (
                        <img
                          src={layer.src}
                          alt="logo"
                          style={{
                            width: layer.width * layer.scale * editorScale,
                            height: layer.height * layer.scale * editorScale,
                            objectFit: "contain",
                          }}
                          draggable={false}
                        />
                      )}

                      {/* Transform handles */}
                      {isSelected && (
                        <>
                          {/* Top-Left: Duplicate */}
                          <button
                            className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-50 pointer-events-auto"
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
                            className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-alias active:scale-90 transition-transform z-50 pointer-events-auto"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleRotateStart(e, layer.id);
                            }}
                            title="Rotate"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-zinc-650"
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
                            className="absolute -bottom-3.5 -left-3.5 w-6 h-6 bg-red-500 hover:bg-red-650 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-50 pointer-events-auto"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteLayer(layer.id);
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
                            className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-blue-500 hover:bg-blue-655 shadow-md rounded-full flex items-center justify-center cursor-se-resize active:scale-90 transition-transform z-50 pointer-events-auto"
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-base text-zinc-450 text-center leading-relaxed font-medium">
            Reposition by dragging • Use orange circle to rotate • Use teal circle to scale
          </div>
        </div>

      </div>

      {/* ── RIGHT CONTAINER: 3D MODEL VIEWPORT ── */}
      <div className="flex-1 relative h-1/2 lg:h-full flex flex-col bg-gradient-to-tr from-[#FAFAFC] via-[#EEF0F3] to-[#DFE2E5]">
        {/* Floating Side Select Buttons */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-zinc-200 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => {
              setViewMode("standard");
              setActiveSide("front");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === "standard" && activeSide === "front"
              ? "bg-[#00263C] text-white shadow-sm"
              : "text-zinc-650 hover:text-zinc-800"
              }`}
          >
            Front
          </button>
          <button
            onClick={() => {
              setViewMode("standard");
              setActiveSide("back");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === "standard" && activeSide === "back"
              ? "bg-[#00263C] text-white shadow-sm"
              : "text-zinc-650 hover:text-zinc-800"
              }`}
          >
            Back
          </button>
          <button
            onClick={() => setViewMode("showcase")}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${viewMode === "showcase"
              ? "bg-[#00263C] text-white shadow-sm"
              : "text-zinc-650 hover:text-zinc-800"
              }`}
          >
            Showcase
          </button>
        </div>

        {/* Viewport instruction badge */}
        <div className="absolute top-4 right-4 z-10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-zinc-200">
          Scroll to zoom • Click & Drag to spin
        </div>

        {/* Float template name badge */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-white/80 backdrop-blur-sm text-xs font-bold text-zinc-700 px-3.5 py-1.5 rounded-full shadow border border-zinc-200 capitalize tracking-wide">
            {materialType} Finish • {paperPattern} Pattern
            {roundedCorners ? " • Rounded Corners" : ""}
          </span>
        </div>

        <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
          <Canvas
            camera={{ position: [0, 0.1, 5.2], fov: 38 }}
            className="w-full h-full"
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.9,
              preserveDrawingBuffer: true,
            }}
          >
            <color attach="background" args={["transparent" as any]} />
            <ambientLight intensity={1.2} />
            <Environment preset="city" />
            <directionalLight position={[2, 4, 5]} intensity={1.2} />
            <directionalLight position={[-2, 3, -5]} intensity={0.8} />
            <pointLight position={[-3, 1, 2]} intensity={0.5} />
            <pointLight position={[3, 1, -2]} intensity={0.5} />

            {viewMode === "showcase" ? (
              <group position={[0, 0, 0]}>
                {/* Showcase Background Stage Elements */}
                <ShowcaseStage />

                {/* Top Card (Front view) */}
                <ShowcaseGroup speed={1.1} factor={0.05} offset={0}>
                  <group position={[-0.48, 1.1, 0.28]} rotation={[-0.18, -0.42, -0.24]}>
                    <CardModel
                      frontBgColor={frontBgColor}
                      backBgColor={backBgColor}
                      edgeColor={edgeColor}
                      materialType={materialType}
                      frontTexture={frontTexture}
                      backTexture={backTexture}
                      activeSide="front"
                      roundedCorners={roundedCorners}
                      isStatic={true}
                      staticRotationY={0}
                    />
                  </group>
                </ShowcaseGroup>

                {/* Bottom Card (Back view) */}
                <ShowcaseGroup speed={1.1} factor={0.05} offset={Math.PI}>
                  <group position={[0.48, 0.28, 0.08]} rotation={[0.18, -0.42, 0.24]}>
                    <CardModel
                      frontBgColor={frontBgColor}
                      backBgColor={backBgColor}
                      edgeColor={edgeColor}
                      materialType={materialType}
                      frontTexture={frontTexture}
                      backTexture={backTexture}
                      activeSide="back"
                      roundedCorners={roundedCorners}
                      isStatic={true}
                      staticRotationY={Math.PI}
                    />
                  </group>
                </ShowcaseGroup>
              </group>
            ) : (
              <Center>
                <CardModel
                  frontBgColor={frontBgColor}
                  backBgColor={backBgColor}
                  edgeColor={edgeColor}
                  materialType={materialType}
                  frontTexture={frontTexture}
                  backTexture={backTexture}
                  activeSide={activeSide}
                  roundedCorners={roundedCorners}
                />
              </Center>
            )}

            <ContactShadows
              position={[0, viewMode === "showcase" ? -1.45 : -1.15, 0]}
              opacity={0.3}
              scale={5.5}
              blur={2.5}
            />

            <OrbitControls
              enablePan={false}
              minDistance={1.5}
              maxDistance={12.0}
              target={[0, 0, 0]}
            />
            <SceneCaptureHelper />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
