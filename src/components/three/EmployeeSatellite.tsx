import { useRef, useMemo, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Vec3, Employee } from '@/types';
import { LEVEL_COLORS, LEVEL_SIZE, hexToRgb } from '@/utils/colorUtils';

interface EmployeeSatelliteProps {
  center: Vec3;
  employees: Employee[];
  expanded: boolean;
  onSelect: (e: Employee) => void;
  onAggregate: () => void;
}

interface OrbitData {
  radius: number;
  speed: number;
  angle: number;
  inclination: number;
}

const AGGREGATE_THRESHOLD = 20;

export default function EmployeeSatellite({
  center,
  employees,
  expanded,
  onSelect,
  onAggregate,
}: EmployeeSatelliteProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const orbits = useRef<OrbitData[]>([]);

  const { employeeData, aggregateColor } = useMemo(() => {
    const data = employees.map((emp) => {
      const color = hexToRgb(LEVEL_COLORS[emp.level]);
      const baseSize = LEVEL_SIZE[emp.level];
      const size = baseSize * (1 + emp.tenureYears * 0.05);
      return { employee: emp, color, size };
    });

    const avgLevelR = data.reduce((sum, d) => sum + d.color.r, 0) / Math.max(data.length, 1);
    const avgLevelG = data.reduce((sum, d) => sum + d.color.g, 0) / Math.max(data.length, 1);
    const avgLevelB = data.reduce((sum, d) => sum + d.color.b, 0) / Math.max(data.length, 1);

    return {
      employeeData: data,
      aggregateColor: new THREE.Color(avgLevelR, avgLevelG, avgLevelB),
    };
  }, [employees]);

  useMemo(() => {
    orbits.current = employeeData.map(() => ({
      radius: 8 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      inclination: Math.random() * Math.PI,
    }));
  }, [employeeData]);

  useFrame((_, delta) => {
    if (!meshRef.current || !expanded || employees.length > AGGREGATE_THRESHOLD) return;

    employeeData.forEach((data, i) => {
      const orbit = orbits.current[i];
      orbit.angle += orbit.speed * delta;

      const x = center.x + Math.cos(orbit.angle) * orbit.radius;
      const y = center.y + Math.sin(orbit.angle) * Math.sin(orbit.inclination) * orbit.radius * 0.6;
      const z = center.z + Math.sin(orbit.angle) * Math.cos(orbit.inclination) * orbit.radius;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(data.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(data.color.r, data.color.g, data.color.b));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      if (employees.length > AGGREGATE_THRESHOLD) {
        onAggregate();
      } else if (expanded && event.instanceId !== undefined) {
        const emp = employees[event.instanceId];
        if (emp) onSelect(emp);
      }
    },
    [employees, expanded, onSelect, onAggregate]
  );

  if (employees.length === 0) return null;

  if (employees.length > AGGREGATE_THRESHOLD) {
    return (
      <group position={[center.x, center.y, center.z]}>
        <mesh onClick={handleClick}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshStandardMaterial
            color={aggregateColor}
            transparent
            opacity={0.85}
            emissive={aggregateColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        <Html center distanceFactor={10} position={[0, 0, 3]}>
          <div
            style={{
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: 4,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +{employees.length}人
          </div>
        </Html>
      </group>
    );
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, employeeData.length]}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial transparent opacity={0.9} />
    </instancedMesh>
  );
}
