import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import {
  BeforeInstallPromptEvent,
  InstallPromptService,
} from './install-prompt.service';

describe('InstallPromptService', () => {
  const setNavigator = (userAgent: string, standalone = false): void => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: userAgent,
    });
    Object.defineProperty(navigator, 'standalone', {
      configurable: true,
      value: standalone,
    });
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: '',
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    });
  };

  const setStandaloneMedia = (matches: boolean): void => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as typeof window.matchMedia;
  };

  const createInstallEvent = (outcome: 'accepted' | 'dismissed') => {
    const event = new Event('beforeinstallprompt', {
      cancelable: true,
    }) as BeforeInstallPromptEvent;
    const prompt = vi.fn().mockResolvedValue(undefined);

    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome, platform: 'web' }),
    });

    return { event, prompt };
  };

  beforeEach(() => {
    setNavigator('Mozilla/5.0 (Linux; Android 15) Chrome/138.0');
    setStandaloneMedia(false);
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('shows persistent iOS instructions in an uninstalled browser', () => {
    setNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)');
    const service = TestBed.inject(InstallPromptService);

    expect(service.platform()).toBe('ios');
    expect(service.shouldShow()).toBe(true);
    expect(service.nativePromptAvailable()).toBe(false);
  });

  it('captures the Chromium install prompt', () => {
    const service = TestBed.inject(InstallPromptService);
    const { event } = createInstallEvent('dismissed');

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(service.platform()).toBe('other');
    expect(service.nativePromptAvailable()).toBe(true);
  });

  it('stays visible after the user rejects installation', async () => {
    const service = TestBed.inject(InstallPromptService);
    const { event, prompt } = createInstallEvent('dismissed');
    window.dispatchEvent(event);

    await service.install();

    expect(prompt).toHaveBeenCalledOnce();
    expect(service.shouldShow()).toBe(true);
    expect(service.nativePromptAvailable()).toBe(false);
  });

  it('hides after the user accepts installation', async () => {
    const service = TestBed.inject(InstallPromptService);
    const { event } = createInstallEvent('accepted');
    window.dispatchEvent(event);

    await service.install();

    expect(service.shouldShow()).toBe(false);
  });

  it('hides after appinstalled fires', () => {
    const service = TestBed.inject(InstallPromptService);

    window.dispatchEvent(new Event('appinstalled'));

    expect(service.shouldShow()).toBe(false);
  });

  it('hides in standalone display mode and iOS standalone mode', () => {
    setStandaloneMedia(true);
    expect(TestBed.inject(InstallPromptService).shouldShow()).toBe(false);

    TestBed.resetTestingModule();
    setStandaloneMedia(false);
    setNavigator('Mozilla/5.0 (iPhone)', true);
    expect(TestBed.inject(InstallPromptService).shouldShow()).toBe(false);
  });

  it('hides in native Capacitor apps', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

    expect(TestBed.inject(InstallPromptService).shouldShow()).toBe(false);
  });

  it('removes its window listeners when destroyed', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    TestBed.inject(InstallPromptService);

    TestBed.resetTestingModule();

    expect(removeEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function),
    );
  });
});
