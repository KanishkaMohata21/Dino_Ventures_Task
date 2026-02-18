import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AutoPlayCountdownProps {
  nextVideoTitle: string;
  onPlay: () => void;
  onCancel: () => void;
}

export function AutoPlayCountdown({ nextVideoTitle, onPlay, onCancel }: AutoPlayCountdownProps) {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (seconds === 0) {
      onPlay();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onPlay]);

  return (
    <div className="absolute inset-0 bg-player-bg/90 flex flex-col items-center justify-center gap-4 z-20 animate-fade-in">
      <p className="text-player-controls/70 text-sm">Up next in</p>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - (seconds / 3) * 100} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
        </svg>
        <span className="text-2xl font-display font-bold text-player-controls">{seconds}</span>
      </div>
      <p className="text-player-controls text-sm font-medium text-center px-8 line-clamp-2">{nextVideoTitle}</p>
      <button
        onClick={onCancel}
        className="flex items-center gap-1 text-xs text-player-controls/60 hover:text-player-controls transition-colors mt-2"
      >
        <X size={14} />
        Cancel
      </button>
    </div>
  );
}
