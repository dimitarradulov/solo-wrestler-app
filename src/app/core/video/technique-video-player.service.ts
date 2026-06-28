import { computed, Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { techniqueVideoPlayerPlugin } from './technique-video-player.plugin';
import {
  buildTechniqueVideoEmbedUrl,
  extractYouTubeVideoId,
} from './technique-video-url';

@Injectable({ providedIn: 'root' })
export class TechniqueVideoPlayerService {
  private readonly activeWebVideoId = signal<string | null>(null);
  private webModalResolver: (() => void) | null = null;
  private readonly isOpen = signal(false);

  readonly webEmbedUrl = computed(() => {
    const videoId = this.activeWebVideoId();

    return videoId === null ? null : buildTechniqueVideoEmbedUrl(videoId);
  });
  readonly isWebModalOpen = computed(() => this.activeWebVideoId() !== null);

  async open(videoUrl: string): Promise<void> {
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
        await techniqueVideoPlayerPlugin.open({ videoId });
      } finally {
        this.isOpen.set(false);
      }

      return;
    }

    this.activeWebVideoId.set(videoId);

    await new Promise<void>((resolve) => {
      this.webModalResolver = () => {
        this.webModalResolver = null;
        this.activeWebVideoId.set(null);
        this.isOpen.set(false);
        resolve();
      };
    });
  }

  closeWebModal(): void {
    this.webModalResolver?.();
  }
}
