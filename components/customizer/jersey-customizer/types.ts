import {
  LayoutTemplate,
  Palette,
  Grid,
  Type,
  Image as ImageIcon,
  Scissors,
  Box,
} from "lucide-react";

export interface TextLayer {
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

export interface LogoLayer {
  id: string;
  src: string; // data URL or preset URL
  x: number; // coordinate X on canvas (0-1024)
  y: number; // coordinate Y on canvas (0-1024)
  scale: number; // scale factor
  rotation: number; // rotation in degrees
  side: "Front" | "Back" | "Both";
  baseSize: number; // base size (default 200px)
  opacity?: number; // opacity between 0.0 and 1.0 (default 1.0)
  eraserPaths?: Array<{
    points: Array<{ x: number; y: number }>;
    size: number;
  }>;
  type?: "logo" | "image"; // logo = always on top; image = background wrap
  zOrder?: "bottom" | "above-text"; // only used when type === "image"
}

export interface CustomizerState {
  glbModel: string;
  primary: string;
  primaryColorSide: string;
  primaryFront: string;
  primaryBack: string;
  secondary: string;
  designColor: string;
  pattern: string;
  fabricPatternFront: string;
  fabricPatternBack: string;
  fabricPatternCustomizeFront: boolean;
  fabricPatternColorFront: string;
  fabricPatternBgFront: string;
  fabricPatternCustomizeBack: boolean;
  fabricPatternColorBack: string;
  fabricPatternBgBack: string;
  frontText: string;
  frontFont: string;
  frontTextColor: string;
  frontTextSize: number;
  backText: string;
  backFont: string;
  backTextColor: string;
  backTextSize: number;
  number: string;
  numberFont: string;
  numberColor: string;
  numberPosition: string;
  sleeve: string;
  collarType: string;
  cutFit: string;
  fabric: string;
  collar: boolean;
  zipper: boolean | null;
  designSide: string;
  logo: string | null;
  logoPosition: string;
  logoSize: number;
  logoPosX: number;
  logoPosY: number;
  logoPosZ: number;
  logoRotX: number;
  logoRotY: number;
  logoRotZ: number;
  logoInteractive: boolean;
}

export const JERSEY_DESIGNS = [
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

export const TABS = [
  { id: "designs", icon: LayoutTemplate, label: "Designs" },
  { id: "colors", icon: Palette, label: "Colors" },
  { id: "patterns", icon: Grid, label: "Patterns" },
  { id: "text", icon: Type, label: "Text" },
  { id: "logos", icon: ImageIcon, label: "Uploads" },
  { id: "style", icon: Scissors, label: "Style" },
  { id: "fabric", icon: Box, label: "Fabric" },
];

export const getFontFamily = (font: string) => {
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

export const getFontWeight = (font: string) => {
  if (font === "Grunge" || font === "Neon Glow" || font === "Gothic")
    return "400";
  return "900";
};

export const getFontStyle = (font: string) => {
  return font === "Italic" ? "italic" : "normal";
};
