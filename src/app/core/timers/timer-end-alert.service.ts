import { Injectable } from '@angular/core';
import { Haptics, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class TimerEndAlertService {
  async playTimerEndAlert(): Promise<void> {
    await Promise.all([this.playHaptic(), this.playBeep()]);
  }

  private async playHaptic(): Promise<void> {
    await Haptics.notification({ type: NotificationType.Success });
  }

  private async playBeep(): Promise<void> {
    const AudioContextCtor =
      globalThis.AudioContext ??
      (
        globalThis as typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (AudioContextCtor === undefined) {
      return;
    }

    let audioContext: AudioContext | null = null;

    audioContext = new AudioContextCtor();
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
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.18);

    await new Promise<void>((resolve) => {
      oscillator.onended = () => resolve();
    });

    await audioContext?.close();
  }
}
