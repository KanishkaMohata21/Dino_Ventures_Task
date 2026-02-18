import { Video } from "@/types/video";
import { formatDuration } from "@/data/videos";
import { CategoryBadge } from "./CategoryBadge";
import { useNavigate } from "react-router-dom";

interface RelatedVideoItemProps {
  video: Video;
}

function RelatedVideoItem({ video }: RelatedVideoItemProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/watch/${video.id}`)}
      className="flex gap-3 p-3 w-full text-left hover:bg-accent/50 transition-colors rounded-lg"
    >
      <div className="relative w-32 min-w-[8rem] aspect-video rounded-md overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
        <span className="absolute bottom-1 right-1 bg-player-bg/80 text-player-controls text-[10px] px-1 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <h4 className="text-sm font-medium line-clamp-2 text-foreground">{video.title}</h4>
        <p className="text-xs w-full text-muted-foreground">{video.channel}</p>
        <div className="w-fit">
          <CategoryBadge category={video.category} />
        </div>
      </div>
    </button>
  );
}

interface VideoListPanelProps {
  videos: Video[];
}

export function VideoListPanel({ videos }: VideoListPanelProps) {
  if (videos.length === 0) return null;

  return (
    <div className="divide-y divide-border">
      {videos.map((v) => (
        <RelatedVideoItem key={v.id} video={v} />
      ))}
    </div>
  );
}