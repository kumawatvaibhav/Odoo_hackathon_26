const PEXELS_KEY = import.meta.env.VITE_PEXEL_KEY as string | undefined;

export type PexelsPhoto = {
  id: number;
  alt: string;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    landscape: string;
    medium: string;
  };
};

export type PexelsVideo = {
  id: number;
  url: string;
  video_files: Array<{
    id: number;
    quality: "sd" | "hd";
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
};

const photoCache = new Map<string, PexelsPhoto[]>();
const videoCache = new Map<string, PexelsVideo[]>();

export async function fetchPexelsPhotos(query: string, perPage = 6) {
  if (!PEXELS_KEY) return [];
  const cacheKey = `${query}|${perPage}`;
  const cached = photoCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=${perPage}&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { photos: PexelsPhoto[] };
    const photos = data.photos ?? [];
    photoCache.set(cacheKey, photos);
    return photos;
  } catch {
    return [];
  }
}

export async function fetchPexelsVideos(query: string, perPage = 3) {
  if (!PEXELS_KEY) return [];
  const cacheKey = `${query}|${perPage}`;
  const cached = videoCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(
      query
    )}&per_page=${perPage}&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { videos: PexelsVideo[] };
    const videos = data.videos ?? [];
    videoCache.set(cacheKey, videos);
    return videos;
  } catch {
    return [];
  }
}

export function pickPexelsVideoFile(video: PexelsVideo) {
  const mp4s = video.video_files.filter((file) => file.file_type === "video/mp4");
  if (!mp4s.length) return null;
  const sorted = [...mp4s].sort((a, b) => b.width - a.width);
  return sorted[0]?.link ?? null;
}
