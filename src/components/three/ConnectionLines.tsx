import { useMemo } from 'react';
import * as THREE from 'three';
import { OrgNode } from '@/types';
import { getDivisionColor, hexToRgb } from '@/utils/colorUtils';

interface ConnectionLinesProps {
  root: OrgNode;
  visibleIds: Set<string>;
}

const CURVE_SEGMENTS = 20;
const LINE_BATCH_THRESHOLD = 50;

function collectVisiblePairs(
  node: OrgNode,
  visibleIds: Set<string>,
  pairs: { parent: OrgNode; child: OrgNode }[]
) {
  if (!visibleIds.has(node.id)) return;

  node.children.forEach((child) => {
    if (visibleIds.has(child.id)) {
      pairs.push({ parent: node, child });
    }
    collectVisiblePairs(child, visibleIds, pairs);
  });
}

function createCurvePoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments: number
): Float32Array {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(end, start);
  const up = new THREE.Vector3(0, 1, 0);
  const perpendicular = new THREE.Vector3().crossVectors(dir, up).normalize();

  const dist = start.distanceTo(end);
  const controlPoint = mid
    .clone()
    .add(perpendicular.multiplyScalar(dist * 0.15))
    .add(new THREE.Vector3(0, dist * 0.1, 0));

  const curve = new THREE.CatmullRomCurve3([start, controlPoint, end]);
  const points = curve.getPoints(segments);

  const positions = new Float32Array((segments + 1) * 3);
  points.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  });

  return positions;
}

export default function ConnectionLines({ root, visibleIds }: ConnectionLinesProps) {
  const lines = useMemo(() => {
    const pairs: { parent: OrgNode; child: OrgNode }[] = [];
    collectVisiblePairs(root, visibleIds, pairs);

    return pairs.map((pair) => {
      const color = getDivisionColor(pair.parent.divisionId);
      const rgb = hexToRgb(color.primary);

      const start = new THREE.Vector3(
        pair.parent.position.x,
        pair.parent.position.y,
        pair.parent.position.z
      );
      const end = new THREE.Vector3(
        pair.child.position.x,
        pair.child.position.y,
        pair.child.position.z
      );

      const positions = createCurvePoints(start, end, CURVE_SEGMENTS);
      const colors = new Float32Array((CURVE_SEGMENTS + 1) * 3);
      for (let i = 0; i <= CURVE_SEGMENTS; i++) {
        colors[i * 3] = rgb.r;
        colors[i * 3 + 1] = rgb.g;
        colors[i * 3 + 2] = rgb.b;
      }

      return { positions, colors, key: `${pair.parent.id}-${pair.child.id}` };
    });
  }, [root, visibleIds]);

  if (lines.length === 0) return null;

  if (lines.length >= LINE_BATCH_THRESHOLD) {
    const totalVertices = lines.length * (CURVE_SEGMENTS + 1);
    const allPositions = new Float32Array(totalVertices * 3);
    const allColors = new Float32Array(totalVertices * 3);
    const indices: number[] = [];

    lines.forEach((line, lineIndex) => {
      const baseIndex = lineIndex * (CURVE_SEGMENTS + 1);
      allPositions.set(line.positions, baseIndex * 3);
      allColors.set(line.colors, baseIndex * 3);

      for (let i = 0; i < CURVE_SEGMENTS; i++) {
        indices.push(baseIndex + i, baseIndex + i + 1);
      }
    });

    return (
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={totalVertices}
            array={allPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={totalVertices}
            array={allColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            array={new Uint32Array(indices)}
            itemSize={1}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.5} linewidth={1} />
      </lineSegments>
    );
  }

  return (
    <group>
      {lines.map((line) => (
        <line key={line.key}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={CURVE_SEGMENTS + 1}
              array={line.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={CURVE_SEGMENTS + 1}
              array={line.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial vertexColors transparent opacity={0.5} linewidth={1} />
        </line>
      ))}
    </group>
  );
}
