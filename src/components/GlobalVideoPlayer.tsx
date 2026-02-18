import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useVideo } from "@/contexts/VideoContext";
import { PlayerControls } from "@/components/PlayerControls";
import { VideoListPanel } from "@/components/VideoListPanel";
import { AutoPlayCountdown } from "@/components/AutoPlayCountdown";
import { ChevronDown, Play, Pause, X } from "lucide-react";
import { formatDuration } from "@/data/videos";

export function GlobalVideoPlayer() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        currentVideo,
        videoRef,
        isMiniPlayer,
        isPlaying,
        togglePlay,
        minimizePlayer,
        maximizePlayer,
        closeMiniPlayer,
        relatedVideos,
        playVideo
    } = useVideo();

    const containerRef = useRef<HTMLDivElement>(null);
    const [showAutoPlay, setShowAutoPlay] = useState(false);
    const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);

    const nextVideo = relatedVideos[0];

    // --- Effects ---
    useEffect(() => {
        if (!currentVideo) return;
        if (!isMiniPlayer && !location.pathname.startsWith('/watch')) {
            navigate(`/watch/${currentVideo.id}`);
        }
        else if (isMiniPlayer && location.pathname.startsWith('/watch')) {
            navigate('/');
        }
    }, [isMiniPlayer, currentVideo, location, navigate]);

    // Force play when video changes
    // We rely on the `autoPlay` attribute and `key` prop on the video element now.
    // The previous useEffect here was causing potential race conditions.

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;
        const onEnded = () => {
            // Only show autoplay if there is a next video
            if (nextVideo) {
                setAutoPlayCancelled(false);
                setShowAutoPlay(true);
            }
        };
        el.addEventListener("ended", onEnded);
        return () => el.removeEventListener("ended", onEnded);
    }, [videoRef, nextVideo]);

    const handleAutoPlay = useCallback(() => {
        if (nextVideo) {
            playVideo(nextVideo);
        }
        setShowAutoPlay(false);
    }, [nextVideo, playVideo]);

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!isMiniPlayer && info.offset.y > 100) {
            minimizePlayer();
        }
    };

    if (!currentVideo) return null;

    const isFull = !isMiniPlayer;

    return (
        <AnimatePresence>
            <motion.div
                layout
                initial={false}
                animate={isFull
                    ? { y: 0, opacity: 1, scale: 1, borderRadius: 0, top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }
                    : { y: 0, opacity: 1, scale: 1, borderRadius: 12, top: "auto", left: "auto", right: 16, bottom: 16, width: "320px", height: "80px" }
                }
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                drag={isFull ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={onDragEnd}
                className={`fixed z-50 shadow-2xl ${isFull ? 'bg-background overflow-y-auto' : 'bg-card border border-border flex flex-row items-center px-2 cursor-pointer overflow-hidden'
                    }`}
                onClick={!isFull ? maximizePlayer : undefined}
            >
                {/* 
                  LAYOUT COMPOSITION
                  We use a shared structure but toggle visibility/classes based on isFull.
                  Crucially, the <video> element is rendered ONCE in the tree layout, moved by CSS/Framer. 
                */}

                {/* FULL SCREEN LAYOUT CONTAINER */}
                <div className={`w-full ${isFull ? 'min-h-full flex flex-col' : 'h-full flex flex-row items-center'}`}>

                    {/* 
                       VIDEO SECTION 
                       In Full: Grid Area or Top. 
                       In Mini: Left tiny box.
                    */}
                    <div
                        className={`${isFull
                            ? 'container mx-auto p-4 lg:p-6 pb-0 grid lg:grid-cols-3 gap-6'
                            : 'contents' // 'contents' makes children behave as if they were direct children of flex container
                            }`}
                    >
                        {/* LEFT COL (Full) / Tiny Box (Mini) */}
                        <div className={`${isFull ? 'lg:col-span-2 space-y-4' : 'shrink-0'}`}>

                            {/* The Persistent Video Wrapper */}
                            <motion.div
                                layout
                                ref={isFull ? containerRef : undefined} // Only attach Fullscreen ref in Full mode or always? Always is safer but might look weird if Mini. Actually Fullscreen API works fine on any element.
                                className={`relative bg-black overflow-hidden ${isFull ? 'w-full aspect-video rounded-xl shadow-lg' : 'w-24 h-14 rounded-md'}`}
                            >
                                <video
                                    key={currentVideo.id} // Force remount on new video to ensure fresh state/buffer
                                    ref={videoRef}
                                    src={currentVideo.videoUrl}
                                    className={`w-full h-full ${isFull ? 'object-contain' : 'object-cover'}`}
                                    playsInline
                                    autoPlay // With key change, we can safely use autoPlay for new videos
                                />

                                {/* FULL SCREEN OVERLAYS (Only render if Full) */}
                                {isFull && (
                                    <>
                                        <div className="absolute top-0 left-0 p-4 z-20">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); minimizePlayer(); }}
                                                className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                            >
                                                <ChevronDown />
                                            </button>
                                        </div>
                                        <PlayerControls containerRef={containerRef} />
                                        {showAutoPlay && !autoPlayCancelled && nextVideo && (
                                            <AutoPlayCountdown
                                                nextVideoTitle={nextVideo.title}
                                                onPlay={handleAutoPlay}
                                                onCancel={() => { setShowAutoPlay(false); setAutoPlayCancelled(true); }}
                                            />
                                        )}
                                    </>
                                )}
                            </motion.div>

                            {/* Full Screen Details (Hidden in Mini) */}
                            {isFull && (
                                <div>
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-bold font-display text-foreground">{currentVideo.title}</h1>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <p>{formatDuration(currentVideo.duration)}</p>
                                            <span>•</span>
                                            <p>{currentVideo.channel}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-secondary/10 rounded-xl border border-border/50 mt-4">
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{currentVideo.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COL (Full) / Hidden (Mini) */}
                        {isFull && (
                            <div className="lg:col-span-1">
                                <h3 className="text-lg font-bold font-display mb-4 hidden lg:block">Up Next</h3>
                                <div className="space-y-4">
                                    <VideoListPanel videos={relatedVideos} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MINI PLAYER CONTENT (Only render if Mini) */}
                    {!isFull && (
                        <>
                            <motion.div layout className="flex-1 min-w-0 mx-3">
                                <p className="text-sm font-medium text-foreground truncate">{currentVideo.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{currentVideo.channel}</p>
                            </motion.div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                    className="p-2 hover:bg-accent rounded-full text-foreground"
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); closeMiniPlayer(); }}
                                    className="p-2 hover:bg-accent rounded-full text-foreground"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
