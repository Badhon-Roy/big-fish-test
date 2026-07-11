import {
  LayoutTemplate,
  Palette,
  Grid,
  Type,
  Image as ImageIcon,
  Scissors,
  Box,
} from "lucide-react";

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
  { id: "apex", label: "Apex", pattern: "apex" },
  { id: "bolt", label: "Bolt", pattern: "bolt" },
  { id: "edge", label: "Edge", pattern: "edge" },
  { id: "fusion", label: "Fusion", pattern: "fusion" },
  { id: "horizon", label: "Horizon", pattern: "horizon" },
  { id: "matrix", label: "Matrix", pattern: "matrix" },
  { id: "nova", label: "Nova", pattern: "nova" },
  { id: "pulse", label: "Pulse", pattern: "pulse" },
  { id: "summit", label: "Summit", pattern: "summit" },
  { id: "tempo", label: "Tempo", pattern: "tempo" },
  { id: "titan", label: "Titan", pattern: "titan" },
  { id: "zenith", label: "Zenith", pattern: "zenith" },
  { id: "ignite", label: "Ignite", pattern: "ignite" },
  { id: "kinetic", label: "Kinetic", pattern: "kinetic" },
  { id: "legacy", label: "Legacy", pattern: "legacy" },
  { id: "momentum", label: "Momentum", pattern: "momentum" },
  { id: "obsidian", label: "Obsidian", pattern: "obsidian" },
  { id: "phantom", label: "Phantom", pattern: "phantom" },
  { id: "stride", label: "Stride", pattern: "stride" },
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

export const getFontFamily = (font) => {
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

export const getFontWeight = (font) => {
  if (font === "Grunge" || font === "Neon Glow" || font === "Gothic")
    return "400";
  return "900";
};

export const getFontStyle = (font) => {
  return font === "Italic" ? "italic" : "normal";
};
