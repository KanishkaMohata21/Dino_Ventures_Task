import { Video, PexelsResponse, PexelsVideo } from "@/types/video";
import axios from "axios";

// Fallback data in case API fails or key is missing
export const fallbackVideos: Video[] = [
  {
    id: "1",
    title: "Big Buck Bunny",
    description: "A large and lovable rabbit deals with three tiny bullies.",
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 596,
    category: "Entertainment",
    views: 1200000,
    uploadedAt: "2024-03-15",
    channel: "Blender Foundation",
    avatar: "https://i.pravatar.cc/150?u=BlenderFoundation",
    subscriberCount: "1.2M",
  },
  {
    id: "2",
    title: "Elephant's Dream",
    description: "The story of two strange characters exploring a causal, magical world.",
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: 653,
    category: "Entertainment",
    views: 890000,
    uploadedAt: "2024-02-20",
    channel: "Blender Foundation",
    avatar: "https://i.pravatar.cc/150?u=BlenderFoundation",
    subscriberCount: "1.2M",
  },
  {
    id: "3",
    title: "For Bigger Blazes",
    description: "Introducing Chromecast. The easiest way to enjoy online video on your TV.",
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: 15,
    category: "Technology",
    views: 560000,
    uploadedAt: "2024-04-10",
    channel: "Google Chrome",
    avatar: "https://i.pravatar.cc/150?u=GoogleChrome",
    subscriberCount: "5M",
  },
  {
    id: "4",
    title: "For Bigger Escapes",
    description: "Introducing Chromecast for bigger escapes.",
    thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: 15,
    category: "Sports",
    views: 430000,
    uploadedAt: "2024-05-01",
    channel: "Google Chrome",
    avatar: "https://i.pravatar.cc/150?u=GoogleChrome",
    subscriberCount: "5M",
  },
];

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const BASE_URL = "https://api.pexels.com/videos";

export const fetchVideos = async (query: string = "nature", page: number = 1): Promise<Video[]> => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    console.warn("Pexels API Key is missing. Using fallback data.");
    // For fallback, we just return the same list or slice it if we had enough data locally.
    // Since we only have a small static list, we'll just return it all for page 1, and empty for others to simulate end of data.
    if (page > 1) return [];
    return fallbackVideos;
  }

  try {
    const response = await axios.get<PexelsResponse>(`${BASE_URL}/search`, {
      headers: {
        Authorization: API_KEY,
      },
      params: {
        query,
        per_page: 15,
        page,
        orientation: "landscape",
      },
    });

    return response.data.videos.map((pexelsVideo) => {
      // Find the best quality video file (e.g., hd or highest resolution)
      const videoFile =
        pexelsVideo.video_files.find((f) => f.quality === "hd") ||
        pexelsVideo.video_files[0];

      // Determine category from query
      const categoryFromQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
      const validCategory = CATEGORIES.includes(categoryFromQuery) ? categoryFromQuery : "General";

      return {
        id: pexelsVideo.id.toString(),
        title: `Video by ${pexelsVideo.user.name}`,
        description: `Experience this amazing video captured by ${pexelsVideo.user.name} on Pexels.`,
        thumbnail: pexelsVideo.image,
        videoUrl: videoFile.link,
        duration: pexelsVideo.duration,
        category: validCategory as any,
        views: Math.floor(Math.random() * 1000000), // Random views as Pexels doesn't provide this
        uploadedAt: new Date().toISOString().split("T")[0], // Current date as upload date
        channel: pexelsVideo.user.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pexelsVideo.user.name)}&background=random`,
        subscriberCount: "Unknown",
      };
    });
  } catch (error) {
    console.error("Error fetching videos from Pexels:", error);
    if (page > 1) return [];
    return fallbackVideos;
  }
};

// Deprecated: This was used for sync access. Now prefer using the async fetch.
// Keeping it exported as an empty array or fallback to avoid breaking imports immediately,
// but consumers should migrate to fetchVideos.
export const videos: Video[] = fallbackVideos;

// Helper to get diverse categories by making multiple requests or simulating it requires more logic.
// For now, we'll return a static list of categories that we *can* query.
export const CATEGORIES = [
  "Nature",
  "Technology",
  "People",
  "Ocean",
  "Urban",
  "Abstract",
];


// Helper to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const fetchMixedVideos = async (page: number = 1): Promise<Video[]> => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    if (page > 1) return [];
    return fallbackVideos;
  }

  try {
    // Pick 3 random categories to fetch from for this page
    // We use the page number to rotate categories if we wanted determinstic, 
    // but random is fine for "mixed" feel.
    const shuffledCategories = shuffleArray([...CATEGORIES]);
    const selectedCategories = shuffledCategories.slice(0, 3);

    // Fetch from selected categories in parallel
    const promises = selectedCategories.map(cat =>
      fetchVideos(cat, page).then(videos => videos.slice(0, 4)) // Take top 4 from each
    );

    const results = await Promise.all(promises);
    const combinedVideos = results.flat();

    // Shuffle the combined results so they are mixed in the feed
    return shuffleArray(combinedVideos);

  } catch (error) {
    console.error("Error fetching mixed videos:", error);
    if (page > 1) return [];
    return fallbackVideos;
  }
}

export async function fetchVideosByCategory(category: string, page: number = 1): Promise<Video[]> {
  if (category === "All") {
    return fetchMixedVideos(page);
  }
  return fetchVideos(category, page);
}

export const fetchVideoById = async (id: string): Promise<Video | undefined> => {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    // Check fallback videos
    return fallbackVideos.find((v) => v.id === id);
  }

  try {
    const response = await axios.get<PexelsVideo>(`${BASE_URL}/videos/${id}`, {
      headers: {
        Authorization: API_KEY,
      },
    });

    const pexelsVideo = response.data;
    const videoFile =
      pexelsVideo.video_files.find((f) => f.quality === "hd") ||
      pexelsVideo.video_files[0];

    return {
      id: pexelsVideo.id.toString(),
      title: `Video by ${pexelsVideo.user.name}`,
      description: `Experience this amazing video captured by ${pexelsVideo.user.name} on Pexels.`,
      thumbnail: pexelsVideo.image,
      videoUrl: videoFile.link,
      duration: pexelsVideo.duration,
      category: "General",
      views: Math.floor(Math.random() * 1000000),
      uploadedAt: new Date().toISOString().split("T")[0],
      channel: pexelsVideo.user.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pexelsVideo.user.name)}&background=random`,
      subscriberCount: "Unknown",
    };
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    return fallbackVideos.find((v) => v.id === id);
  }
};


export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K views`;
  return `${views} views`;
}
