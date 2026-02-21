---
name: blender-3d
description: >
  Use this skill when working with Blender via MCP tools — scene manipulation,
  asset creation, AI model generation, texture application, and glTF export
  for Eve's Garden. Activates for any Blender-related task or 3D asset pipeline work.
version: 1.0
priority: HIGH
---

# Blender 3D Asset Pipeline

## Purpose

Control Blender programmatically via MCP tools to create, modify, and export
game-ready 3D assets for Eve's Garden (isometric Three.js/R3F web game).

## When to Activate

- User asks to create or modify 3D models/assets in Blender
- User wants to set up a Blender scene
- User requests AI-generated 3D models (Hyper3D, Hunyuan3D)
- User wants to import assets from Polyhaven or Sketchfab
- User needs to export assets for the web game
- User references Blender Python scripting (bpy API)

---

## Core Principles

### 1. Always Inspect Before Modifying

```
get_scene_info → understand current state
get_object_info → inspect specific objects
get_viewport_screenshot → visual verification
```

Never blindly execute code without knowing the scene state.

### 2. Break Code Into Small Chunks

```python
# WRONG: One massive script
execute_blender_code(code="""
import bpy
# ... 200 lines of code ...
""")
```

```python
# CORRECT: Step-by-step execution
# Step 1: Clear scene
execute_blender_code(code="bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete()")

# Step 2: Verify
get_viewport_screenshot()

# Step 3: Create object
execute_blender_code(code="bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,0))")

# Step 4: Verify
get_viewport_screenshot()
```

### 3. Web-First Asset Design

All assets target browser rendering via Three.js:

| Metric | Budget |
|--------|--------|
| Character parts | 50-200 tris each |
| Collectibles | 100-500 tris |
| Props | 200-1000 tris |
| Textures | 512x512 max (1k rare) |
| Format | glTF/GLB |
| Materials | Simple PBR (color + roughness) |

### 4. Eve's Garden Style Consistency

Match the existing low-poly, vibrant aesthetic:

```python
# Eve's Garden color constants for Blender materials
COLORS = {
    "bg": (0.039, 0.039, 0.071, 1.0),       # #0a0a12
    "tile_base": (0.165, 0.125, 0.314, 1.0), # #2a2050
    "accent": (0.486, 0.361, 0.988, 1.0),    # #7c5cfc
    "highlight": (0.655, 0.545, 0.980, 1.0), # #a78bfa
    "glow": (0.424, 0.361, 0.906, 1.0),      # #6c5ce7
    "success": (0.290, 0.855, 0.502, 1.0),   # #4ade80
    "warning": (0.961, 0.620, 0.043, 1.0),   # #f59e0b
}
```

---

## MCP Tool Reference

### Scene Inspection

| Tool | Use Case |
|------|----------|
| `get_scene_info` | Overview of all objects, cameras, lights |
| `get_object_info(object_name)` | Detailed info on a specific object |
| `get_viewport_screenshot(max_size)` | Visual capture of 3D viewport |

### Code Execution

| Tool | Use Case |
|------|----------|
| `execute_blender_code(code)` | Run Python (bpy) in Blender |

### Polyhaven Assets (CC0)

| Tool | Use Case |
|------|----------|
| `get_polyhaven_status` | Check if integration is enabled |
| `get_polyhaven_categories(asset_type)` | List categories (hdris/textures/models) |
| `search_polyhaven_assets(asset_type, categories)` | Find assets |
| `download_polyhaven_asset(asset_id, asset_type, resolution)` | Download and import |
| `set_texture(object_name, texture_id)` | Apply downloaded texture to object |

### Sketchfab Models

| Tool | Use Case |
|------|----------|
| `get_sketchfab_status` | Check if integration is enabled |
| `search_sketchfab_models(query, count)` | Search for models |
| `get_sketchfab_model_preview(uid)` | Preview thumbnail |
| `download_sketchfab_model(uid, target_size)` | Download and import |

### AI Generation — Hyper3D Rodin

| Tool | Use Case |
|------|----------|
| `get_hyper3d_status` | Check availability |
| `generate_hyper3d_model_via_text(text_prompt, bbox_condition)` | Generate from text |
| `generate_hyper3d_model_via_images(input_image_paths/urls)` | Generate from image |
| `poll_rodin_job_status(subscription_key/request_id)` | Check generation progress |
| `import_generated_asset(name, task_uuid/request_id)` | Import completed model |

### AI Generation — Hunyuan3D

| Tool | Use Case |
|------|----------|
| `get_hunyuan3d_status` | Check availability |
| `generate_hunyuan3d_model(text_prompt, input_image_url)` | Generate from text/image |
| `poll_hunyuan_job_status(job_id)` | Check generation progress |
| `import_generated_asset_hunyuan(name, zip_file_url)` | Import completed model |

---

## Common Workflows

### Create a New Game Asset

```
1. get_scene_info                          → understand current scene
2. execute_blender_code (clear/setup)      → prepare workspace
3. execute_blender_code (model)            → create geometry
4. get_viewport_screenshot                 → verify shape
5. execute_blender_code (materials)        → apply Eve's Garden colors
6. get_viewport_screenshot                 → verify appearance
7. execute_blender_code (export glTF)      → export for web
```

### Import and Adapt External Model

```
1. search_sketchfab_models / search_polyhaven_assets  → find asset
2. get_sketchfab_model_preview                        → visual check
3. download_sketchfab_model (with target_size)        → import
4. get_scene_info                                     → inspect imported objects
5. execute_blender_code (decimate if needed)           → optimize for web
6. execute_blender_code (re-material)                  → match Eve's Garden style
7. execute_blender_code (export glTF)                  → export
```

### AI-Generate a Custom Asset

```
1. get_hyper3d_status / get_hunyuan3d_status           → check availability
2. generate_hyper3d_model_via_text (descriptive prompt) → start generation
3. poll_rodin_job_status (loop until Done)              → wait for completion
4. import_generated_asset                               → bring into Blender
5. get_viewport_screenshot                              → verify result
6. execute_blender_code (cleanup/decimate)              → optimize
7. execute_blender_code (re-material + export)          → finalize
```

---

## Blender Python Quick Reference

### Object Manipulation

```python
# Select by name
obj = bpy.data.objects["MyObject"]
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Transform
obj.location = (1.0, 0.0, 0.5)
obj.rotation_euler = (0, 0, 1.5708)  # 90 degrees in radians
obj.scale = (0.85, 0.85, 0.85)

# Apply transforms (important before export)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
```

### Decimate for Web

```python
# Add decimate modifier to reduce poly count
mod = obj.modifiers.new("Decimate", 'DECIMATE')
mod.ratio = 0.5  # reduce to 50% of original
bpy.ops.object.modifier_apply(modifier="Decimate")
```

### Simple PBR Material

```python
mat = bpy.data.materials.new(name="GameMaterial")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.486, 0.361, 0.988, 1.0)  # accent purple
bsdf.inputs["Roughness"].default_value = 0.6
bsdf.inputs["Metallic"].default_value = 0.0
obj.data.materials.append(mat)
```

### Emissive Material (for Collectibles)

```python
mat = bpy.data.materials.new(name="GlowMaterial")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.424, 0.361, 0.906, 1.0)  # glow purple
bsdf.inputs["Emission Color"].default_value = (0.424, 0.361, 0.906, 1.0)
bsdf.inputs["Emission Strength"].default_value = 0.5
obj.data.materials.append(mat)
```

---

## Verification Checklist

Before considering a Blender task complete:

- [ ] Viewport screenshot confirms visual correctness
- [ ] Poly count is within budget for target asset type
- [ ] Materials use Eve's Garden color palette
- [ ] Objects have descriptive names (not "Cube.001")
- [ ] Transforms are applied before export
- [ ] Export format is glTF/GLB
- [ ] Exported file size is reasonable for web (<1MB per asset)

---

## Anti-Patterns

- Executing large monolithic scripts without intermediate verification
- Importing high-poly models without decimation
- Using complex shader node setups (won't translate to web)
- Forgetting to apply transforms before export
- Leaving default names on objects and materials
- Skipping `get_viewport_screenshot` after visual changes
- Not checking integration status before using Polyhaven/Sketchfab/AI tools
