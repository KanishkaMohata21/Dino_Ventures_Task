import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Video } from "@/types/video";
import { fetchVideos, fetchVideosByCategory } from "@/data/videos";

interface VideoContextType {
  videos: Video[];
  isLoading: boolean;
  currentVideo: Video | null;
  isPlaying: boolean;
  isMiniPlayer: boolean;
  relatedVideos: Video[];
  playVideo: (video: Video) => void;
  togglePlay: () => void;
  closeMiniPlayer: () => void;
  minimizePlayer: () => void;
  maximizePlayer: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  searchVideos: (query: string) => Promise<void>;
  filterByCategory: (category: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const VideoContext = createContext<VideoContextType | null>(null);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeQuery, setActiveQuery] = useState("nature");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const data = await fetchVideosByCategory("All", 1);
        setVideos(data);
        setHasMore(data.length > 0);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideos();
  }, []);

  const searchVideos = useCallback(async (query: string) => {
    setIsLoading(true);
    setPage(1);
    setActiveQuery(query);
    setActiveCategory(null);
    try {
      const data = await fetchVideos(query, 1);
      setVideos(data);
      setHasMore(data.length > 0);
    } catch (error) {
      console.error("Failed to search videos", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterByCategory = useCallback(async (category: string) => {
    setIsLoading(true);
    setPage(1);
    setActiveCategory(category);
    try {
      const data = await fetchVideosByCategory(category, 1);
      setVideos(data);
      setHasMore(data.length > 0);
    } catch (error) {
      console.error("Failed to filter videos", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    try {
      let data: Video[] = [];
      if (activeCategory) {
        data = await fetchVideosByCategory(activeCategory, nextPage);
      } else {
        data = await fetchVideos(activeQuery, nextPage);
      }

      if (data.length > 0) {
        setVideos((prev) => [...prev, ...data]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more videos", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, activeCategory, activeQuery]);

  const relatedVideos = React.useMemo(() => {
    if (!currentVideo || videos.length === 0) return [];

    // In a real app we might fetch related videos. 
    // Here we'll just return other videos from the current list.
    const otherVideos = videos.filter(v => v.id !== currentVideo.id);

    // Shuffle the array to get random related videos and avoid loops
    for (let i = otherVideos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherVideos[i], otherVideos[j]] = [otherVideos[j], otherVideos[i]];
    }

    return otherVideos.slice(0, 5);
  }, [currentVideo, videos]);

  const playVideo = useCallback((video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setIsMiniPlayer(false);
  }, []);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, []);

  const closeMiniPlayer = useCallback(() => {
    const el = videoRef.current;
    if (el) el.pause();
    setCurrentVideo(null);
    setIsPlaying(false);
    setIsMiniPlayer(false);
  }, []);

  const minimizePlayer = useCallback(() => {
    setIsMiniPlayer(true);
  }, []);

  const maximizePlayer = useCallback(() => {
    setIsMiniPlayer(false);
  }, []);

  return (
    <VideoContext.Provider
      value={{
        videos,
        isLoading,
        currentVideo,
        isPlaying,
        isMiniPlayer,
        relatedVideos,
        playVideo,
        togglePlay,
        closeMiniPlayer,
        minimizePlayer,
        maximizePlayer,
        videoRef,
        searchVideos,
        filterByCategory,
        loadMore,
        hasMore,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideo must be used within VideoProvider");
  return ctx;
}
