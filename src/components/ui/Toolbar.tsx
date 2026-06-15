import { useState } from 'react';
import { Activity, Camera, Video } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface ToolButtonProps {
  icon: typeof Activity;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function ToolButton({ icon: Icon, label, active, onClick }: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        className={`
          w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center
          transition-all duration-300 ease-out
          ${active
            ? 'bg-nebula-purple/30 border-nebula-purple/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]'
            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
          }
        `}
      >
        <Icon className="w-5 h-5" />
      </button>
      {showTooltip && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap">
          <div className="backdrop-blur-xl bg-space-900/90 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white shadow-xl">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Toolbar() {
  const { showPerformancePanel, togglePerformancePanel } = useAppStore();

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `org-nebula-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleRecordGif = () => {
    alert('GIF 录制功能开发中...');
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3">
      <ToolButton
        icon={Activity}
        label={showPerformancePanel ? '关闭性能面板' : '性能面板'}
        active={showPerformancePanel}
        onClick={togglePerformancePanel}
      />
      <ToolButton
        icon={Camera}
        label="截图"
        onClick={handleScreenshot}
      />
      <ToolButton
        icon={Video}
        label="录制 GIF"
        onClick={handleRecordGif}
      />
    </div>
  );
}
