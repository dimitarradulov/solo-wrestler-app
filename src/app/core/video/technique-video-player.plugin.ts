import { registerPlugin } from '@capacitor/core';

export interface OpenTechniqueVideoOptions {
  videoId: string;
  videoNote?: string;
}

export interface TechniqueVideoPlayerPlugin {
  open(options: OpenTechniqueVideoOptions): Promise<void>;
}

export const techniqueVideoPlayerPlugin =
  registerPlugin<TechniqueVideoPlayerPlugin>('TechniqueVideoPlayer');
