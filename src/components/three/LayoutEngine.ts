import { OrgNode, Vec3, OrgNodeType } from '@/types';

const LAYER_SPACING: Record<OrgNodeType, number> = {
  company: 20,
  division: 20,
  department: 15,
  team: 12,
};

function getSpacing(parentType: OrgNodeType): number {
  if (parentType === 'company') return LAYER_SPACING.company;
  if (parentType === 'division') return LAYER_SPACING.department;
  if (parentType === 'department') return LAYER_SPACING.team;
  return 10;
}

export function computeTreeLayout(root: OrgNode): Map<string, Vec3> {
  const positions = new Map<string, Vec3>();

  function layoutNode(node: OrgNode, parentPos: Vec3, depth: number) {
    positions.set(node.id, { ...parentPos });

    if (node.children.length === 0) return;

    const spacing = getSpacing(node.type);
    const childCount = node.children.length;

    node.children.forEach((child, index) => {
      const angle = (index / childCount) * Math.PI * 2;
      const radius = spacing * (1 + depth * 0.15);

      const childPos: Vec3 = {
        x: parentPos.x + Math.cos(angle) * radius,
        y: parentPos.y + Math.sin(angle) * radius,
        z: parentPos.z + (index % 2 === 0 ? 1 : -1) * spacing * 0.3,
      };

      layoutNode(child, childPos, depth + 1);
    });
  }

  const rootPos: Vec3 = { x: 0, y: 0, z: 0 };
  layoutNode(root, rootPos, 0);

  return positions;
}

export function computeFlatLayout(root: OrgNode): Map<string, Vec3> {
  const positions = new Map<string, Vec3>();
  const divisionGroups = new Map<string, OrgNode[]>();

  function collectDivisions(node: OrgNode) {
    if (!divisionGroups.has(node.divisionId)) {
      divisionGroups.set(node.divisionId, []);
    }
    divisionGroups.get(node.divisionId)!.push(node);

    node.children.forEach(collectDivisions);
  }

  collectDivisions(root);

  const divisionIds = Array.from(divisionGroups.keys());
  const cols = Math.ceil(Math.sqrt(divisionIds.length));
  const groupSpacing = 40;

  divisionIds.forEach((divId, groupIndex) => {
    const nodes = divisionGroups.get(divId)!;
    const col = groupIndex % cols;
    const row = Math.floor(groupIndex / cols);
    const groupOriginX = col * groupSpacing - (cols * groupSpacing) / 2;
    const groupOriginY = row * groupSpacing - (Math.ceil(divisionIds.length / cols) * groupSpacing) / 2;

    const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));
    nodes.forEach((node, nodeIndex) => {
      const nCol = nodeIndex % nodesPerRow;
      const nRow = Math.floor(nodeIndex / nodesPerRow);
      positions.set(node.id, {
        x: groupOriginX + nCol * 8,
        y: groupOriginY + nRow * 8,
        z: 0,
      });
    });
  });

  return positions;
}

export function applyLayout(root: OrgNode, positions: Map<string, Vec3>) {
  function applyNode(node: OrgNode) {
    const pos = positions.get(node.id);
    if (pos) {
      node.targetPosition = { ...pos };
    }
    node.children.forEach(applyNode);
  }

  applyNode(root);
}
