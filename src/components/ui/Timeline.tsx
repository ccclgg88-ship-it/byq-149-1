import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

function getQuarterLabel(index: number, events: { date: string }[]): string {
  if (!events || !events.length || index < 0 || index >= events.length) {
    return '—';
  }
  try {
    const date = events[index].date;
    if (!date) return '—';
    const year = date.slice(0, 4);
    const month = parseInt(date.slice(5, 7), 10);
    const quarter = Math.ceil(month / 3);
    return `${year} Q${quarter}`;
  } catch {
    return '—';
  }
}

export default function Timeline() {
  const currentTimeIndex = useAppStore((s) => s.currentTimeIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const timelineEvents = useAppStore((s) => s.timelineEvents);
  const _setTimeIndex = useAppStore((s) => s.setTimeIndex);
  const _setPlaying = useAppStore((s) => s.setPlaying);
  const _setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed);

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, (timelineEvents?.length || 0) - 1);

  const setTimeIndex = useCallback(
    (idx: number) => {
      const safeIdx = Math.max(0, Math.min(Math.floor(idx), maxIndex));
      _setTimeIndex(safeIdx);
    },
    [maxIndex, _setTimeIndex],
  );

  const setPlaying = useCallback(
    (p: boolean) => {
      _setPlaying(p);
    },
    [_setPlaying],
  );

  const setPlaybackSpeed = useCallback(
    (s: 1 | 2 | 4) => {
      _setPlaybackSpeed(s);
    },
    [_setPlaybackSpeed],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeoutRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const scheduleNextTick = useCallback(() => {
    const state = useAppStore.getState();
    if (!state.isPlaying) {
      isRunningRef.current = false;
      timeoutRef.current = null;
      return;
    }
    const curMax = Math.max(0, (state.timelineEvents?.length || 0) - 1);
    if (state.currentTimeIndex >= curMax) {
      useAppStore.getState().setPlaying(false);
      isRunningRef.current = false;
      timeoutRef.current = null;
      return;
    }
    const next = Math.min(state.currentTimeIndex + 1, curMax);
    useAppStore.getState().setTimeIndex(next);
    const delayMs = Math.max(50, Math.floor(1000 / state.playbackSpeed));
    timeoutRef.current = window.setTimeout(scheduleNextTick, delayMs);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isRunningRef.current = false;
      return;
    }
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    const delayMs = Math.max(50, Math.floor(1000 / playbackSpeed));
    timeoutRef.current = window.setTimeout(scheduleNextTick, delayMs);
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isRunningRef.current = false;
    };
  }, [isPlaying, playbackSpeed, scheduleNextTick]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      setTimeIndex(val);
    },
    [setTimeIndex],
  );

  const togglePlay = useCallback(() => {
    const state = useAppStore.getState();
    const curMax = Math.max(0, (state.timelineEvents?.length || 0) - 1);
    let nextIdx = state.currentTimeIndex;
    let nextPlaying = !state.isPlaying;
    if (state.currentTimeIndex >= curMax && !state.isPlaying) {
      nextIdx = 0;
    }
    if (nextIdx !== state.currentTimeIndex) {
      useAppStore.getState().setTimeIndex(nextIdx);
    }
    useAppStore.getState().setPlaying(nextPlaying);
  }, []);

  const speeds: Array<1 | 2 | 4> = [1, 2, 4];
  const progressPct = maxIndex > 0 ? (currentTimeIndex / maxIndex) * 100 : 0;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-nebula-purple/20 px-5 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-nebula-purple/30 border border-white/20 flex items-center justify-center text-white hover:bg-nebula-purple/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div ref={speedMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((v) => !v)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium active:scale-95"
              >
                <span>{playbackSpeed}x</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showSpeedMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 backdrop-blur-xl bg-space-900/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {speeds.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                        playbackSpeed === s
                          ? 'bg-nebula-purple/30 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={maxIndex}
                step={1}
                value={currentTimeIndex}
                onChange={handleSliderChange}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-nebula-purple
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(99,102,241,0.6)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-nebula-purple
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:cursor-pointer
                "
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${progressPct}%, rgba(255,255,255,0.1) ${progressPct}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <div className="flex justify-between mt-2 px-1">
                {timelineEvents?.length > 0 && (
                  <>
                    <span className="text-xs text-white/30">
                      {getQuarterLabel(0, timelineEvents)}
                    </span>
                    <span className="text-xs text-white/30">
                      {getQuarterLabel(Math.floor(maxIndex / 2), timelineEvents)}
                    </span>
                    <span className="text-xs text-white/30">
                      {getQuarterLabel(maxIndex, timelineEvents)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-white font-display font-semibold text-lg">
                {getQuarterLabel(currentTimeIndex, timelineEvents)}
              </div>
              <div className="text-white/40 text-xs">
                {currentTimeIndex + 1} / {timelineEvents?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
