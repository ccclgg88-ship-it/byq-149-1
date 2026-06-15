import { GitBranch, Sparkles, Layers } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ViewMode } from '@/types';

const modes: { key: ViewMode; label: string; icon: typeof GitBranch }[] = [
  { key: 'tree', label: '树状', icon: GitBranch },
  { key: 'nebula', label: '星云', icon: Sparkles },
  { key: 'flat', label: '扁平', icon: Layers },
];

export default function ViewModeSwitch() {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-full p-1 shadow-2xl shadow-nebula-purple/20">
        <div className="flex gap-0.5">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'bg-nebula-purple/30 text-white border border-white/30 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
