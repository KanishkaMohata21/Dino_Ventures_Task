import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVideoById } from "@/data/videos";
import { useVideo } from "@/contexts/VideoContext";
import { Loader2 } from "lucide-react";

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playVideo, currentVideo, maximizePlayer, videos } = useVideo();
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadVideo = async () => {
            // 1. Try to find in current context videos
            const foundInContext = videos.find((v) => v.id === id);
            if (foundInContext) {
                if (currentVideo?.id !== foundInContext.id) {
                    playVideo(foundInContext);
                } else {
                    maximizePlayer();
                }
                return;
            }

            // 2. If not in context try fetching specific video directly
            setIsFetching(true);
            try {
                const video = await fetchVideoById(id);
                if (video) {
                    playVideo(video);
                } else {
                    navigate("/404");
                }
            } catch (error) {
                console.error("Failed to load video", error);
                navigate("/404");
            } finally {
                setIsFetching(false);
            }
        };

        loadVideo();

    }, [id, navigate, playVideo, maximizePlayer, videos]);

    // Show loader if we are fetching the specific video
    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
        );
    }

    return null;
};

export default Watch;