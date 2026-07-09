import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  BeforeInstallPromptEvent,
  InstallPromptPlatform,
} from './install-prompt.model';

export type { BeforeInstallPromptEvent };

@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly installed = signal(this.detectStandaloneMode());
  private readonly deferredPrompt = signal<BeforeInstallPromptEvent | null>(
    null,
  );
  private readonly nativeApp = Capacitor.isNativePlatform();

  readonly platform = signal<InstallPromptPlatform>(
    this.detectPlatform(),
  ).asReadonly();
  readonly nativePromptAvailable = computed(
    () => this.deferredPrompt() !== null,
  );
  readonly shouldShow = computed(() => !this.nativeApp && !this.installed());

  constructor() {
    const onBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault();
      this.deferredPrompt.set(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = (): void => {
      this.installed.set(true);
      this.deferredPrompt.set(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    });
  }

  async install(): Promise<void> {
    const prompt = this.deferredPrompt();

    if (prompt === null) {
      return;
    }

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    this.deferredPrompt.set(null);
    if (outcome === 'accepted') {
      this.installed.set(true);
    }
  }

  private detectStandaloneMode(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }

  private detectPlatform(): InstallPromptPlatform {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIPadOs =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

    return isIosDevice || isIPadOs ? 'ios' : 'other';
  }
}
