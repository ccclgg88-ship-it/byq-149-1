export interface LODLevel {
  distance: number;
  detail: 'high' | 'medium' | 'low';
  segments: number;
  showLabel: boolean;
  showEmployees: boolean;
}

export const LOD_LEVELS: LODLevel[] = [
  { distance: 0, detail: 'high', segments: 48, showLabel: true, showEmployees: true },
  { distance: 60, detail: 'medium', segments: 24, showLabel: true, showEmployees: true },
  { distance: 120, detail: 'low', segments: 12, showLabel: false, showEmployees: false },
  { distance: 200, detail: 'low', segments: 8, showLabel: false, showEmployees: false },
];

export function getLODLevel(cameraDistance: number): LODLevel {
  let level = LOD_LEVELS[0];
  for (const l of LOD_LEVELS) {
    if (cameraDistance >= l.distance) level = l;
  }
  return level;
}
