"use client";

import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Center,
} from "@react-three/drei";
import { useCustomizerStore } from "./store";
import { Jersey3D } from "./Jersey3D";
import { JERSEY_DESIGNS } from "./types";

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
    return () => {
      threeRef.current = null;
    };
  }, [gl, scene, camera, threeRef]);
  return null;
}

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
      minDistance={0.6}
      maxDistance={7}
      autoRotate={currentView === "360"}
      autoRotateSpeed={5}
    />
  );
}

interface ThreeViewerProps {
  threeRef: React.MutableRefObject<{
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  } | null>;
  texturesRef: React.MutableRefObject<{
    front: THREE.CanvasTexture | null;
    back: THREE.CanvasTexture | null;
    patternFront?: THREE.CanvasTexture | null;
    patternBack?: THREE.CanvasTexture | null;
  }>;
}

export function ThreeViewer({ threeRef, texturesRef }: ThreeViewerProps) {
  const state = useCustomizerStore((s) => s.state);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const loadedLogoImages = useCustomizerStore((s) => s.loadedLogoImages);
  const layersOrder = useCustomizerStore((s) => s.layersOrder);
  const currentView = useCustomizerStore((s) => s.currentView);
  const loadedPatterns = useCustomizerStore((s) => s.loadedPatterns);
  const designPattern = useCustomizerStore((s) => s.selectedDesign);

  const colors = useMemo(() => {
    const currentPattern =
      JERSEY_DESIGNS.find((d) => d.id === designPattern)?.pattern ?? "plain";
    return {
      ...state,
      designPattern: currentPattern,
      loadedPatterns,
      textLayers,
      logoLayers,
      loadedLogoImages,
      layersOrder,
    };
  }, [
    state,
    textLayers,
    logoLayers,
    loadedLogoImages,
    layersOrder,
    loadedPatterns,
    designPattern,
  ]);

  return (
    <div
      className="flex-1 relative flex flex-col"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${state.primary}18 0%, #f0f0f0 65%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 0.1, 4], fov: 38 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{
          antialias: true,
          toneMapping: THREE.NoToneMapping,
          preserveDrawingBuffer: true,
        }}
      >
        <ThreeGrabber threeRef={threeRef} />
        <color attach="background" args={["transparent" as any]} />
        <ambientLight intensity={1.0} />
        <Environment preset="city" />
        <directionalLight position={[1, 4, 5]} intensity={0.3} castShadow />
        <directionalLight position={[-1, 3, -5]} intensity={0.2} />
        <pointLight position={[-3, 1, 2]} intensity={0.2} />
        <pointLight position={[3, 1, -2]} intensity={0.2} />
        <Center>
          <Jersey3D
            texturesRef={texturesRef}
            colors={colors}
            collar={state.collar}
          />
        </Center>
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.3}
          scale={8}
          blur={3}
        />
        <ViewHandler currentView={currentView} />
      </Canvas>
    </div>
  );
}
