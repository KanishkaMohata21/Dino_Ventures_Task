import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Maximize, Minimize } from "lucide-react";
import { formatDuration } from "@/data/videos";
import { useVideo } from "@/contexts/VideoContext";

interface PlayerControlsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function PlayerControls({ containerRef }: PlayerControlsProps) {
  const { isPlaying, togglePlay, videoRef, currentVideo } = useVideo();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [skipFeedback, setSkipFeedback] = useState<"fwd" | "bwd" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetHideTimer = useCallback(() => {
    clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => { }, 3000);
    }
  }, [isPlaying]);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch((err) => {
          console.error(`Fullscreen error: ${err.message}`);
        });
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen(); // Safari
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen(); // Safari
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // Safari
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => {
      if (!isDragging) setCurrentTime(el.currentTime);
    };
    const onMeta = () => setDuration(el.duration);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    if (el.duration) setDuration(el.duration);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  }, [videoRef, currentVideo?.id, isDragging]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [isPlaying, resetHideTimer, isDragging]); // Keep controls shown while dragging

  const skip = (delta: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + delta));
    setSkipFeedback(delta > 0 ? "fwd" : "bwd");
    setTimeout(() => setSkipFeedback(null), 600);
    resetHideTimer();
  };

  const handleSeek = useCallback((clientX: number) => {
    const el = videoRef.current;
    const bar = progressRef.current;
    if (!el || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = pct * (el.duration || 0);
    setCurrentTime(newTime);
    el.currentTime = newTime;
  }, [videoRef]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleSeek(e.clientX);
    resetHideTimer();

    // Disable text selection during drag
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      handleSeek(e.clientX);
      resetHideTimer();
    };

    const onPointerUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    // Also handle touch events if pointer events aren't enough (though pointer covers both generally)
    // Actually pointer events cover touch, mouse, pen.

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleSeek, resetHideTimer]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col justify-end transition-opacity duration-300 ${isPlaying && !isDragging ? "opacity-0 hover:opacity-100" : "opacity-100"
        }`}
      onClick={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Center controls */}
      <div className="absolute inset-0 flex items-center justify-center gap-12 pointer-events-none">
        {/* Skip backward */}
        <button
          onClick={(e) => { e.stopPropagation(); skip(-10); }}
          className="relative text-player-controls/80 hover:text-player-controls transition-colors p-2 pointer-events-auto"
        >
          <SkipBack size={28} fill="currentColor" />
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-player-controls/60">10s</span>
          {skipFeedback === "bwd" && (
            <span className="absolute inset-0 flex items-center justify-center text-player-controls animate-skip-feedback text-lg font-bold">-10</span>
          )}
        </button>

        {/* Play/Pause */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="text-player-controls bg-player-bg/40 rounded-full p-4 hover:bg-player-bg/60 transition-colors backdrop-blur-sm pointer-events-auto"
        >
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
        </button>

        {/* Skip forward */}
        <button
          onClick={(e) => { e.stopPropagation(); skip(10); }}
          className="relative text-player-controls/80 hover:text-player-controls transition-colors p-2 pointer-events-auto"
        >
          <SkipForward size={28} fill="currentColor" />
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-player-controls/60">10s</span>
          {skipFeedback === "fwd" && (
            <span className="absolute inset-0 flex items-center justify-center text-player-controls animate-skip-feedback text-lg font-bold">+10</span>
          )}
        </button>
      </div>

      {/* Bottom bar */}
      <div className="player-controls-gradient px-4 pb-4 pt-12 space-y-2">
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1 py-4 -my-4 cursor-pointer group flex items-center"
          onPointerDown={onPointerDown}
        >
          {/* Background Track */}
          <div className="absolute left-0 right-0 h-1 bg-white/30 rounded-full" />

          {/* Filled Track */}
          <div
            className="absolute left-0 h-1 bg-primary rounded-full transition-[width] duration-0"
            style={{ width: `${progress}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg transition-opacity ${isDragging ? "opacity-100 scale-125" : "opacity-0 group-hover:opacity-100"
              }`}
            style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-player-controls/70 font-body">
            <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="text-player-controls/80 hover:text-player-controls transition-colors p-1.5 hover:bg-white/10 rounded-lg pointer-events-auto"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>


        </div>
      </div>
    </div>
  );
}