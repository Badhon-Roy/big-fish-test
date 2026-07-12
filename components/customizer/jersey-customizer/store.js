import { create } from "zustand";

const resolveVal = (arg, prev) =>
  typeof arg === "function" ? arg(prev) : arg;

export const useCustomizerStore = create((originalSet, get) => {
  let continuousTimeout = null;

  const set = (fnOrObj) => {
    const preState = get();
    originalSet((s) => {
      const result = typeof fnOrObj === "function" ? fnOrObj(s) : fnOrObj;
      let updatedResult = { ...result };
      if ("selectedLayerId" in result || "selectedLogoId" in result) {
        const nextLayerId = "selectedLayerId" in result ? result.selectedLayerId : s.selectedLayerId;
        const nextLogoId = "selectedLogoId" in result ? result.selectedLogoId : s.selectedLogoId;
        
        if (nextLayerId) {
          updatedResult.selectedLogoId = null;
          updatedResult.selectedLayerIds = [nextLayerId];
        } else if (nextLogoId) {
          updatedResult.selectedLayerId = null;
          updatedResult.selectedLayerIds = [nextLogoId];
        } else {
          updatedResult.selectedLayerId = null;
          updatedResult.selectedLogoId = null;
          updatedResult.selectedLayerIds = [];
        }
      }
      return updatedResult;
    });

    const postState = get();
    const changed =
      preState.state !== postState.state ||
      preState.textLayers !== postState.textLayers ||
      preState.logoLayers !== postState.logoLayers;

    if (changed) {
      if (postState._isUndoingRedoing) {
        return;
      }

      const snap = {
        state: JSON.parse(JSON.stringify(preState.state)),
        textLayers: JSON.parse(JSON.stringify(preState.textLayers)),
        logoLayers: JSON.parse(JSON.stringify(preState.logoLayers)),
        selectedLayerId: preState.selectedLayerId,
        selectedLogoId: preState.selectedLogoId,
        selectedLayerIds: preState.selectedLayerIds || [],
      };

      if (continuousTimeout) {
        clearTimeout(continuousTimeout);
      } else {
        originalSet((s) => ({
          past: [...(s.past || []), snap],
          future: [],
        }));
      }

      continuousTimeout = setTimeout(() => {
        continuousTimeout = null;
      }, 800);
    }
  };

  return {
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
  selectedLayerIds: [],
  past: [],
  future: [],
  clipboard: null,
  _isUndoingRedoing: false,
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
  defaultImageSide: "Front",

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
  setDefaultImageSide: (side) => set({ defaultImageSide: side }),

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
      let initialScale;
      if (type === "image") {
        initialScale = Math.min(1024 / imgWidth, 1024 / imgHeight);
      } else {
        const maxDim = Math.max(imgWidth, imgHeight);
        initialScale = 200 / maxDim;
      }

      const newId = `custom-logo-${Date.now()}`;
      const newLayer = {
        id: newId,
        src,
        x: 512,
        y: type === "image" ? 512 : 500,  // image: true center; logo: slightly above center
        scale: initialScale,
        rotation: 0,
        side: type === "image" ? get().defaultImageSide : get().activeSide,
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

    const newLayer = {
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

    const newLayer = {
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
    const newLayer = {
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
      const getPriority = (l) => {
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

  // Undo/Redo & Selection/Clipboard Actions
  undo: () => {
    const { past, future, state, textLayers, logoLayers, selectedLayerId, selectedLogoId, selectedLayerIds } = get();
    if (!past || past.length === 0) return;

    if (continuousTimeout) {
      clearTimeout(continuousTimeout);
      continuousTimeout = null;
    }

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    const current = {
      state: JSON.parse(JSON.stringify(state)),
      textLayers: JSON.parse(JSON.stringify(textLayers)),
      logoLayers: JSON.parse(JSON.stringify(logoLayers)),
      selectedLayerId,
      selectedLogoId,
      selectedLayerIds: selectedLayerIds || [],
    };

    originalSet({
      _isUndoingRedoing: true,
      state: previous.state,
      textLayers: previous.textLayers,
      logoLayers: previous.logoLayers,
      selectedLayerId: previous.selectedLayerId,
      selectedLogoId: previous.selectedLogoId,
      selectedLayerIds: previous.selectedLayerIds || [],
      past: newPast,
      future: [current, ...future],
    });
    originalSet({ _isUndoingRedoing: false });
  },

  redo: () => {
    const { past, future, state, textLayers, logoLayers, selectedLayerId, selectedLogoId, selectedLayerIds } = get();
    if (!future || future.length === 0) return;

    if (continuousTimeout) {
      clearTimeout(continuousTimeout);
      continuousTimeout = null;
    }

    const next = future[0];
    const newFuture = future.slice(1);

    const current = {
      state: JSON.parse(JSON.stringify(state)),
      textLayers: JSON.parse(JSON.stringify(textLayers)),
      logoLayers: JSON.parse(JSON.stringify(logoLayers)),
      selectedLayerId,
      selectedLogoId,
      selectedLayerIds: selectedLayerIds || [],
    };

    originalSet({
      _isUndoingRedoing: true,
      state: next.state,
      textLayers: next.textLayers,
      logoLayers: next.logoLayers,
      selectedLayerId: next.selectedLayerId,
      selectedLogoId: next.selectedLogoId,
      selectedLayerIds: next.selectedLayerIds || [],
      past: [...past, current],
      future: newFuture,
    });
    originalSet({ _isUndoingRedoing: false });
  },

  copySelectedLayers: () => {
    const { selectedLayerIds, textLayers, logoLayers } = get();
    if (!selectedLayerIds || selectedLayerIds.length === 0) return;

    const copied = [];
    selectedLayerIds.forEach((id) => {
      const textL = textLayers.find((l) => l.id === id);
      if (textL) {
        copied.push({ type: "text", data: { ...textL } });
      } else {
        const logoL = logoLayers.find((l) => l.id === id);
        if (logoL) {
          copied.push({ type: "logo", data: { ...logoL } });
        }
      }
    });

    originalSet({ clipboard: copied });
  },

  pasteLayers: () => {
    const { clipboard, activeSide } = get();
    if (!clipboard || clipboard.length === 0) return;

    const newTextLayers = [];
    const newLogoLayers = [];
    const newIds = [];

    clipboard.forEach((item) => {
      const newId = `${item.data.id}-copy-${Date.now()}`;
      newIds.push(newId);

      const newLayer = {
        ...item.data,
        id: newId,
        side: activeSide,
        x: Math.min(1024, item.data.x + 40),
        y: Math.min(1024, item.data.y + 40),
      };

      if (item.type === "text") {
        newTextLayers.push(newLayer);
      } else {
        newLogoLayers.push(newLayer);
      }
    });

    set((s) => ({
      textLayers: [...s.textLayers, ...newTextLayers],
      logoLayers: [...s.logoLayers, ...newLogoLayers],
      selectedLayerIds: newIds,
      selectedLayerId: newTextLayers.length > 0 ? newTextLayers[0].id : null,
      selectedLogoId: newTextLayers.length === 0 && newLogoLayers.length > 0 ? newLogoLayers[0].id : null,
    }));
  },

  duplicateSelectedLayers: () => {
    const { selectedLayerIds, textLayers, logoLayers } = get();
    if (!selectedLayerIds || selectedLayerIds.length === 0) return;

    const newTextLayers = [];
    const newLogoLayers = [];
    const newIds = [];

    selectedLayerIds.forEach((id) => {
      const textL = textLayers.find((l) => l.id === id);
      if (textL) {
        const newId = `${textL.id}-copy-${Date.now()}`;
        newIds.push(newId);
        newTextLayers.push({
          ...textL,
          id: newId,
          x: Math.min(1024, textL.x + 40),
          y: Math.min(1024, textL.y + 40),
        });
      } else {
        const logoL = logoLayers.find((l) => l.id === id);
        if (logoL) {
          const newId = `${logoL.id}-copy-${Date.now()}`;
          newIds.push(newId);
          newLogoLayers.push({
            ...logoL,
            id: newId,
            x: Math.min(1024, logoL.x + 40),
            y: Math.min(1024, logoL.y + 40),
          });
        }
      }
    });

    set((s) => ({
      textLayers: [...s.textLayers, ...newTextLayers],
      logoLayers: [...s.logoLayers, ...newLogoLayers],
      selectedLayerIds: newIds,
      selectedLayerId: newTextLayers.length > 0 ? newTextLayers[0].id : null,
      selectedLogoId: newTextLayers.length === 0 && newLogoLayers.length > 0 ? newLogoLayers[0].id : null,
    }));
  },

  deleteSelectedLayers: () => {
    const { selectedLayerIds } = get();
    if (!selectedLayerIds || selectedLayerIds.length === 0) return;

    set((s) => ({
      textLayers: s.textLayers.filter((l) => !selectedLayerIds.includes(l.id)),
      logoLayers: s.logoLayers.filter((l) => !selectedLayerIds.includes(l.id)),
      selectedLayerIds: [],
      selectedLayerId: null,
      selectedLogoId: null,
    }));
  },

  selectAllLayers: () => {
    const { textLayers, logoLayers, activeSide, uploadSubTab, defaultImageSide } = get();
    
    const sideTextLayers = textLayers.filter((l) => l.side === activeSide);
    const sideLogoLayers = logoLayers.filter((l) =>
      uploadSubTab === "logo"
        ? (l.side === activeSide && (l.type === "logo" || !l.type))
        : (l.side === defaultImageSide && l.type === "image")
    );
    
    const allSideIds = [
      ...sideTextLayers.map((l) => l.id),
      ...sideLogoLayers.map((l) => l.id),
    ];

    if (allSideIds.length === 0) return;

    set({
      selectedLayerIds: allSideIds,
      selectedLayerId: sideTextLayers.length > 0 ? sideTextLayers[0].id : null,
      selectedLogoId: sideTextLayers.length === 0 && sideLogoLayers.length > 0 ? sideLogoLayers[0].id : null,
    });
  },

  deselectAll: () => {
    set({
      selectedLayerId: null,
      selectedLogoId: null,
      selectedLayerIds: [],
    });
  },
};
});
