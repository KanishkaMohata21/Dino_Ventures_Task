import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Video } from "@/types/video";
import { VideoListPanel } from "@/components/VideoListPanel";
import { PlayerControls } from "@/components/PlayerControls";
import { AutoPlayCountdown } from "@/components/AutoPlayCountdown";
import { useVideo } from "@/contexts/VideoContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Play, ArrowLeft, ChevronDown } from "lucide-react";

export function FullVideoPlayer() {
    const navigate = useNavigate();
    const {
        currentVideo,
        videoRef,
        minimizePlayer,
        relatedVideos,
        isMiniPlayer,
        closeMiniPlayer,
        playVideo
    } = useVideo();

    const containerRef = useRef<HTMLDivElement>(null);
    const [showAutoPlay, setShowAutoPlay] = useState(false);
    const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);
    const controlsAnimation = useAnimation();

    if (!currentVideo) return null;

    const nextVideo = relatedVideos[0];

    // Handle drag to minimize
    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 100) {
            minimizePlayer();
            navigate("/");
        } else {
            controlsAnimation.start({ y: 0 });
        }
    };

    useEffect(() => {
        const el = videoRef.current;
        if (!el || !currentVideo) return;

        // Only load if source changes to avoid reset on component remount if unnecessary
        // But since we are extracting this, we might need to be careful.
        // With GlobalPlayer, this component stays mounted? No, conditionally rendered.
        // Actually, if we conditionally render Full vs Mini, the <video> tag unmounts.
        // We need the <video> tag to be in GlobalPlayer or always present.
        // Let's adjust: GlobalPlayer holds the <video>, specific players control it?
        // OR: GlobalPlayer holds the logic, and we use a Portal or just layout shifting?

        // BETTER APPROACH for seamlessness:
        // The GlobalPlayer renders the <video> element in a fixed position container that changes styles
        // based on isMiniPlayer state.
        // This component (FullVideoPlayer) will mainly render the OVERLAY controls and the page layout.

        // ACTUALLY: The standard "YouTube" way is:
        // The Player component is always there. 
        // When minimized, it shrinks to corner. When full, it fills screen.
        // So GlobalPlayer should render *everything* related to the active video.
    }, [currentVideo?.id, videoRef]);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;
        const onEnded = () => {
            setAutoPlayCancelled(false);
            setShowAutoPlay(true);
        };
        el.addEventListener("ended", onEnded);
        return () => el.removeEventListener("ended", onEnded);
    }, [videoRef]);

    useEffect(() => {
        setShowAutoPlay(false);
        setAutoPlayCancelled(false);
    }, [currentVideo?.id]);

    const handleAutoPlay = useCallback(() => {
        if (nextVideo) {
            playVideo(nextVideo);
            navigate(`/watch/${nextVideo.id}`);
        }
        setShowAutoPlay(false);
    }, [nextVideo, navigate, playVideo]);

    if (isMiniPlayer) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="flex items-center justify-between h-14 px-4 container mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                minimizePlayer();
                                navigate("/");
                            }}
                            className="p-2 -ml-2 hover:bg-accent rounded-full text-foreground transition-colors"
                        >
                            <ChevronDown size={24} />
                        </button>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            <main className="container mx-auto px-4 py-6 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Video Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Video Container Placeholder - The actual video is in GlobalPlayer, we just overlay controls here? 
                            NO, to keep it simple and working:
                            We will move the <video> tag inside GlobalPlayer.
                            GlobalPlayer will position the video absolutely.
                            Here we just provide the space?
                            
                            Let's try a simpler approach first:
                            GlobalPlayer handles the layout state.
                            It renders the <video> and controls.
                            If full screen, it covers everything.
                            If mini, it's small.
                        */}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <VideoListPanel videos={relatedVideos} />
                    </div>
                </div>
            </main>
        </motion.div>
    );
}
