import { EmployeeLevel, DivisionColor, OrgNodeType } from '@/types';

export const DIVISION_COLORS: DivisionColor[] = [
  { id: 'div-tech', name: '技术事业部', primary: '#6366f1', secondary: '#818cf8' },
  { id: 'div-product', name: '产品事业部', primary: '#ec4899', secondary: '#f472b6' },
  { id: 'div-market', name: '市场事业部', primary: '#f59e0b', secondary: '#fbbf24' },
  { id: 'div-ops', name: '运营事业部', primary: '#10b981', secondary: '#34d399' },
  { id: 'div-hr', name: '人力行政', primary: '#8b5cf6', secondary: '#a78bfa' },
];

export const LEVEL_COLORS: Record<EmployeeLevel, string> = {
  P5: '#60a5fa',
  P6: '#34d399',
  P7: '#fbbf24',
  P8: '#f97316',
  P9: '#ef4444',
};

export const LEVEL_SIZE: Record<EmployeeLevel, number> = {
  P5: 0.25,
  P6: 0.3,
  P7: 0.38,
  P8: 0.46,
  P9: 0.55,
};

export const NODE_BASE_SIZE: Record<OrgNodeType, number> = {
  company: 6,
  division: 4,
  department: 2.5,
  team: 1.5,
};

export function getDivisionColor(divisionId: string): DivisionColor {
  return DIVISION_COLORS.find((d) => d.id === divisionId) ?? DIVISION_COLORS[0];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 1, g: 1, b: 1 };
}
