export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number; // seconds
  category: VideoCategory;
  views: number;
  uploadedAt: string;
  channel: string;
  avatar: string;
  subscriberCount: string;
}

export type VideoCategory =
  | "Nature"
  | "Technology"
  | "People"
  | "Ocean"
  | "Urban"
  | "Abstract"
  | "General"
  | "Entertainment"
  | "Nature"
  | "Technology"
  | "Sports"
  | "Education"
  | "Music"
  | "Food"
  | "Lifestyle"
  | "General"


export const CATEGORY_COLORS: Record<VideoCategory, string> = {
  Nature: "bg-category-nature",
  Technology: "bg-category-technology",
  People: "bg-category-people",
  Ocean: "bg-category-ocean",
  Urban: "bg-category-urban",
  Abstract: "bg-category-abstract",
  General: "bg-category-general",
  Entertainment: "bg-category-entertainment",
  Sports: "bg-category-sports",
  Education: "bg-category-education",
  Music: "bg-category-music",
  Food: "bg-category-food",
  Lifestyle: "bg-category-lifestyle",
};

export interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: PexelsVideo[];
}
