import { useState, useRef, useCallback } from "react";
import { CATEGORIES } from "@/data/videos";
import { VideoCard } from "@/components/VideoCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Play, Loader2 } from "lucide-react";
import { useVideo } from "@/contexts/VideoContext";

const Index = () => {
  const { videos, isLoading, filterByCategory, loadMore, hasMore } = useVideo();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);


  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    filterByCategory(category);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Inline brand + theme toggle */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Play size={14} className="text-primary-foreground ml-0.5" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-base text-foreground">DinoPlay</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Category filter */}
      <div className="sticky top-12 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto hide-scrollbar">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video grid */}
      <main className="container px-4 py-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video, i) => {
            if (videos.length === i + 1) {
              return <div ref={lastVideoElementRef} key={`${video.id}-${i}`}><VideoCard video={video} index={i} /></div>;
            } else {
              return <VideoCard key={`${video.id}-${i}`} video={video} index={i} />;
            }
          })}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && videos.length === 0 && (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No videos found for this category
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
