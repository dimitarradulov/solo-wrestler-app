import {
  computed,
  inject,
  Injectable,
  InjectionToken,
  signal,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
  TechniqueVideoPlayerPlugin,
  techniqueVideoPlayerPlugin,
} from './technique-video-player.plugin';
import {
  buildTechniqueVideoEmbedUrl,
  extractYouTubeVideoId,
} from './technique-video-url';

export const TECHNIQUE_VIDEO_PLAYER_PLUGIN =
  new InjectionToken<TechniqueVideoPlayerPlugin>(
    'TECHNIQUE_VIDEO_PLAYER_PLUGIN',
    {
      providedIn: 'root',
      factory: () => techniqueVideoPlayerPlugin,
    },
  );

@Injectable({ providedIn: 'root' })
export class TechniqueVideoPlayerService {
  private readonly plugin = inject(TECHNIQUE_VIDEO_PLAYER_PLUGIN);
  private readonly activeWebVideoId = signal<string | null>(null);
  private readonly activeWebVideoNote = signal<string | null>(null);
  private webModalResolver: (() => void) | null = null;
  private readonly isOpen = signal(false);

  readonly webEmbedUrl = computed(() => {
    const videoId = this.activeWebVideoId();

    return videoId === null ? null : buildTechniqueVideoEmbedUrl(videoId);
  });
  readonly isWebModalOpen = computed(() => this.activeWebVideoId() !== null);
  readonly webVideoNote = this.activeWebVideoNote.asReadonly();

  async open(videoUrl: string, videoNote?: string): Promise<void> {
    if (this.isOpen()) {
      return;
    }

    const videoId = extractYouTubeVideoId(videoUrl);

    if (videoId === null) {
      return;
    }

    this.isOpen.set(true);

    if (Capacitor.getPlatform() !== 'web') {
      try {
        await this.plugin.open({ videoId, videoNote });
      } finally {
        this.isOpen.set(false);
      }

      return;
    }

    this.activeWebVideoId.set(videoId);
    this.activeWebVideoNote.set(videoNote ?? null);

    await new Promise<void>((resolve) => {
      this.webModalResolver = () => {
        this.webModalResolver = null;
        this.activeWebVideoId.set(null);
        this.activeWebVideoNote.set(null);
        this.isOpen.set(false);
        resolve();
      };
    });
  }

  closeWebModal(): void {
    this.webModalResolver?.();
  }
}
