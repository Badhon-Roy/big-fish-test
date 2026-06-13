# Implementation Summary: 3D Jersey Customization System

This document details the architecture and implementation of the real-time dynamic text and logo customization systems, featuring unified visual interactive bounding box wrappers, layout persistence fixes, opacity controls, and border-free texture mapping with a dynamic Background Eraser.

---

## 1. Core Architecture Overview

We replaced the static inputs with a unified, **layer-based dynamic rendering system** for both text and logos. This system is backed by React state, synced in real-time to front/back 2D HTML5 canvas textures, and projected directly onto the 3D jersey model mesh as decals.

```mermaid
graph TD
    A[React State: textLayers & logoLayers] -->|User Interaction| B[Visual 2D Editors]
    B -->|Drag, Rotate, Scale, Copy, Delete, Opacity, Erase| A
    A -->|State Update| C[Canvas 2D Texture Generator]
    C -->|THREE.CanvasTexture| D[React Three Fiber Decal Material]
    D -->|Real-time update| E[3D Jersey Mesh Render]
```

---

## 2. Key Components & Features Implemented

### A. Unified Text & Logo Layer States

Both systems use structured states mapped to a 1024×1024 texture canvas:

- **id**: Unique identifier (e.g. system layers `"front-text"`, `"front-number"` or custom/logo layers).
- **src / text**: Content representation (Base64 data URL/SVG path for logos; string value for text).
- **x, y**: Coordinates on the 1024×1024 texture canvas.
- **scale**: Floating-point scale factor.
- **rotation**: Angle of rotation in degrees (0–360).
- **side**: Target side (`"Front"` or `"Back"`).
- **opacity**: Transparency value (0.0 to 1.0) for logos, allowing seamless blending with underlying patterns.
- **eraserPaths**: Array of custom draw/erasure stroke coordinates `{ points: Array<{ x: number, y: number }>, size: number }` stored in the logo local coordinate space, ensuring erasures scale, translate, and rotate alongside the logo artwork.

### B. Interactive Transform Wrapper UI (Visual Editor)

We implemented two identical 280x280px visual editors (Text tab and Logos tab) with glassmorphism styling:

- **Dotted Bounding Box**: Surrounds the selected layer (hidden when in Eraser Mode).
- **Top-Left Handle (Duplicate)**: Clones the layer with a slight coordinate offset.
- **Top-Right Handle (Rotate)**: Drag to rotate the layer relative to its center.
- **Bottom-Left Handle (Delete)**: Removes the layer.
- **Bottom-Right Handle (Scale/Resize)**: Drag away or towards the center to scale dynamically.
- **Main Body Drag**: Allows dragging the layer across the entire jersey body (front, back, sleeves, etc.) without boundaries.

### C. Segmented Front/Back Switcher & Presets

- Front/Back view switcher toggles both 3D camera angles and 2D canvas editors.
- Added quick-preset buttons (Left Chest, Center, Right Chest, Back Top, Back Center, Sleeve) which snap layers to precise canvas coordinates, auto-toggling the active view if the position is on the opposite side.

### D. Image/Logo Opacity (Transparency) Control

- **Opacity Range Slider**: A new range slider goes from 0% (Fully Transparent) to 100% (Fully Opaque).
- **2D Canvas Sync**: Applies `globalAlpha` to the HTML5 canvas context before drawing each logo.
- **HTML Element Preview Sync**: Applies the inline CSS `opacity` style directly to the active 2D visual editor elements.

### E. Dynamic Background Eraser System

- **Eraser Toggle Button**: Positioned in the Logos customization sidebar right **above the Upload Custom Logo container**. Active only when a logo layer is selected.
- **Brush Size Control**: A range slider (2px to 100px) appears dynamically when Eraser Mode is active to control the brush width.
- **Destination-Out Composite Operation**:
  - Draws eraser stroke coordinates onto a temporary offscreen canvas using `ctx.globalCompositeOperation = 'destination-out'` to make pixels 100% transparent.
  - Syncs the erased canvas outputs directly to both the **2D Visual Editor** and the **3D Decal Texture** in real-time.
  - Automatically disables bounding box handles and logo dragging while active, letting the user paint directly onto the image bounds using a custom SVG eraser icon cursor.

### F. Uncapped Logo Sizing & Scaling

- **Bypassed Drag Constraints**: Removed the hardcoded maximum scale limit (`5.0`) in `handleLogoScaleStart`, allowing users to scale images to infinitely large sizes (min: `0.01`).
- **Expanded Slider Range**: Uncapped the selected logo scale slider maximum threshold from `5.0` to `20.0` (min: `0.01`), allowing for micro-sizing and large zooming via the sidebar.
- **Off-Canvas Rendering Support**: Confirmed that HTML5 Canvas 2D draws offscreen bounds natively, allowing logo graphics to bleed off the 2D workspace editor coordinates while maintaining seamless texture projections onto the 3D jersey model.

### G. Client-Side Multi-Format Export System

We implemented a unified, 100% client-side export system that triggers native browser downloads for three distinct formats without relying on a backend server or API:

1. **Client-Side 3D Canvas Snapshot (`jersey-3d-preview.png`)**:
   - Initialized the Three.js WebGLRenderer context with `preserveDrawingBuffer: true` so the WebGL canvas doesn't clear its buffer and return a black image when sampled.
   - Used a child component `ThreeGrabber` inside the React Three Fiber `<Canvas>` tree to expose the active WebGL `renderer` (gl), `scene`, and `camera` context references to the parent customizer component via a React `useRef`.
   - On export, forces a synchronous render pass (`gl.render(scene, camera)`) to ensure the canvas buffer is up-to-date and instantly extracts the high-resolution data URL (`gl.domElement.toDataURL('image/png')`).

2. **Client-Side Flat Production Texture Export (`jersey-print-template.png`)**:
   - Exposed the internal 2D HTML5 canvas texture elements generated inside `useJerseyDecals` to the parent component using a state/ref callback on `<Jersey3D>`.
   - Targets the texture canvas matching the active customizer side (Front or Back) and extracts the flat high-resolution texture map using `canvas.toDataURL('image/png')`, outputting the exact layout including shapes, graphics, custom shadows, and text borders.

3. **Download Configuration State (`jersey-config.json`)**:
   - Compiles the entire React customizer state schema (including `textLayers`, `logoLayers`, base styles, neck/collar styles, colors, selected design layouts, and metadata timestamps) into a structured JSON configuration object.
   - Serializes the JavaScript object into a JSON string, wraps it in a secure Web `Blob` with `type: 'application/json'`, creates a temporary URL via `URL.createObjectURL(blob)`, programmatically clicks a link to trigger the download, and cleans up the memory immediately using `URL.revokeObjectURL(url)`.

---

## 3. Bug Fixes & Rendering Enhancements

We identified and resolved three critical rendering and layering issues in the 3D customizer decals:

### Bug 1: Text & Logos Z-Index/Layering Issue on Pattern Change

- **Problem**: Selecting a pattern loaded a new pattern decal which co-planarly overlapped text and logos, rendering them underneath the pattern.
- **Fix**: Assigned explicit `renderOrder` sorting keys to the R3F `<Decal>` components. The pattern decals are assigned `renderOrder={1}`, while text, number, and logo decals are painted on front/back canvases at `renderOrder={10}`, guaranteeing they draw on top of patterns.

### Bug 2: Customization Disappearing on New Design Selection

- **Problem**: Selecting a layout design (like "Victory") rendering a solid background design decal covered customization layers completely because they were co-planar and drawn out of order.
- **Fix**: React states (`textLayers` and `logoLayers`) are fully preserved and persist during design selections. The `renderOrder={10}` on canvas decals and `renderOrder={1}` on design/pattern decals ensures that the customization layer is always drawn on top of the base design pattern.

### Bug 3: Thin Rectangular Border Outline Around Uploaded Images

- **Problem**: Uploaded images with solid backgrounds (such as a white background on a white jersey) displayed an unwanted thin grey/black rectangular border line on the 3D mesh due to Three.js texture mipmapping, wrapping, and canvas subpixel smoothing.
- **Fix**:
  1. **Disable Canvas Object Stroke**: Set `ctx.strokeStyle = "transparent"`, `ctx.lineWidth = 0`, and `ctx.shadowBlur = 0` during 2D canvas rendering to ensure zero border or stroke path residue.
  2. **Image Smoothing Fix**: Enabled high-quality image smoothing (`ctx.imageSmoothingEnabled = true`, `ctx.imageSmoothingQuality = "high"`) to eliminate pixel edges.
  3. **Canvas Texture Clamping & Filter Settings**: Configured the exported `THREE.CanvasTexture` with `wrapS = ClampToEdgeWrapping`, `wrapT = ClampToEdgeWrapping`, `generateMipmaps = false`, and `minFilter`/`magFilter` set to `THREE.LinearFilter`. This prevents texture mapping sample bleed at the boundaries of the Projected Decal, removing any visible edge lines.

### Bug 4: Aspect Ratio Distortion and Artificial Bounding Constraints

- **Problem**: Uploaded images were previously forced into artificial square bounding boxes or strictly clamped maximum dimensions (e.g., `200x200`), causing native wide or tall graphics to squish, distort, or pad themselves with unnecessary empty space.
- **Fix**:
  1. **Removed Clamping Limits**: Completely stripped out `maxDimension`, `Math.min()` limitations, and default `baseSize` bounding dimensions inside the texture generation algorithms and the visual control bounds.
  2. **Render Pure Native Dimensions**: Re-engineered `drawLayerOnCtx`, `LogoCanvasPreview`, and `renderLogoLayer` to compute width and height using purely the unadulterated source file properties (`img.naturalWidth` and `img.naturalHeight`), ensuring a 1:1 pixel fidelity aspect ratio translation natively on the canvas.
  3. **Relative Upload Scaling**: When a new image is instantiated in `handleAddLogoLayer`, the graphic loads at a clean relative percentage scale so it fits the canvas workspace without recalculating or compressing its physical pixel data.

### Bug 5: 3D Mesh UV Texture Squishing

- **Problem**: While the 2D visual layout rendered graphics flawlessly, the 3D jersey chest mesh was artificially compressing the projection horizontally (transforming wide logos into nearly circular shapes) due to an unequal Decal box projection scale (`[0.54, 0.7, 0.32]`).
- **Fix**: Introduced a dynamic 3D texture matrix offset multiplier. Since the mesh box horizontally squishes the map by a factor of exactly `0.54 / 0.70`, an inverse corrective scale was assigned to the active Decal mapping (`texture.repeat.set(0.54 / 0.7, 1)` and `texture.offset.set((1 - (0.54 / 0.7)) / 2, 0)`). This perfectly re-stretches the texture data horizontally so the 3D surface serves as a mirror-perfect mathematical projection of the 2D layout without dropping coordinates.

---

## 4. How to Verify

1. Run the local dev server: `npm run dev`
2. Customize the jersey: add text, add outlines, shadows, or upload custom logos.
3. Click the **Export** button in the top-right header menu.
4. Verify that three simultaneous downloads are initiated:
   - `jersey-3d-preview.png` (a snapshot of the 3D model canvas, preserving active angles).
   - `jersey-print-template.png` (the high-resolution flat 2D layout texture canvas).
   - `jersey-config.json` (the structured JavaScript design configuration file).
5. Navigate to the **Logos** tab to verify the **Background Eraser** functionality independently:
   - Toggle **Erase Pixels** to start erasing, select a brush size, and drag your cursor/finger on the canvas editor area to erase.
   - Toggle **Lock Drawing** to lock your edits and restore the normal bounding box controls.
