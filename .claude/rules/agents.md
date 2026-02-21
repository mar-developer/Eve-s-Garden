# Agent Orchestration

## Available Agents

Located in `.claude/agents/`:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| senior-planner | Implementation planning | Complex features, refactoring |
| senior-architect | System design | Architectural decisions |
| senior-tdd-engineer | Test-driven development | New features, bug fixes |
| senior-code-reviewer | Code review | After writing code |
| senior-security-reviewer | Security analysis | Before commits |
| senior-build-resolver | Fix build errors | When build fails |
| senior-e2e-tester | E2E testing | Critical user flows |
| senior-refactorer | Dead code cleanup | Code maintenance |
| senior-doc-updater | Documentation | Updating docs |
| senior-frontend | React/Tailwind development | Frontend work |
| senior-ui-ux | UI/UX design | Design work |
| senior-debugger | Debugging | Error investigation |
| senior-threejs | Three.js/WebGL 3D rendering | 3D scenes, meshes, animations |
| senior-blender | Blender 3D modeling/assets | Blender scenes, asset creation, export |

## Immediate Agent Usage

No user prompt needed:
1. Complex feature requests - Use **senior-planner** agent
2. Code just written/modified - Use **senior-code-reviewer** agent
3. Bug fix or new feature - Use **senior-tdd-engineer** agent
4. Architectural decision - Use **senior-architect** agent
5. 3D scene or Three.js work - Use **senior-threejs** agent
6. UI/UX design changes - Use **senior-ui-ux** agent
7. Build failures or type errors - Use **senior-build-resolver** agent
8. Blender scene or asset work - Use **senior-blender** agent

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of data handling
2. Agent 2: Performance review of Three.js scene
3. Agent 3: Type checking of utils.ts

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker

## Domain-Specific Agents

### Eve's Garden-Specific Agents

| Agent | Domain | Key Skills |
|-------|--------|------------|
| senior-threejs | 3D Game Scene | R3F components, Drei helpers, useFrame animations, isometric camera |
| senior-frontend | React/Next.js/UI | Components, Zustand stores, Tailwind, App Router |
| senior-ui-ux | Design | Game UI, design panel, HUD, responsive, accessibility |
| senior-blender | Blender 3D Assets | Scene manipulation, modeling, materials, glTF export, AI generation |

### Use When:

- **senior-threejs**: Building/modifying R3F scene components, declarative meshes, useFrame animations, lighting, collectibles
- **senior-frontend**: React components, Zustand stores, Next.js App Router, Tailwind styling, game logic
- **senior-ui-ux**: Game UI design, design panel, HUD layout, color palette, responsive design, accessibility
- **senior-blender**: Blender scene setup, 3D asset creation, Polyhaven/Sketchfab imports, AI model generation, glTF export for web
