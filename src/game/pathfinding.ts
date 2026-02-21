import type { GridPosition, TileGrid } from "@/types";
import { VANISHING_TILE_POSITIONS } from "@/game/constants";

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

/**
 * BFS pathfinding on the tile grid.
 * Returns an array of grid positions from start (exclusive) to end (inclusive),
 * or null if no path exists.
 *
 * @param vanished - Set of "x,z" keys for currently vanished tiles to avoid.
 */
export function findPath(
  start: GridPosition,
  end: GridPosition,
  layout: TileGrid,
  vanished?: Set<string>,
): GridPosition[] | null {
  const rows = layout.length;
  const cols = layout[0].length;

  // Validate target
  if (
    end.z < 0 ||
    end.z >= rows ||
    end.x < 0 ||
    end.x >= cols ||
    !layout[end.z][end.x]
  ) {
    return null;
  }

  // Cannot path to a vanished tile
  if (vanished?.has(`${end.x},${end.z}`)) {
    return null;
  }

  // Same tile
  if (start.x === end.x && start.z === end.z) return null;

  const visited = new Set<string>();
  const queue: [number, number, GridPosition[]][] = [
    [start.x, start.z, []],
  ];
  visited.add(`${start.x},${start.z}`);

  while (queue.length > 0) {
    const [cx, cz, path] = queue.shift()!;

    if (cx === end.x && cz === end.z) {
      return [...path, { x: end.x, z: end.z }];
    }

    for (const [dx, dz] of DIRECTIONS) {
      const nx = cx + dx;
      const nz = cz + dz;
      const key = `${nx},${nz}`;

      if (
        nx >= 0 &&
        nx < cols &&
        nz >= 0 &&
        nz < rows &&
        layout[nz][nx] === 1 &&
        !visited.has(key) &&
        !vanished?.has(key)
      ) {
        visited.add(key);
        queue.push([nx, nz, [...path, { x: cx, z: cz }]]);
      }
    }
  }

  return null;
}

/**
 * Check if a given position is a vanishing tile.
 */
export function isVanishingTile(x: number, z: number): boolean {
  return VANISHING_TILE_POSITIONS.some((p) => p.x === x && p.z === z);
}
