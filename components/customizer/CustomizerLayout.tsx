"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Save, Share2, Download } from "lucide-react";
import * as THREE from "three";

import { useCustomizerStore } from "./jersey-customizer/store";
import { TABS, JERSEY_DESIGNS } from "./jersey-customizer/types";
import { Sidebar } from "./jersey-customizer/Sidebar";
import { ThreeViewer } from "./jersey-customizer/ThreeViewer";
import { SummaryPanel } from "./jersey-customizer/SummaryPanel";

// Tab Components
import { TabDesigns } from "./jersey-customizer/TabDesigns";
import { TabColors } from "./jersey-customizer/TabColors";
import { TabPatterns } from "./jersey-customizer/TabPatterns";
import { TabText } from "./jersey-customizer/TabText";
import { TabUpload } from "./jersey-customizer/TabUpload";
import { TabStyle } from "./jersey-customizer/TabStyle";
import { TabFabric } from "./jersey-customizer/TabFabric";

export function CustomizerLayout() {
  const state = useCustomizerStore((s) => s.state);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const activeTab = useCustomizerStore((s) => s.activeTab);
  const activeSide = useCustomizerStore((s) => s.activeSide);
  const currentView = useCustomizerStore((s) => s.currentView);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);
  const loadedPatterns = useCustomizerStore((s) => s.loadedPatterns);
  const loadedLogoImages = useCustomizerStore((s) => s.loadedLogoImages);
  const selectedLogoId = useCustomizerStore((s) => s.selectedLogoId);

  const setActiveTab = useCustomizerStore((s) => s.setActiveTab);
  const setCurrentView = useCustomizerStore((s) => s.setCurrentView);
  const setFontsLoaded = useCustomizerStore((s) => s.setFontsLoaded);
  const setTextLayers = useCustomizerStore((s) => s.setTextLayers);
  const setLoadedPatterns = useCustomizerStore((s) => s.setLoadedPatterns);
  const setLoadedLogoImages = useCustomizerStore((s) => s.setLoadedLogoImages);
  const setIsEraserMode = useCustomizerStore((s) => s.setIsEraserMode);
  const updateStateBulk = useCustomizerStore((s) => s.updateStateBulk);
  const setSelectedDesign = useCustomizerStore((s) => s.setSelectedDesign);

  // Load and apply search parameters on page mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // Parse jersey model type
      const type = params.get("type");
      if (type === "collar") {
        updateStateBulk({
          glbModel: "/models/collar_jersey.glb",
          collar: true,
          collarType: "Polo",
        });
      } else if (type === "no-collar") {
        updateStateBulk({
          glbModel: "/models/shirt_baked.glb",
          collar: false,
          collarType: "None",
        });
      }

      // Parse design pattern (e.g. strike, save, final)
      const pattern = params.get("pattern");
      if (pattern) {
        const designExists = JERSEY_DESIGNS.some((d) => d.id === pattern || d.pattern === pattern);
        if (designExists) {
          const matchedDesign = JERSEY_DESIGNS.find((d) => d.id === pattern || d.pattern === pattern);
          if (matchedDesign) {
            setSelectedDesign(matchedDesign.id);
          }
        }
      }
    }
  }, [updateStateBulk, setSelectedDesign]);

  const threeRef = useRef<{
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  } | null>(null);

  const texturesRef = useRef<{
    front: THREE.CanvasTexture | null;
    back: THREE.CanvasTexture | null;
    patternFront?: THREE.CanvasTexture | null;
    patternBack?: THREE.CanvasTexture | null;
  }>({ front: null, back: null, patternFront: null, patternBack: null });

  // Web Font Loader to load premium fonts asynchronously
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Orbitron:wght@900&family=Rubik+Glitch&family=Monoton&family=UnifrakturMaguntia&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    document.fonts.ready.then(() => {
      console.log("Premium custom fonts loaded successfully!");
      setFontsLoaded(true);
      // Force canvas texture update by copying textLayers state
      setTextLayers((prev) => [...prev]);
    });

    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        console.error(e);
      }
    };
  }, [setFontsLoaded, setTextLayers]);

  // Pattern preloader
  useEffect(() => {
    const allPatterns = [
      "/assets/images/patterns/pattern_1.png",
      "/assets/images/patterns/pattern_2.png",
      "/assets/images/patterns/pattern_3.png",
      "/assets/images/patterns/pattern_4.png",
      "/assets/images/patterns/pattern_5.png",
    ];

    allPatterns.forEach((patternPath) => {
      if (loadedPatterns[patternPath]) return;

      const img = new Image();
      img.src = patternPath;
      img.onload = () => {
        setLoadedPatterns((prev) => ({
          ...prev,
          [patternPath]: img,
        }));
      };
    });
  }, [loadedPatterns, setLoadedPatterns]);

  // Logo images preloader
  useEffect(() => {
    logoLayers.forEach((layer) => {
      if (loadedLogoImages[layer.src]) return;
      const img = new Image();
      img.src = layer.src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setLoadedLogoImages((prev) => ({
          ...prev,
          [layer.src]: img,
        }));
      };
    });
  }, [logoLayers, loadedLogoImages, setLoadedLogoImages]);

  // Eraser mode auto reset when logo is deselected
  useEffect(() => {
    if (!selectedLogoId) {
      setIsEraserMode(false);
    }
  }, [selectedLogoId, setIsEraserMode]);

  const handleExport = () => {
    const triggerLocalDownload = (dataUrl: string, fileName: string) => {
      try {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Clean up immediately to unblock the browser event loop
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
          if (dataUrl.startsWith("blob:")) {
            URL.revokeObjectURL(dataUrl); // Free up client-side memory safely
          }
        }, 100);
      } catch (err) {
        console.error(`Error triggering download for ${fileName}:`, err);
      }
    };

    // 1. Client-side 3D Canvas Snapshot (Immediate)
    setTimeout(() => {
      try {
        if (threeRef.current) {
          const { gl, scene, camera } = threeRef.current;
          
          // Save original camera settings
          const persCamera = camera as THREE.PerspectiveCamera;
          const originalPosition = persCamera.position.clone();
          const originalQuaternion = persCamera.quaternion.clone();
          const originalFov = persCamera.fov;
          
          const target = new THREE.Vector3(0, -0.12, 0);
          const exportDistance = 2.8; 
          
          // --- CAPTURE FRONT VIEW ---
          persCamera.position.set(0, -0.12, exportDistance);
          persCamera.lookAt(target);
          persCamera.updateProjectionMatrix();
          
          // Force render
          gl.render(scene, persCamera);
          const frontDataURL = gl.domElement.toDataURL("image/png");
          triggerLocalDownload(frontDataURL, "jersey-3d-front.png");
          
          // --- CAPTURE BACK VIEW ---
          persCamera.position.set(0, -0.12, -exportDistance);
          persCamera.lookAt(target);
          persCamera.updateProjectionMatrix();
          
          // Force render
          gl.render(scene, persCamera);
          const backDataURL = gl.domElement.toDataURL("image/png");
          triggerLocalDownload(backDataURL, "jersey-3d-back.png");
          
          // --- RESTORE ORIGINAL ---
          persCamera.position.copy(originalPosition);
          persCamera.quaternion.copy(originalQuaternion);
          persCamera.fov = originalFov;
          persCamera.updateProjectionMatrix();
          
          // Re-render original view for the screen
          gl.render(scene, camera);
        } else {
          console.warn("threeRef.current is null - skipping 3D snapshot");
        }
      } catch (err) {
        console.error("Error capturing 3D preview snapshot:", err);
      }
    }, 0);

    // 2. Client-side Flat Production Texture Export (Staggered by 300ms)
    setTimeout(() => {
      try {
        const activeSideName =
          currentView === "back" || currentView === "back-center" ? "Back" : "Front";

        const activeDecalTexture =
          activeSideName === "Back" ? texturesRef.current.back : texturesRef.current.front;
        const activePatternTexture =
          activeSideName === "Back" ? texturesRef.current.patternBack : texturesRef.current.patternFront;

        const size = 1024;
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = size;
        exportCanvas.height = size;
        const exportCtx = exportCanvas.getContext("2d");
        
        if (exportCtx) {
          // 1. Draw base pattern/background color if pattern exists
          if (activePatternTexture && activePatternTexture.image) {
            exportCtx.drawImage(activePatternTexture.image as HTMLCanvasElement, 0, 0);
          } else {
            // Fallback: fill with active side primary color
            const fallbackColor =
              activeSideName === "Front"
                ? state.primaryFront || state.primary || "#2196F3"
                : state.primaryBack || state.primary || "#2196F3";
            exportCtx.fillStyle = fallbackColor;
            exportCtx.fillRect(0, 0, size, size);
          }

          // 2. Draw Wrap/BG images (type === "image")
          const sideWrapLayers = logoLayers.filter(
            (l) => (l.side === activeSideName || l.side === "Both") && l.type === "image"
          );
          sideWrapLayers.forEach((layer) => {
            const img = loadedLogoImages[layer.src];
            if (!img) return;
            const imgW = img.naturalWidth || img.width || 200;
            const imgH = img.naturalHeight || img.height || 200;
            const opacity = typeof layer.opacity === "number" ? layer.opacity : 1.0;
            const containScale = Math.min(1024 / imgW, 1024 / imgH) || 1;
            const coverScale = Math.max(1024 / imgW, 1024 / imgH) || 1;
            const scaleFactor = layer.scale / containScale;
            const drawScale = coverScale * scaleFactor;

            exportCtx.save();
            exportCtx.imageSmoothingEnabled = true;
            exportCtx.imageSmoothingQuality = "high";
            exportCtx.globalAlpha = opacity;
            exportCtx.translate(layer.x, layer.y);
            exportCtx.rotate((layer.rotation * Math.PI) / 180);
            exportCtx.scale(drawScale, drawScale);

            if (layer.eraserPaths && layer.eraserPaths.length > 0) {
              const tmp = document.createElement("canvas");
              tmp.width = imgW;
              tmp.height = imgH;
              const tCtx = tmp.getContext("2d");
              if (tCtx) {
                tCtx.drawImage(img, 0, 0, imgW, imgH);
                tCtx.globalCompositeOperation = "destination-out";
                tCtx.lineCap = "round";
                tCtx.lineJoin = "round";
                tCtx.strokeStyle = "rgba(0,0,0,1)";
                layer.eraserPaths.forEach((path: any) => {
                  tCtx.lineWidth = path.size;
                  tCtx.beginPath();
                  path.points.forEach((pt: any, i: number) => {
                    if (i === 0) tCtx.moveTo(pt.x, pt.y);
                    else tCtx.lineTo(pt.x, pt.y);
                  });
                  tCtx.stroke();
                });
                exportCtx.drawImage(tmp, -imgW / 2, -imgH / 2, imgW, imgH);
              } else {
                exportCtx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
              }
            } else {
              exportCtx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
            }
            exportCtx.restore();
          });

          // 3. Draw active text decals (activeDecalTexture) if they exist
          if (activeDecalTexture && activeDecalTexture.image) {
            exportCtx.drawImage(activeDecalTexture.image as HTMLCanvasElement, 0, 0);
          }

          // 4. Draw active logo decals (type === "logo" or undefined)
          const sideLogoLayers = logoLayers.filter(
            (l) => (l.side === activeSideName || l.side === "Both") && (l.type === "logo" || !l.type)
          );
          sideLogoLayers.forEach((layer) => {
            const img = loadedLogoImages[layer.src];
            if (!img) return;
            const imgW = img.naturalWidth || img.width || 200;
            const imgH = img.naturalHeight || img.height || 200;
            const opacity = typeof layer.opacity === "number" ? layer.opacity : 1.0;
            const drawScale = layer.scale;

            exportCtx.save();
            exportCtx.imageSmoothingEnabled = true;
            exportCtx.imageSmoothingQuality = "high";
            exportCtx.globalAlpha = opacity;
            exportCtx.translate(layer.x, layer.y);
            exportCtx.rotate((layer.rotation * Math.PI) / 180);
            exportCtx.scale(drawScale, drawScale);

            if (layer.eraserPaths && layer.eraserPaths.length > 0) {
              const tmp = document.createElement("canvas");
              tmp.width = imgW;
              tmp.height = imgH;
              const tCtx = tmp.getContext("2d");
              if (tCtx) {
                tCtx.drawImage(img, 0, 0, imgW, imgH);
                tCtx.globalCompositeOperation = "destination-out";
                tCtx.lineCap = "round";
                tCtx.lineJoin = "round";
                tCtx.strokeStyle = "rgba(0,0,0,1)";
                layer.eraserPaths.forEach((path: any) => {
                  tCtx.lineWidth = path.size;
                  tCtx.beginPath();
                  path.points.forEach((pt: any, i: number) => {
                    if (i === 0) tCtx.moveTo(pt.x, pt.y);
                    else tCtx.lineTo(pt.x, pt.y);
                  });
                  tCtx.stroke();
                });
                exportCtx.drawImage(tmp, -imgW / 2, -imgH / 2, imgW, imgH);
              } else {
                exportCtx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
              }
            } else {
              exportCtx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
            }
            exportCtx.restore();
          });

          const dataURL = exportCanvas.toDataURL("image/png");
          triggerLocalDownload(dataURL, "jersey-print-template.png");
        }
      } catch (err) {
        console.error("Error capturing flat print template:", err);
      }
    }, 300);

    // 3. Download Configuration State as JSON file (Staggered by 600ms)
    setTimeout(() => {
      try {
        const configData = {
          selectedDesign,
          generalState: state,
          textLayers,
          logoLayers,
          timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(configData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        triggerLocalDownload(url, "jersey-config.json");
      } catch (err) {
        console.error("Error downloading config JSON:", err);
      }
    }, 600);
  };

  const currentPattern =
    JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.pattern ?? "plain";

  return (
    <div className="flex h-screen w-full bg-white flex-col md:flex-row" data-lenis-prevent>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200">
        <Link href="/" className="text-zinc-600">
          <ChevronLeft />
        </Link>
        <div className="font-bold">Jersey Builder</div>
      </div>

      {/* ── Icon Sidebar ── */}
      <Sidebar />

      {/* ── Settings Panel ── */}
      <div className="w-full md:w-80 bg-white border-r border-zinc-200 flex flex-col h-full z-10 shadow-lg">
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/60">
          <h2 className="text-xl font-bold text-[#00263C] capitalize">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-[#00263C] mt-0.5">Customize your jersey</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "designs" && <TabDesigns />}
              {activeTab === "colors" && <TabColors />}
              {activeTab === "patterns" && <TabPatterns />}
              {activeTab === "text" && <TabText />}
              {activeTab === "logos" && <TabUpload />}
              {activeTab === "style" && <TabStyle showModelSelector={true} />}
              {activeTab === "fabric" && <TabFabric />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <div
        className="flex-1 relative flex flex-col"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${state.primary}18 0%, #f0f0f0 65%)`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 z-10 pointer-events-none">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all cursor-pointer">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all cursor-pointer">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Design name badge */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-white/80 backdrop-blur-sm text-xs font-bold text-zinc-700 px-3 py-1.5 rounded-full shadow border border-zinc-200 capitalize">
            {JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.label ?? "Custom"} Design
            {state.collar ? ` • ${state.collarType} Collar` : ""}
            {state.collar && (state.collarType === "Polo" || state.collarType === "Henley")
              ? ` (${state.zipper ? "Zipper" : "Buttons"})`
              : ""}
          </span>
        </div>

        {/* 3D Canvas Viewer */}
        <ThreeViewer threeRef={threeRef} texturesRef={texturesRef} />

        {/* View controller bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-black/5 z-10">
          <button
            onClick={() => setCurrentView("front")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${currentView === "front" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"
              }`}
          >
            Front
          </button>
          <button
            onClick={() => setCurrentView("back")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${currentView === "back" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"
              }`}
          >
            Back
          </button>
          <button
            onClick={() => setCurrentView("sleeves")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${currentView === "sleeves" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"
              }`}
          >
            Sleeves
          </button>
          <button
            onClick={() => setCurrentView("360")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${currentView === "360" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"
              }`}
          >
            360° View
          </button>
        </div>
      </div>

      {/* ── Right Pricing Panel ── */}
      <SummaryPanel />
    </div>
  );
}

export default CustomizerLayout;
