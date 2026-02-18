import { Video } from "@/types/video";
import { formatDuration, formatViews } from "@/data/videos";
import { CategoryBadge } from "./CategoryBadge";
import { useNavigate } from "react-router-dom";

interface VideoCardProps {
  video: Video;
  index?: number;
}

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/watch/${video.id}`)}
      className="group w-full text-left animate-fade-in rounded-lg overflow-hidden bg-card hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-player-bg/80 text-player-controls text-xs font-medium px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-200" />
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 text-card-foreground">
            {video.title}
          </h3>
          <CategoryBadge category={video.category} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{video.channel}</span>
          <span>·</span>
          <span>{formatViews(video.views)}</span>
        </div>
      </div>
    </button>
  );
}
