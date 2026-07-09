import { Injectable } from '@angular/core';
import { Haptics, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class TimerEndAlertService {
  async playTimerEndAlert(): Promise<void> {
    await Promise.all([
      this.playHaptic().catch(() => undefined),
      this.playBeep().catch(() => undefined),
    ]);
  }

  private async playHaptic(): Promise<void> {
    await Haptics.notification({ type: NotificationType.Success });
  }

  private async playBeep(): Promise<void> {
    const AudioContextCtor = this.getAudioContextConstructor();

    if (AudioContextCtor === undefined) {
      return;
    }

    try {
      const audioContext = new AudioContextCtor();
      const oscillator = this.createBeepOscillator(audioContext);

      this.startBeep(oscillator, audioContext.currentTime);
      await this.waitForBeepToEnd(oscillator);
      await audioContext.close();
    } catch {
      return;
    }
  }

  private getAudioContextConstructor(): typeof AudioContext | undefined {
    return (
      globalThis.AudioContext ??
      (
        globalThis as typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext
    );
  }

  private createBeepOscillator(audioContext: AudioContext): OscillatorNode {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.08,
      audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.18,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return oscillator;
  }

  private startBeep(oscillator: OscillatorNode, startTime: number): void {
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.18);
  }

  private async waitForBeepToEnd(oscillator: OscillatorNode): Promise<void> {
    await new Promise<void>((resolve) => {
      oscillator.onended = () => resolve();
    });
  }
}
