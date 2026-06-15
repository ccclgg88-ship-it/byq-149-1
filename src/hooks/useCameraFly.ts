import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCallback, useRef } from 'react';
import { easeInOutSine, lerp } from '@/utils/easing';

export function useCameraFly() {
  const { camera } = useThree();
  const flyingRef = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const startTime = useRef(0);
  const duration = useRef(1500);
  const controlsRef = useRef<any>(null);

  const setControls = useCallback((c: any) => {
    controlsRef.current = c;
  }, []);

  const flyTo = useCallback((target: THREE.Vector3, distance = 20, dur = 1500) => {
    if (flyingRef.current) return;
    flyingRef.current = true;
    startPos.current.copy(camera.position);
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    targetPos.current.copy(target).add(dir.multiplyScalar(distance));
    startTime.current = performance.now();
    duration.current = dur;

    const animate = () => {
      const now = performance.now();
      const t = Math.min(1, (now - startTime.current) / duration.current);
      const eased = easeInOutSine(t);
      camera.position.lerpVectors(startPos.current, targetPos.current, eased);
      camera.lookAt(
        lerp(startPos.current.x + (target.x - camera.position.x), target.x, eased),
        lerp(startPos.current.y + (target.y - camera.position.y), target.y, eased),
        lerp(startPos.current.z + (target.z - camera.position.z), target.z, eased),
      );
      if (controlsRef.current) {
        controlsRef.current.target.lerp(target, eased);
      }
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        flyingRef.current = false;
      }
    };
    animate();
  }, [camera]);

  return { flyTo, setControls, isFlying: () => flyingRef.current };
}
