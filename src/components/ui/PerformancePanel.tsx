import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function PerformancePanel() {
  const { showPerformancePanel, allEmployees, orgRoot, setRenderStats } = useAppStore();
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showPerformancePanel) return;

    const countNodes = (node: any): number => {
      let count = 1;
      for (const c of node.children) {
        count += countNodes(c);
      }
      return count;
    };

    const nodeCount = orgRoot ? countNodes(orgRoot) : 0;
    const employeeCount = allEmployees.length;

    const tick = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(currentFps);
        setRenderStats({ fps: currentFps, nodeCount });
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [showPerformancePanel, orgRoot, allEmployees, setRenderStats]);

  if (!showPerformancePanel) return null;

  const countNodes = (node: any): number => {
    if (!node) return 0;
    let count = 1;
    for (const c of node.children) {
      count += countNodes(c);
    }
    return count;
  };

  const nodeCount = orgRoot ? countNodes(orgRoot) : 0;
  const employeeCount = allEmployees.length;

  const fpsColor = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed top-4 left-4 z-40 w-[180px]">
      <div
        className="rounded-lg shadow-xl overflow-hidden"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        }}
      >
        <div
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
          style={{ color: fpsColor }}
        >
          Performance
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: '#10b981' }}>FPS</span>
            <span className="text-sm font-bold" style={{ color: fpsColor }}>
              {fps}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: '#10b981' }}>节点</span>
            <span className="text-sm font-bold" style={{ color: '#10b981' }}>
              {nodeCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: '#10b981' }}>员工</span>
            <span className="text-sm font-bold" style={{ color: '#10b981' }}>
              {employeeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
