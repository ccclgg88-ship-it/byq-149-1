import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, FXAA } from '@react-three/postprocessing';
import Stats from 'stats.js';
import { OrgNode, Vec3, ViewMode } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { computeTreeLayout, computeFlatLayout, applyLayout } from './LayoutEngine';
import { useForceLayout } from '@/hooks/useForceLayout';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import OrgNodeMesh from './OrgNodeMesh';
import ConnectionLines from './ConnectionLines';
import Starfield from './Starfield';

function SceneContent() {
  const {
    orgRoot,
    viewMode,
    selectedNodeId,
    highlightedNodeIds,
    highlightPulse,
    isPlaying,
    playbackSpeed,
    currentTimeIndex,
    timelineEvents,
    setTimeIndex,
    setRenderStats,
    selectNode,
    toggleExpandNode,
    setContextMenu,
    updateNodePosition,
    triggerPulse,
  } = useAppStore();

  const statsRef = useRef<Stats | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.right = '10px';
    stats.dom.style.display = 'none';
    document.body.appendChild(stats.dom);
    statsRef.current = stats;
    return () => {
      if (stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
    };
  }, []);

  const collectVisibleNodes = useCallback((root: OrgNode): OrgNode[] => {
    const result: OrgNode[] = [];
    const walk = (node: OrgNode) => {
      if (node.visible) {
        result.push(node);
        if (node.expanded) {
          node.children.forEach(walk);
        }
      }
    };
    walk(root);
    return result;
  }, []);

  const collectVisibleIds = useCallback((nodes: OrgNode[]): string[] => {
    return nodes.map((n) => n.id);
  }, []);

  const handleForceUpdate = useCallback((positions: Map<string, Vec3>) => {
    if (!orgRoot) return;
    applyLayout(orgRoot, positions);
  }, [orgRoot]);

  const { reheat } = useForceLayout(orgRoot, viewMode === 'nebula', handleForceUpdate);

  const lastViewModeRef = useRef<ViewMode | null>(null);
  const lastRootIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!orgRoot) return;
    if (lastViewModeRef.current === viewMode && lastRootIdRef.current === orgRoot.id) return;
    lastViewModeRef.current = viewMode;
    lastRootIdRef.current = orgRoot.id;

    if (viewMode === 'tree') {
      const positions = computeTreeLayout(orgRoot);
      applyLayout(orgRoot, positions);
    } else if (viewMode === 'flat') {
      const positions = computeFlatLayout(orgRoot);
      applyLayout(orgRoot, positions);
    } else if (viewMode === 'nebula') {
      reheat();
    }
  }, [orgRoot, viewMode, reheat]);

  useAnimationFrame(
    (delta) => {
      if (!isPlaying || !timelineEvents.length) return;
      const maxIndex = timelineEvents.length;
      const increment = (delta / 1000) * playbackSpeed * 0.5;
      const nextIndex = Math.min(currentTimeIndex + increment, maxIndex);
      setTimeIndex(nextIndex);
    },
    isPlaying,
  );

  useFrame(() => {
    if (statsRef.current) {
      statsRef.current.begin();
    }

    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFpsUpdateRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
      const visibleNodes = orgRoot ? collectVisibleNodes(orgRoot).length : 0;
      setRenderStats({ fps, nodeCount: visibleNodes });
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    if (statsRef.current) {
      statsRef.current.end();
    }
  });

  const visibleNodes = useMemo(() => {
    if (!orgRoot) return [];
    return collectVisibleNodes(orgRoot);
  }, [orgRoot, collectVisibleNodes]);

  const visibleIds = useMemo(() => collectVisibleIds(visibleNodes), [visibleNodes, collectVisibleIds]);

  const handleNodeClick = useCallback((nodeId: string) => {
    selectNode(nodeId);
    triggerPulse(nodeId);
  }, [selectNode, triggerPulse]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    toggleExpandNode(nodeId);
  }, [toggleExpandNode]);

  const handleNodeContextMenu = useCallback((nodeId: string, e: any) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX || e.nativeEvent?.clientX || 0,
      y: e.clientY || e.nativeEvent?.clientY || 0,
      nodeId,
    });
  }, [setContextMenu]);

  const handleNodeDragEnd = useCallback((nodeId: string, pos: Vec3) => {
    updateNodePosition(nodeId, pos);
  }, [updateNodePosition]);

  if (!orgRoot) {
    return null;
  }

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        makeDefault
        minDistance={10}
        maxDistance={300}
      />

      <ambientLight intensity={0.4} />
      <pointLight position={[50, 50, 50]} intensity={1.2} color="#a855f7" />
      <pointLight position={[-50, -30, 50]} intensity={1.2} color="#06b6d4" />

      <fog attach="fog" args={['#0a0e27', 0.004]} />

      <Starfield />

      {visibleNodes.map((node) => {
        const isHighlighted =
          highlightedNodeIds.includes(node.id) || selectedNodeId === node.id;
        const hasSelection = selectedNodeId !== null || highlightedNodeIds.length > 0;
        const isDimmed = hasSelection && !isHighlighted;
        const isPulsing = highlightPulse.nodeId === node.id;

        return (
          <OrgNodeMesh
            key={node.id}
            node={node}
            isHighlighted={isHighlighted}
            isDimmed={isDimmed}
            isPulsing={isPulsing}
            onClick={() => handleNodeClick(node.id)}
            onDoubleClick={() => handleNodeDoubleClick(node.id)}
            onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
            onDragEnd={(pos) => handleNodeDragEnd(node.id, pos)}
          />
        );
      })}

      <ConnectionLines root={orgRoot} visibleIds={new Set(visibleIds)} />
    </>
  );
}

export default function Scene() {
  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 30, 120], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', background: '#0a0e27', display: 'block' }}
        onPointerMissed={() => {
          const store = useAppStore.getState();
          if (store.selectedNodeId !== null) {
            store.selectNode(null);
          }
          if (store.contextMenu.visible) {
            store.setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
          }
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
