import {
  buildTechniqueVideoEmbedUrl,
  extractYouTubeVideoId,
} from './technique-video-url';

describe('techniqueVideoUrl', () => {
  it('extracts video ids from supported YouTube watch urls', () => {
    expect(
      extractYouTubeVideoId('https://www.youtube.com/watch?v=crvfcKsaN0g'),
    ).toBe('crvfcKsaN0g');
    expect(
      extractYouTubeVideoId(
        'https://m.youtube.com/watch?v=3fAryvfNF8U&feature=youtu.be',
      ),
    ).toBe('3fAryvfNF8U');
  });

  it('extracts video ids from short and embed urls', () => {
    expect(extractYouTubeVideoId('https://youtu.be/8FyeXO4rviw')).toBe(
      '8FyeXO4rviw',
    );
    expect(
      extractYouTubeVideoId(
        'https://www.youtube.com/embed/6Ao2yUZolSA?start=12',
      ),
    ).toBe('6Ao2yUZolSA');
  });

  it('rejects malformed or unsupported urls', () => {
    expect(extractYouTubeVideoId('https://example.test/watch?v=crvfcKsaN0g')).toBeNull();
    expect(extractYouTubeVideoId('not-a-url')).toBeNull();
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=short')).toBeNull();
    expect(
      extractYouTubeVideoId('https://www.youtube.com/watch?v=crvfcKsaN0g123'),
    ).toBeNull();
  });

  it('builds privacy-enhanced embed urls with autoplay and inline playback', () => {
    expect(buildTechniqueVideoEmbedUrl('crvfcKsaN0g')).toBe(
      'https://www.youtube-nocookie.com/embed/crvfcKsaN0g?autoplay=1&controls=1&playsinline=1&fs=1&rel=0',
    );
  });
});
