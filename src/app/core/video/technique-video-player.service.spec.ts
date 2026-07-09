import { Capacitor } from '@capacitor/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  TECHNIQUE_VIDEO_PLAYER_PLUGIN,
  TechniqueVideoPlayerService,
} from './technique-video-player.service';

describe('TechniqueVideoPlayerService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  const setup = () => {
    const pluginOpen = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        TechniqueVideoPlayerService,
        {
          provide: TECHNIQUE_VIDEO_PLAYER_PLUGIN,
          useValue: { open: pluginOpen },
        },
      ],
    });

    return {
      pluginOpen,
      service: TestBed.inject(TechniqueVideoPlayerService),
    };
  };

  it('passes video ID and optional note together to the native plugin', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    const { pluginOpen, service } = setup();

    await service.open(
      'https://www.youtube.com/watch?v=pfNtYzw97Ew',
      'Focus on the sprawl mechanics.',
    );

    expect(pluginOpen).toHaveBeenCalledWith({
      videoId: 'pfNtYzw97Ew',
      videoNote: 'Focus on the sprawl mechanics.',
    });
  });

  it('shows the note above the web player state and clears it on close', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
    const { service } = setup();

    const openPromise = service.open(
      'https://www.youtube.com/watch?v=pfNtYzw97Ew',
      'Focus on the sprawl mechanics.',
    );

    expect(service.webVideoNote()).toBe('Focus on the sprawl mechanics.');
    expect(service.webEmbedUrl()).toContain('/embed/pfNtYzw97Ew');

    service.closeWebModal();
    await openPromise;

    expect(service.webVideoNote()).toBeNull();
    expect(service.webEmbedUrl()).toBeNull();
  });

  it('preserves the no-note behavior', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    const { pluginOpen, service } = setup();

    await service.open('https://www.youtube.com/watch?v=crvfcKsaN0g');

    expect(pluginOpen).toHaveBeenCalledWith({
      videoId: 'crvfcKsaN0g',
      videoNote: undefined,
    });
  });
});
