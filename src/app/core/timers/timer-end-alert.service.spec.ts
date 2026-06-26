import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TimerEndAlertService } from './timer-end-alert.service';

describe('TimerEndAlertService', () => {
  const originalAudioContext = globalThis.AudioContext;
  const originalWebkitAudioContext = (
    globalThis as typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    }
  ).webkitAudioContext;

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    });
    (
      globalThis as typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext = originalWebkitAudioContext;
  });

  it('plays a short beep when audio is available', async () => {
    const setValueAtTime = vi.fn();
    const exponentialRampToValueAtTime = vi.fn();
    const connectOscillator = vi.fn();
    const connectGain = vi.fn();
    const start = vi.fn();
    const stop = vi.fn();
    const close = vi.fn().mockResolvedValue(undefined);

    class FakeAudioContext {
      readonly currentTime = 0;
      readonly destination = {};

      createOscillator() {
        const oscillator = {
          type: 'sine',
          frequency: { value: 0 },
          connect: connectOscillator,
          start,
          stop: () => {
            stop();
            queueMicrotask(() => {
              oscillator.onended?.();
            });
          },
          onended: null as (() => void) | null,
        };

        return oscillator;
      }

      createGain() {
        return {
          gain: {
            setValueAtTime,
            exponentialRampToValueAtTime,
          },
          connect: connectGain,
        };
      }

      close = close;
    }

    Object.defineProperty(globalThis, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext,
    });

    await TestBed.inject(TimerEndAlertService).playTimerEndAlert();

    expect(setValueAtTime).toHaveBeenCalled();
    expect(exponentialRampToValueAtTime).toHaveBeenCalledTimes(2);
    expect(connectOscillator).toHaveBeenCalled();
    expect(connectGain).toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('ignores audio failures', async () => {
    class BrokenAudioContext {
      constructor() {
        throw new Error('no audio');
      }
    }

    Object.defineProperty(globalThis, 'AudioContext', {
      configurable: true,
      value: BrokenAudioContext,
    });

    await expect(
      TestBed.inject(TimerEndAlertService).playTimerEndAlert(),
    ).resolves.toBeUndefined();
  });
});
