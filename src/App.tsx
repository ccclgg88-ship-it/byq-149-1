import { useEffect, useState } from 'react';
import Scene from '@/components/three/Scene';
import SearchBar from '@/components/ui/SearchBar';
import ViewModeSwitch from '@/components/ui/ViewModeSwitch';
import Timeline from '@/components/ui/Timeline';
import Toolbar from '@/components/ui/Toolbar';
import ContextMenu from '@/components/ui/ContextMenu';
import EmployeePanel from '@/components/ui/EmployeePanel';
import PerformancePanel from '@/components/ui/PerformancePanel';
import { useAppStore } from '@/store/useAppStore';
import { generateMockData } from '@/data/generateMockData';
import { generateTimelineEvents } from '@/data/timelineEvents';
import { DIVISION_COLORS } from '@/utils/colorUtils';

export default function App() {
  const {
    orgRoot,
    setOrgData,
    selectedEmployee,
    contextMenu,
    showPerformancePanel,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const { root, allEmployees } = generateMockData();
      const divisionIds = DIVISION_COLORS.map((d) => d.id);
      const events = generateTimelineEvents(root.id, divisionIds);
      setOrgData(root, allEmployees, events);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setOrgData]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Scene />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e27] z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">正在加载组织数据...</p>
          </div>
        </div>
      )}

      {!isLoading && !orgRoot && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e27] z-50">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">数据加载失败</p>
            <p className="text-gray-400 text-sm">请刷新页面重试</p>
          </div>
        </div>
      )}

      {!isLoading && orgRoot && (
        <>
          <SearchBar />
          <ViewModeSwitch />
          <Toolbar />
          <Timeline />

          {contextMenu.visible && <ContextMenu />}

          {selectedEmployee && <EmployeePanel />}

          {showPerformancePanel && <PerformancePanel />}
        </>
      )}
    </div>
  );
}
