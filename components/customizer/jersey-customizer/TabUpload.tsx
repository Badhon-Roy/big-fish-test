"use client";

import React from "react";
import { useCustomizerStore } from "./store";
import { LogoLayer } from "./types";
import { Image as ImageIcon, Copy, Trash2, GripVertical } from "lucide-react";

const ERASER_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 20H7L3 16c-1-1-1-3 0-4L12 3c1-1 3-1 4 0l5 5c1 1 1 3 0 4l-5 5z' fill='%23fca5a5'/><path d='M12 3l4 4'/></svg>") 3 17, auto`;

const editorWidth = 280;
const canvasSize = 1024;
const editorScale = editorWidth / canvasSize; // 0.2734

function LogoCanvasPreview({
  layer,
  editorScale,
  preloadedImage,
}: {
  layer: LogoLayer;
  editorScale: number;
  preloadedImage?: HTMLImageElement;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const imgWidth = preloadedImage?.naturalWidth || preloadedImage?.width || 200;
  const imgHeight =
    preloadedImage?.naturalHeight || preloadedImage?.height || 200;
  const drawWidth = imgWidth * layer.scale * editorScale;
  const drawHeight = imgHeight * layer.scale * editorScale;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = drawWidth;
    canvas.height = drawHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (img: HTMLImageElement) => {
      ctx.clearRect(0, 0, drawWidth, drawHeight);
      ctx.save();

      // Draw the logo image
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

      // Apply eraser strokes
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

export function TabUpload() {
  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const selectedLogoId = useCustomizerStore((s) => s.selectedLogoId);
  const selectedLayerId = useCustomizerStore((s) => s.selectedLayerId);
  const loadedLogoImages = useCustomizerStore((s) => s.loadedLogoImages);
  const isEraserMode = useCustomizerStore((s) => s.isEraserMode);
  const eraserBrushSize = useCustomizerStore((s) => s.eraserBrushSize);
  const draggedIdx = useCustomizerStore((s) => s.draggedIdx);
  const dragOverIdx = useCustomizerStore((s) => s.dragOverIdx);
  const layersOrder = useCustomizerStore((s) => s.layersOrder);
  const activeSide = useCustomizerStore((s) => s.activeSide);
  const uploadSubTab = useCustomizerStore((s) => s.uploadSubTab);
  const uploadedLogos = useCustomizerStore((s) => s.uploadedLogos);
  const uploadedImages = useCustomizerStore((s) => s.uploadedImages);

  const setLogoLayers = useCustomizerStore((s) => s.setLogoLayers);
  const setSelectedLogoId = useCustomizerStore((s) => s.setSelectedLogoId);
  const setSelectedLayerId = useCustomizerStore((s) => s.setSelectedLayerId);
  const setIsEraserMode = useCustomizerStore((s) => s.setIsEraserMode);
  const setEraserBrushSize = useCustomizerStore((s) => s.setEraserBrushSize);
  const setDraggedIdx = useCustomizerStore((s) => s.setDraggedIdx);
  const setDragOverIdx = useCustomizerStore((s) => s.setDragOverIdx);
  const setUploadedLogos = useCustomizerStore((s) => s.setUploadedLogos);
  const setUploadedImages = useCustomizerStore((s) => s.setUploadedImages);
  const setUploadSubTab = useCustomizerStore((s) => s.setUploadSubTab);
  const setCurrentView = useCustomizerStore((s) => s.setCurrentView);

  const handleAddLogoLayer = useCustomizerStore((s) => s.handleAddLogoLayer);
  const handleLogoCopy = useCustomizerStore((s) => s.handleLogoCopy);
  const handleLogoDelete = useCustomizerStore((s) => s.handleLogoDelete);
  const handleCopy = useCustomizerStore((s) => s.handleCopy);
  const handleDelete = useCustomizerStore((s) => s.handleDelete);
  const reorderLayers = useCustomizerStore((s) => s.reorderLayers);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogos = localStorage.getItem("jersey_uploaded_logos");
      if (savedLogos) {
        setUploadedLogos(JSON.parse(savedLogos));
      }
      const savedImages = localStorage.getItem("jersey_uploaded_images");
      if (savedImages) {
        setUploadedImages(JSON.parse(savedImages));
      }
    }
  }, [setUploadedLogos, setUploadedImages]);

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
          const next = [
            dataUrl,
            ...prev.filter((item) => item !== dataUrl),
          ].slice(0, 12);
          localStorage.setItem("jersey_uploaded_images", JSON.stringify(next));
          return next;
        });
      } else {
        setUploadedLogos((prev) => {
          const next = [
            dataUrl,
            ...prev.filter((item) => item !== dataUrl),
          ].slice(0, 12);
          localStorage.setItem("jersey_uploaded_logos", JSON.stringify(next));
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEraserStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedLayer = logoLayers.find((l) => l.id === selectedLogoId);
    if (!selectedLayer) return;

    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const getCoords = (evt: MouseEvent | TouchEvent) => {
      if ("touches" in evt && evt.touches.length > 0) {
        return {
          clientX: evt.touches[0].clientX,
          clientY: evt.touches[0].clientY,
        };
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
        l.id === selectedLayer.id ? { ...l, eraserPaths: updatedPaths } : l,
      ),
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
        }),
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

  const handleLogoDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedLogoId(id);
    setSelectedLayerId(null);

    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    let lastMouseX = e.clientX;
    let lastMouseY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - lastMouseX) / editorScale;
      const deltaY = (moveEvent.clientY - lastMouseY) / editorScale;

      lastMouseX = moveEvent.clientX;
      lastMouseY = moveEvent.clientY;

      setLogoLayers((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;

          let newX = l.x + deltaX;
          let newY = l.y + deltaY;
          let newSide = l.side;

          // Seamless front/back side wrapping (logos only, skip for Wrap/BG images)
          if (l.type !== "image") {
            if (newX > 1024) {
              newX = newX - 1024;
              newSide = newSide === "Front" ? "Back" : "Front";
              setCurrentView(newSide.toLowerCase());
            } else if (newX < 0) {
              newX = 1024 + newX;
              newSide = newSide === "Front" ? "Back" : "Front";
              setCurrentView(newSide.toLowerCase());
            }
          }

          return {
            ...l,
            x: newX,
            y: newY,
            side: newSide,
          };
        }),
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

    const target = (e.currentTarget as HTMLElement).parentElement
      ?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX);
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX,
      );
      const angleDiff = currentAngle - startAngle;
      let newRotation = startRotation + angleDiff * (180 / Math.PI);
      newRotation = ((newRotation % 360) + 360) % 360;

      setLogoLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l)),
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

    const target = (e.currentTarget as HTMLElement).parentElement
      ?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDist = Math.sqrt(
      Math.pow(startMouseX - centerX, 2) + Math.pow(startMouseY - centerY, 2),
    );
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const curDist = Math.sqrt(
        Math.pow(moveEvent.clientX - centerX, 2) +
          Math.pow(moveEvent.clientY - centerY, 2),
      );
      const newScale = Math.max(0.01, startScale * (curDist / startDist));

      setLogoLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l)),
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const renderLogoLayer = (
    layer: LogoLayer,
    isHidden = false,
    children?: React.ReactNode,
  ) => {
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
            <LogoCanvasPreview
              layer={layer}
              editorScale={editorScale}
              preloadedImage={img}
            />
          </div>
        )}
        {children}
      </div>
    );
  };

  return (
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
            setSelectedLogoId(null);
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
            setSelectedLogoId(null);
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

        {/* Bounding Box Customizer Canvas area (taller container for handles visibility) */}
        <div
          className="relative w-[280px] h-[380px] rounded border border-zinc-200 shadow-inner mx-auto select-none overflow-hidden"
          style={{
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
          {/* Silhouette helper (centered inside active 280x280 area) */}
          <div className="absolute top-[50px] left-0 w-[280px] h-[280px] rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg viewBox="0 0 100 100" className="w-48 h-48 fill-white">
                <path d="M 30,15 L 70,15 L 85,25 L 80,45 L 70,40 L 70,85 L 30,85 L 30,40 L 20,45 L 15,25 Z" />
              </svg>
            </div>
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          {/* Active side text label */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-zinc-500 tracking-widest uppercase pointer-events-none">
            {activeSide} Texture Map (1024x1024)
          </div>

          {/* Content Container (centered vertically, allows overflow of control handles) */}
          <div className="absolute top-[50px] left-0 w-[280px] h-[280px]">
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
                      if (isEraserMode) return;
                      handleLogoDragStart(e, layer.id);
                    }}
                  >
                    {renderLogoLayer(layer, false)}
                  </div>
                );
              })}
          </div>

          {/* Bounding Box & Handles Overlay */}
          <div className="absolute top-[50px] left-0 w-[280px] h-[280px] pointer-events-none">
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
                        </>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Background Eraser - Conditional on selected layer matching sub-tab */}
      {(() => {
        const selectedLayer = logoLayers.find((l) => l.id === selectedLogoId);
        if (!selectedLayer) return null;
        const isLogoTab = uploadSubTab === "logo";
        const layerIsLogo = selectedLayer.type === "logo" || !selectedLayer.type;
        if (isLogoTab !== layerIsLogo) return null;

        return (
          <div className="space-y-2.5 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 shadow-sm mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Background Eraser
              </span>
              <button
                onClick={() => setIsEraserMode(!isEraserMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isEraserMode
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300"
                }`}
                title={isEraserMode ? "Click to lock artwork" : "Click to erase background"}
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
                <span>{isEraserMode ? "Lock Drawing" : "Erase Pixels"}</span>
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
                  onChange={(e) => setEraserBrushSize(parseInt(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                />
                <p className="text-[10px] text-zinc-400 italic">
                  Drag mouse/finger over image edges in the Visual Editor to clean up background pixels.
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Upload Container */}
      {uploadSubTab === "logo" ? (
        <div
          onClick={() => document.getElementById("logo-upload-input")?.click()}
          className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-red-400 cursor-pointer transition-all"
        >
          <ImageIcon className="w-6 h-6 mb-1.5" />
          <span className="text-xs font-bold">Upload Custom Logo</span>
          <span className="text-[10px] mt-0.5">PNG, SVG up to 5MB</span>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById("logo-upload-input")?.click()}
          className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-red-400 cursor-pointer transition-all"
        >
          <ImageIcon className="w-6 h-6 mb-1.5" />
          <span className="text-xs font-bold">Upload Background / Wrap Image</span>
          <span className="text-[10px] mt-0.5">PNG, SVG up to 5MB</span>
        </div>
      )}

      {/* Presets Grid */}
      {uploadSubTab === "logo" && (
        <div>
          <label className="text-xs font-bold text-zinc-900 mb-2 block">Preset Badges</label>
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
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y0M2Y1ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJvaC1kYXNoYXJyYXk9IjggNiIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMTUgNjEsMzggODYsNDAgNjcsNTcgNzMsODIgNTAsNjggMjcsODIgMzMsNTcgMjQsNDAgMzksMzgiIGZpbGw9IiNmNDNmNWUiLz48L3N2Zz4=",
              },
              {
                name: "Ocean Anchor",
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBlYTVlOSIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTUwLDE4IEw1MCw2OCBNMzIsNDggTDY4LDQ4IE01MCwxOCBBNiw2IDAgMSwxIDUwLDMwIEE2LDYgMCAxLDEgNTAsMTggTTMwLDU1IEEyMCwyMCAwIDAsMCA3MCw1NSBNMzgwLDUyIEwyNiw1NyBNNzAsNTIgTDc0LDU3IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZWE1ZTkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+",
              },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleAddLogoLayer(preset.url, "logo")}
                className="p-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[8px] font-bold text-zinc-500">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My Uploads Gallery */}
      {uploadSubTab === "logo" && uploadedLogos.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-900">My Uploaded Badges</label>
            <button
              onClick={() => {
                setUploadedLogos([]);
                localStorage.removeItem("jersey_uploaded_logos");
              }}
              className="text-[9px] text-zinc-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedLogos((prev) => {
                        const next = prev.filter((item) => item !== url);
                        localStorage.setItem("jersey_uploaded_logos", JSON.stringify(next));
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
            <label className="text-xs font-bold text-zinc-900">My Uploaded Images</label>
            <button
              onClick={() => {
                setUploadedImages([]);
                localStorage.removeItem("jersey_uploaded_images");
              }}
              className="text-[9px] text-zinc-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImages((prev) => {
                        const next = prev.filter((item) => item !== url);
                        localStorage.setItem("jersey_uploaded_images", JSON.stringify(next));
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
        const sideTextLayers = textLayers.filter((l) => l.side === activeSide);
        const sideLogoLayers = logoLayers.filter((l) => l.side === activeSide);
        const activeSideLayers = [
          ...sideTextLayers.map((l) => ({
            ...l,
            layerType: "text" as const,
          })),
          ...sideLogoLayers.map((l) => ({
            ...l,
            layerType: "logo" as const,
          })),
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

        return (
          <div className="space-y-2 mt-2 pt-2 border-t border-zinc-100">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Layers List ({activeSide} Side)
            </label>
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {sortedActiveSideLayers.length === 0 ? (
                <div className="text-xs text-zinc-400 italic text-center py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  No layers on this side. Add one above or from the Text tab!
                </div>
              ) : (
                sortedActiveSideLayers.map((layer, index) => {
                  const isText = layer.layerType === "text";
                  const isSelected = isText ? selectedLayerId === layer.id : selectedLogoId === layer.id;
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
                            <span className="text-xs font-bold text-zinc-500">T</span>
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
                          className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
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
        );
      })()}

      {/* Selected Logo Properties */}
      {(() => {
        const selectedLayer = logoLayers.find((l) => l.id === selectedLogoId);
        if (!selectedLayer) return null;
        const isLogoTab = uploadSubTab === "logo";
        const layerIsLogo = selectedLayer.type === "logo" || !selectedLayer.type;
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
                        prev.map((l) => (l.id === selectedLayer.id ? { ...l, zOrder: "bottom" } : l)),
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
                          l.id === selectedLayer.id ? { ...l, zOrder: "above-text" } : l,
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
                <p className="text-[10px] text-zinc-400 italic">
                  {selectedLayer.zOrder === "above-text"
                    ? "Renders on top of jersey text/numbers, but underneath custom logos."
                    : "Renders behind jersey text/numbers and custom logos."}
                </p>
              </div>
            )}

            {/* Size slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-zinc-800">
                <span>{isLogoTab ? "Logo" : "Image"} Size / Scale</span>
                <span className="text-zinc-500">{selectedLayer.scale.toFixed(2)}x</span>
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
                    prev.map((l) => (l.id === selectedLayer.id ? { ...l, scale: val } : l)),
                  );
                }}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Rotation slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-zinc-800">
                <span>{isLogoTab ? "Logo" : "Image"} Rotation</span>
                <span className="text-zinc-500">{Math.round(selectedLayer.rotation)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={Math.round(selectedLayer.rotation)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setLogoLayers((prev) =>
                    prev.map((l) => (l.id === selectedLayer.id ? { ...l, rotation: val } : l)),
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
                    (typeof selectedLayer.opacity === "number" ? selectedLayer.opacity : 1.0) * 100,
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
                  (typeof selectedLayer.opacity === "number" ? selectedLayer.opacity : 1.0) * 100,
                )}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 100;
                  setLogoLayers((prev) =>
                    prev.map((l) => (l.id === selectedLayer.id ? { ...l, opacity: val } : l)),
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
                  { name: "Left Chest", x: 310, y: 290 },
                  { name: "Center", x: 512, y: 500 },
                  { name: "Right Chest", x: 714, y: 290 },
                  { name: "Back Top", x: 512, y: 200 },
                  { name: "Back Center", x: 512, y: 500 },
                  { name: "Sleeve", x: 150, y: 350 },
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      const isBack = p.name.startsWith("Back");
                      const targetSide = isBack ? "Back" : "Front";
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
                      setCurrentView(isBack ? "back" : "front");
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
  );
}

export default TabUpload;
