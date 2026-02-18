import { Play, Pause, X } from "lucide-react";
import { motion } from "framer-motion";
import { useVideo } from "@/contexts/VideoContext";

export function MiniPlayer() {
  const { currentVideo, isPlaying, togglePlay, closeMiniPlayer, maximizePlayer, videoRef } = useVideo();

  if (!currentVideo) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-mini-player-bg border-t border-border shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="flex items-center gap-3 p-2">
        {/* Mini video preview */}
        <button onClick={maximizePlayer} className="relative w-28 min-w-[7rem] aspect-video rounded-md overflow-hidden bg-player-bg">
          <video
            ref={videoRef as React.RefObject<HTMLVideoElement>}
            src={currentVideo.videoUrl}
            className="w-full h-full object-cover"
            playsInline
            muted={false}
          />
        </button>

        {/* Info */}
        <button onClick={maximizePlayer} className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground truncate">{currentVideo.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentVideo.channel}</p>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={togglePlay} className="p-2 text-foreground hover:text-primary transition-colors">
            {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
          </button>
          <button onClick={closeMiniPlayer} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
