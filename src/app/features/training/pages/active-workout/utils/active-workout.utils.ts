export function toYouTubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') {
      return null;
    }

    if (url.pathname.startsWith('/embed/')) {
      const videoId = url.pathname.split('/').filter(Boolean)[1];

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    const videoId = url.searchParams.get('v');

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}
