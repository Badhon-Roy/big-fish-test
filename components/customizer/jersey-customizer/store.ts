import { create } from "zustand";
import { CustomizerState, TextLayer, LogoLayer } from "./types";

interface CustomizerStore {
  state: CustomizerState;
  textLayers: TextLayer[];
  logoLayers: LogoLayer[];
  qty: number;
  activeTab: string;
  activeSide: "Front" | "Back";
  currentView: string;
  uploadedLogos: string[];
  uploadedImages: string[];
  uploadSubTab: "logo" | "image";
  selectedLayerId: string | null;
  selectedLogoId: string | null;
  loadedLogoImages: Record<string, HTMLImageElement>;
  isEraserMode: boolean;
  eraserBrushSize: number;
  layersOrder: string[];
  draggedIdx: number | null;
  dragOverIdx: number | null;
  activePatternSide: "Front" | "Back";
  loadedPatterns: Record<string, HTMLImageElement>;
  selectedDesign: string;
  fontsLoaded: boolean;

  // Actions
  updateState: (key: keyof CustomizerState, value: any) => void;
  updateStateBulk: (updates: Partial<CustomizerState>) => void;
  setTextLayers: (layers: TextLayer[] | ((prev: TextLayer[]) => TextLayer[])) => void;
  setLogoLayers: (layers: LogoLayer[] | ((prev: LogoLayer[]) => LogoLayer[])) => void;
  setQty: (qty: number | ((prev: number) => number)) => void;
  setActiveTab: (tab: string) => void;
  setActiveSide: (side: "Front" | "Back") => void;
  setCurrentView: (view: string) => void;
  setUploadedLogos: (logos: string[] | ((prev: string[]) => string[])) => void;
  setUploadedImages: (images: string[] | ((prev: string[]) => string[])) => void;
  setUploadSubTab: (subTab: "logo" | "image") => void;
  setSelectedLayerId: (id: string | null) => void;
  setSelectedLogoId: (id: string | null) => void;
  setLoadedLogoImages: (images: Record<string, HTMLImageElement> | ((prev: Record<string, HTMLImageElement>) => Record<string, HTMLImageElement>)) => void;
  setIsEraserMode: (isEraser: boolean) => void;
  setEraserBrushSize: (size: number) => void;
  setLayersOrder: (order: string[] | ((prev: string[]) => string[])) => void;
  setDraggedIdx: (idx: number | null) => void;
  setDragOverIdx: (idx: number | null) => void;
  setActivePatternSide: (side: "Front" | "Back") => void;
  setLoadedPatterns: (patterns: Record<string, HTMLImageElement> | ((prev: Record<string, HTMLImageElement>) => Record<string, HTMLImageElement>)) => void;
  setSelectedDesign: (design: string) => void;
  setFontsLoaded: (loaded: boolean) => void;

  // High-level Actions
  setLogoPositionPreset: (pos: string) => void;
  handleAddLogoLayer: (src: string, type?: "logo" | "image") => void;
  handleLogoCopy: (id: string) => void;
  handleLogoDelete: (id: string) => void;
  handleCopy: (id: string) => void;
  handleDelete: (id: string) => void;
  handleAddCustomText: () => void;
  reorderLayers: (fromUIIndex: number, toUIIndex: number) => void;
}

const resolveVal = (arg: any, prev: any) =>
  typeof arg === "function" ? arg(prev) : arg;

export const useCustomizerStore = create<CustomizerStore>((set, get) => ({
  state: {
    glbModel: "/models/shirt_baked.glb",
    primary: "#2196F3",
    primaryColorSide: "Both",
    primaryFront: "#2196F3",
    primaryBack: "#2196F3",
    secondary: "#1A1A2E",
    designColor: "#1A1A2E",
    pattern: "None",
    fabricPatternFront: "None",
    fabricPatternBack: "None",
    fabricPatternCustomizeFront: false,
    fabricPatternColorFront: "#d73099",
    fabricPatternBgFront: "#FFFFFF",
    fabricPatternCustomizeBack: false,
    fabricPatternColorBack: "#d73099",
    fabricPatternBgBack: "#FFFFFF",
    frontText: "",
    frontFont: "Varsity",
    frontTextColor: "#FFFFFF",
    frontTextSize: 220,
    backText: "",
    backFont: "Varsity",
    backTextColor: "#FFFFFF",
    backTextSize: 200,
    number: "10",
    numberFont: "Bold",
    numberColor: "#111111",
    numberPosition: "Both",
    sleeve: "Short",
    collarType: "None",
    cutFit: "None",
    fabric: "Mesh",
    collar: false,
    zipper: null,
    designSide: "Both",
    logo: null,
    logoPosition: "Left Chest",
    logoSize: 0.15,
    logoPosX: 0.065,
    logoPosY: 0.16,
    logoPosZ: 0.15,
    logoRotX: 0,
    logoRotY: 0,
    logoRotZ: 0,
    logoInteractive: true,
  },
  textLayers: [],
  logoLayers: [],
  qty: 1,
  activeTab: "designs",
  activeSide: "Front",
  currentView: "front",
  uploadedLogos: [],
  uploadedImages: [],
  uploadSubTab: "logo",
  selectedLayerId: null,
  selectedLogoId: null,
  loadedLogoImages: {},
  isEraserMode: false,
  eraserBrushSize: 20,
  layersOrder: [],
  draggedIdx: null,
  dragOverIdx: null,
  activePatternSide: "Front",
  loadedPatterns: {},
  selectedDesign: "throw",
  fontsLoaded: false,

  // Actions
  updateState: (key, value) =>
    set((s) => ({ state: { ...s.state, [key]: value } })),
  updateStateBulk: (updates) =>
    set((s) => ({ state: { ...s.state, ...updates } })),
  setTextLayers: (layers) =>
    set((s) => ({ textLayers: resolveVal(layers, s.textLayers) })),
  setLogoLayers: (layers) =>
    set((s) => ({ logoLayers: resolveVal(layers, s.logoLayers) })),
  setQty: (qty) => set((s) => ({ qty: resolveVal(qty, s.qty) })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveSide: (side) => set({ activeSide: side }),
  setCurrentView: (view) =>
    set((s) => {
      const activeSide =
        view === "back" ? "Back" : view === "front" ? "Front" : s.activeSide;
      return { currentView: view, activeSide };
    }),
  setUploadedLogos: (logos) =>
    set((s) => ({ uploadedLogos: resolveVal(logos, s.uploadedLogos) })),
  setUploadedImages: (images) =>
    set((s) => ({ uploadedImages: resolveVal(images, s.uploadedImages) })),
  setUploadSubTab: (subTab) => set({ uploadSubTab: subTab }),
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  setSelectedLogoId: (id) => set({ selectedLogoId: id }),
  setLoadedLogoImages: (images) =>
    set((s) => ({ loadedLogoImages: resolveVal(images, s.loadedLogoImages) })),
  setIsEraserMode: (isEraser) => set({ isEraserMode: isEraser }),
  setEraserBrushSize: (size) => set({ eraserBrushSize: size }),
  setLayersOrder: (order) =>
    set((s) => ({ layersOrder: resolveVal(order, s.layersOrder) })),
  setDraggedIdx: (idx) => set({ draggedIdx: idx }),
  setDragOverIdx: (idx) => set({ dragOverIdx: idx }),
  setActivePatternSide: (side) => set({ activePatternSide: side }),
  setLoadedPatterns: (patterns) =>
    set((s) => ({ loadedPatterns: resolveVal(patterns, s.loadedPatterns) })),
  setSelectedDesign: (design) => set({ selectedDesign: design }),
  setFontsLoaded: (loaded) => set({ fontsLoaded: loaded }),

  // High-level Actions
  setLogoPositionPreset: (pos) => {
    let x = 0.065,
      y = 0.16,
      z = 0.15;
    let rx = 0,
      ry = 0,
      rz = 0;

    switch (pos) {
      case "Left Chest":
        x = 0.065;
        y = 0.16;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Right Chest":
        x = -0.065;
        y = 0.16;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Center":
        x = 0.0;
        y = 0.08;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Back Top":
        x = 0.0;
        y = 0.23;
        z = -0.15;
        rx = 0;
        ry = Math.PI;
        rz = 0;
        break;
      case "Back Center":
        x = 0.0;
        y = 0.05;
        z = -0.15;
        rx = 0;
        ry = Math.PI;
        rz = 0;
        break;
      case "Sleeve":
        x = 0.22;
        y = 0.16;
        z = 0.0;
        rx = 0;
        ry = Math.PI / 2;
        rz = 0;
        break;
    }

    get().updateStateBulk({
      logoPosition: pos,
      logoPosX: x,
      logoPosY: y,
      logoPosZ: z,
      logoRotX: rx,
      logoRotY: ry,
      logoRotZ: rz,
    });
  },

  handleAddLogoLayer: (src, type = "logo") => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imgWidth = img.naturalWidth || img.width || 200;
      const imgHeight = img.naturalHeight || img.height || 200;

      // For Wrap/BG images: contain-fit within the 1024×1024 canvas so all
      // four corner handles are visible in the visual editor on first upload.
      // The user can then scale up to fill. For logo layers: 200px reference size.
      let initialScale: number;
      if (type === "image") {
        initialScale = Math.min(1024 / imgWidth, 1024 / imgHeight);
      } else {
        const maxDim = Math.max(imgWidth, imgHeight);
        initialScale = 200 / maxDim;
      }

      const newId = `custom-logo-${Date.now()}`;
      const newLayer: LogoLayer = {
        id: newId,
        src,
        x: 512,
        y: type === "image" ? 512 : 500,  // image: true center; logo: slightly above center
        scale: initialScale,
        rotation: 0,
        side: get().activeSide,
        baseSize: 200,
        opacity: 1.0,
        type,
        zOrder: type === "image" ? "bottom" : undefined,
      };

      set((s) => ({
        loadedLogoImages: { ...s.loadedLogoImages, [src]: img },
        logoLayers: [...s.logoLayers, newLayer],
        selectedLogoId: newId,
        selectedLayerId: null,
      }));
    };
  },

  handleLogoCopy: (id) => {
    const layer = get().logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const newLayer: LogoLayer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      x: Math.min(1024, layer.x + 40),
      y: Math.min(1024, layer.y + 40),
    };

    set((s) => ({
      logoLayers: [...s.logoLayers, newLayer],
      selectedLogoId: newLayer.id,
      selectedLayerId: null,
    }));
  },

  handleLogoDelete: (id) => {
    set((s) => ({
      logoLayers: s.logoLayers.filter((l) => l.id !== id),
      selectedLogoId: s.selectedLogoId === id ? null : s.selectedLogoId,
    }));
  },

  handleCopy: (id) => {
    const layer = get().textLayers.find((l) => l.id === id);
    if (!layer) return;

    const newLayer: TextLayer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      x: Math.min(1024, layer.x + 40),
      y: Math.min(1024, layer.y + 40),
    };

    set((s) => ({
      textLayers: [...s.textLayers, newLayer],
      selectedLayerId: newLayer.id,
    }));
  },

  handleDelete: (id) => {
    set((s) => ({
      textLayers: s.textLayers.filter((l) => l.id !== id),
      selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
    }));
  },

  handleAddCustomText: () => {
    const newId = `custom-text-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      text: "CUSTOM TEXT",
      x: 512,
      y: 500,
      scale: 1.0,
      rotation: 0,
      font: "Varsity",
      color: "#E63946",
      textSize: 100,
      side: get().activeSide,
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

    set((s) => ({
      textLayers: [...s.textLayers, newLayer],
      selectedLayerId: newId,
    }));
  },

  reorderLayers: (fromUIIndex, toUIIndex) => {
    const { textLayers, logoLayers, activeSide, layersOrder } = get();
    const sideTextLayers = textLayers.filter((l) => l.side === activeSide);
    const sideLogoLayers = logoLayers.filter((l) => l.side === activeSide);
    const activeSideLayers = [
      ...sideTextLayers.map((l) => ({ ...l, layerType: "text" })),
      ...sideLogoLayers.map((l) => ({ ...l, layerType: "logo" })),
    ];

    const sortedActiveSideLayers = [...activeSideLayers].sort((a, b) => {
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
    });

    const reorderedSideLayers = [...sortedActiveSideLayers];
    const [movedItem] = reorderedSideLayers.splice(fromUIIndex, 1);
    reorderedSideLayers.splice(toUIIndex, 0, movedItem);

    set((s) => {
      const newOrder = [...s.layersOrder];
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

      return { layersOrder: newOrder };
    });
  },
}));
