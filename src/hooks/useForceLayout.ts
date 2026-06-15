import { useEffect, useRef } from 'react';
import * as d3Force3d from 'd3-force-3d';
import { OrgNode, Vec3 } from '@/types';

const forceSimulation = (d3Force3d as any).default || d3Force3d.forceSimulation || d3Force3d;
const forceLink = (d3Force3d as any).forceLink || (d3Force3d as any).default?.forceLink;
const forceManyBody = (d3Force3d as any).forceManyBody || (d3Force3d as any).default?.forceManyBody;
const forceCenter = (d3Force3d as any).forceCenter || (d3Force3d as any).default?.forceCenter;
const forceCollide = (d3Force3d as any).forceCollide || (d3Force3d as any).default?.forceCollide;

interface SimNode {
  id: string;
  x: number;
  y: number;
  z: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
  ref: OrgNode;
}

export function useForceLayout(
  root: OrgNode | null,
  enabled: boolean,
  onUpdate: (positions: Map<string, Vec3>) => void,
) {
  const simRef = useRef<any>(null);
  const nodesRef = useRef<SimNode[]>([]);

  useEffect(() => {
    if (!root || !enabled) {
      if (simRef.current) simRef.current.stop();
      return;
    }

    const nodes: SimNode[] = [];
    const links: { source: string; target: string; value: number }[] = [];

    const walk = (n: OrgNode) => {
      nodes.push({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        z: n.position.z,
        fx: n.type === 'company' ? n.position.x : undefined,
        fy: n.type === 'company' ? n.position.y : undefined,
        fz: n.type === 'company' ? n.position.z : undefined,
        ref: n,
      });
      n.children.forEach((c) => {
        links.push({ source: n.id, target: c.id, value: c.employeeCount / 50 + 1 });
        walk(c);
      });
    };
    walk(root);
    nodesRef.current = nodes;

    const sim = forceSimulation(nodes)
      .force('link', forceLink(links).id((d: any) => d.id).distance(20).strength(0.5))
      .force('charge', forceManyBody().strength(-80))
      .force('center', forceCenter(root.position.x, root.position.y, root.position.z))
      .force('collide', forceCollide(8))
      .stop();

    for (let i = 0; i < 80; i++) sim.tick();

    sim.on('tick', () => {
      const map = new Map<string, Vec3>();
      nodes.forEach((n) => map.set(n.id, { x: n.x, y: n.y, z: n.z }));
      onUpdate(map);
    });

    simRef.current = sim;
    sim.alpha(0.8).restart();

    return () => {
      sim.stop();
    };
  }, [root, enabled, onUpdate]);

  const reheat = () => {
    if (simRef.current) simRef.current.alpha(0.5).restart();
  };

  return { reheat };
}
