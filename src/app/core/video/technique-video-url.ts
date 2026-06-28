const YOU_TUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeVideoId(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return normalizeVideoId(url.pathname.split('/').filter(Boolean)[0] ?? null);
    }

    if (
      hostname !== 'youtube.com' &&
      hostname !== 'm.youtube.com' &&
      hostname !== 'youtube-nocookie.com'
    ) {
      return null;
    }

    if (url.pathname.startsWith('/watch')) {
      return normalizeVideoId(url.searchParams.get('v'));
    }

    if (url.pathname.startsWith('/embed/')) {
      return normalizeVideoId(url.pathname.split('/').filter(Boolean)[1] ?? null);
    }

    if (url.pathname.startsWith('/shorts/')) {
      return normalizeVideoId(url.pathname.split('/').filter(Boolean)[1] ?? null);
    }

    if (url.pathname.startsWith('/live/')) {
      return normalizeVideoId(url.pathname.split('/').filter(Boolean)[1] ?? null);
    }

    return null;
  } catch {
    return null;
  }
}

export function buildTechniqueVideoEmbedUrl(videoId: string): string {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);

  url.searchParams.set('autoplay', '1');
  url.searchParams.set('controls', '1');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('fs', '1');
  url.searchParams.set('rel', '0');

  return url.toString();
}

function normalizeVideoId(videoId: string | null): string | null {
  return videoId !== null && YOU_TUBE_ID_PATTERN.test(videoId) ? videoId : null;
}
