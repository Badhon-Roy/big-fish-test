import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    useGLTF,
    Environment,
    ContactShadows,
    PresentationControls,
    Float,
    Center
} from '@react-three/drei';
import * as THREE from 'three';

// -------------------------------------------------------------
// This component handles the actual Jersey model and its materials.
// To use this code, you will need a 3D model designed in software like 
// Blender or Clo3D, exported as a .gltf or .glb.
// Ensure your model has separate meshes for "Torso", "Sleeves", and "Collar" 
// to achieve the disconnected floating effect.
// -------------------------------------------------------------
function FloatingJersey({ colors = { primary: '#111111', neon: '#ff0033', logo: '#ffffff' } }) {
    const group = useRef<THREE.Group>(null);

    // NOTE: Replace '/models/separated_jersey.glb' with the path to your actual 3D model.
    // const { nodes, materials } = useGLTF('/models/separated_jersey.glb');

    // Animation loop to add slight rotation and breathing/wind effect
    useFrame((state, delta) => {
        if (group.current) {
            // Gentle wind/rotation variation
            const time = state.clock.getElapsedTime();
            group.current.rotation.y = Math.sin(time * 0.2) * 0.1;
            group.current.position.y = Math.sin(time * 0.5) * 0.05;
        }
    });

    // Simulated PBR Materials
    const jerseyMaterial = new THREE.MeshPhysicalMaterial({
        color: colors.primary,
        roughness: 0.8,
        metalness: 0.1,
        clearcoat: 0.05,
        clearcoatRoughness: 0.8,
    });

    const neonTrimMaterial = new THREE.MeshStandardMaterial({
        color: colors.neon,
        emissive: colors.neon,
        emissiveIntensity: 2,
        toneMapped: false,
    });

    return (
        <group ref={group} dispose={null}>
            {/* 
        The Float component adds organic, slow-moving hovering effects.
        We wrap different parts in their own floats for the "magnetic levitation" feel.
      */}

            {/* Torso */}
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh castShadow receiveShadow geometry={new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32)} material={jerseyMaterial} />
                {/* Placeholder for Torso mesh: */}
                {/* <mesh geometry={nodes.Torso.geometry} material={jerseyMaterial} /> */}
            </Float>

            {/* Left Sleeve - Floating separately */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
                <mesh position={[-0.6, 0.2, 0]} castShadow receiveShadow geometry={new THREE.CylinderGeometry(0.15, 0.15, 0.5, 32)} material={jerseyMaterial} />
                {/* <mesh position={[-0.6, 0, 0]} geometry={nodes.LeftSleeve.geometry} material={jerseyMaterial} /> */}
            </Float>

            {/* Right Sleeve - Floating separately */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
                <mesh position={[0.6, 0.2, 0]} castShadow receiveShadow geometry={new THREE.CylinderGeometry(0.15, 0.15, 0.5, 32)} material={jerseyMaterial} />
                {/* <mesh position={[0.6, 0, 0]} geometry={nodes.RightSleeve.geometry} material={jerseyMaterial} /> */}
            </Float>

            {/* Collar - Floating at the top */}
            <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
                <mesh position={[0, 0.7, 0]} castShadow receiveShadow geometry={new THREE.TorusGeometry(0.2, 0.05, 16, 32)} material={neonTrimMaterial} />
                {/* <mesh position={[0, 0.8, 0]} geometry={nodes.Collar.geometry} material={neonTrimMaterial} /> */}
            </Float>
        </group>
    );
}

// -------------------------------------------------------------
// The Scene setup with cinematic dark environment, lighting and camera.
// -------------------------------------------------------------
export default function CinematicJerseyScene() {
    return (
        <div className="w-full h-full min-h-[600px] bg-gradient-to-b from-[#0a0a0a] to-[#000000] rounded-2xl overflow-hidden relative border border-white/5">

            {/* Background radial glow */}
            <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

            <Canvas
                shadows
                camera={{ position: [0, 0, 4.5], fov: 40 }}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
                <color attach="background" args={['#000000']} />

                {/* Environment map for high-quality reflections on materials */}
                <Environment preset="city" environmentIntensity={0.2} />

                {/* Cinematic Lighting Setup */}
                <ambientLight intensity={0.2} />

                {/* Soft top light */}
                <spotLight
                    position={[0, 5, 0]}
                    intensity={2}
                    angle={0.6}
                    penumbra={1}
                    castShadow
                    shadow-bias={-0.0001}
                />

                {/* Dramatic rim light (back/side) for silhouette */}
                <spotLight
                    position={[-3, 2, -2]}
                    intensity={3}
                    angle={0.5}
                    penumbra={1}
                    color="#ff0033"
                />
                <spotLight
                    position={[3, 2, -2]}
                    intensity={1.5}
                    angle={0.5}
                    penumbra={1}
                    color="#ffffff"
                />

                {/* Presentation controls for luxury ecommerce rotation feeling */}
                <PresentationControls
                    global
                    snap={true}
                    rotation={[0, 0, 0]}
                    polar={[-Math.PI / 12, Math.PI / 12]}
                    azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                    <Center top>
                        <FloatingJersey />
                    </Center>
                </PresentationControls>

                {/* High-quality ground shadows beneath the jersey */}
                <ContactShadows
                    position={[0, -1.8, 0]}
                    opacity={0.8}
                    scale={5}
                    blur={2.5}
                    far={4}
                    color="#000000"
                />
            </Canvas>

            {/* Optional fog atmosphere overlay can be added here using CSS or inside R3F */}
        </div>
    );
}

// Preload the model
// useGLTF.preload('/models/separated_jersey.glb');
