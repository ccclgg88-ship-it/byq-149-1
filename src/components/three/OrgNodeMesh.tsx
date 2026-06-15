import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { OrgNode, Vec3, Employee } from '@/types';
import { getDivisionColor, NODE_BASE_SIZE, hexToRgb } from '@/utils/colorUtils';
import { getLODLevel } from '@/utils/lodUtils';
import { lerpVec3, lerp, easeOutCubic } from '@/utils/easing';
import { useAppStore } from '@/store/useAppStore';
import EmployeeSatellite from './EmployeeSatellite';

interface OrgNodeMeshProps {
  node: OrgNode;
  isHighlighted: boolean;
  isDimmed: boolean;
  isPulsing: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: any) => void;
  onDragEnd: (pos: Vec3) => void;
}

export default function OrgNodeMesh({
  node,
  isHighlighted,
  isDimmed,
  isPulsing,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragEnd,
}: OrgNodeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, gl } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const dragIntersection = useMemo(() => new THREE.Vector3(), []);

  const divisionColor = useMemo(() => getDivisionColor(node.divisionId), [node.divisionId]);
  const primaryRgb = useMemo(() => hexToRgb(divisionColor.primary), [divisionColor.primary]);
  const secondaryRgb = useMemo(() => hexToRgb(divisionColor.secondary), [divisionColor.secondary]);

  const baseSize = NODE_BASE_SIZE[node.type] + node.employeeCount * 0.05;
  const targetScale = isHighlighted ? baseSize * 1.1 : baseSize;

  const collapsedCount = useMemo(() => {
    if (node.expanded) return 0;
    let count = 0;
    const walk = (n: OrgNode) => {
      count += n.employees.length;
      n.children.forEach(walk);
    };
    node.children.forEach(walk);
    return count;
  }, [node]);

  const color = useMemo(
    () => new THREE.Color(primaryRgb.r, primaryRgb.g, primaryRgb.b),
    [primaryRgb],
  );
  const emissive = useMemo(
    () => new THREE.Color(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b),
    [secondaryRgb],
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const easedT = easeOutCubic(Math.min(delta * 5, 1));

    const targetPos = node.targetPosition;
    const currentPos = {
      x: groupRef.current.position.x,
      y: groupRef.current.position.y,
      z: groupRef.current.position.z,
    };
    const newPos = lerpVec3(currentPos, targetPos, easedT);
    groupRef.current.position.set(newPos.x, newPos.y, newPos.z);

    const currentScale = groupRef.current.scale.x;
    const newScale = lerp(currentScale, targetScale, easedT);
    groupRef.current.scale.setScalar(newScale);

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const distance = camera.position.distanceTo(groupRef.current.position);
      const lod = getLODLevel(distance);

      if (isPulsing) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
        material.emissiveIntensity = isHighlighted ? 0.8 + pulse * 0.6 : 0.4 + pulse * 0.3;
      } else {
        material.emissiveIntensity = isHighlighted ? 0.8 : 0.25;
      }

      material.opacity = isDimmed ? 0.2 : 0.75;
      material.transparent = true;

      const geom = meshRef.current.geometry as THREE.SphereGeometry;
      if (geom.parameters.widthSegments !== lod.segments) {
        geom.dispose();
        meshRef.current.geometry = new THREE.SphereGeometry(1, lod.segments, lod.segments);
      }
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current) return;
    e.stopPropagation();

    raycaster.setFromCamera(e.pointer, camera);
    if (raycaster.ray.intersectPlane(dragPlane, dragIntersection)) {
      groupRef.current.position.copy(dragIntersection);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);

    if (groupRef.current) {
      onDragEnd({
        x: groupRef.current.position.x,
        y: groupRef.current.position.y,
        z: groupRef.current.position.z,
      });
    }
  };

  const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onContextMenu(e);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.25}
          transparent
          opacity={0.75}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {node.type !== 'company' && (
        <Billboard position={[0, 1.3, 0]}>
          <Text
            fontSize={0.55}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {node.name}
          </Text>
        </Billboard>
      )}

      {collapsedCount > 0 && (
        <Billboard position={[0, -1.2, 0]}>
          <Text
            fontSize={0.5}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
            fontWeight="bold"
          >
            +{collapsedCount}
          </Text>
        </Billboard>
      )}

      {node.expanded && node.employees.length > 0 && (
        <EmployeeSatellite
          center={{ x: 0, y: 0, z: 0 }}
          employees={node.employees}
          expanded={node.expanded}
          onSelect={(emp: Employee) => {
            useAppStore.getState().selectEmployee(emp);
          }}
          onAggregate={onDoubleClick}
        />
      )}
    </group>
  );
}
