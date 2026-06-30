import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { WorkoutCancellationService } from '../../services/workout-cancellation.service';
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import type { ActiveWorkoutPage } from './active-workout';
import { activeWorkoutExitGuard } from './active-workout-exit.guard';

describe('activeWorkoutExitGuard', () => {
  const session = signal({} as ReturnType<WorkoutSessionStore['session']>);
  const confirmWorkoutCancellation = vi.fn();
  const cancelWorkout = vi.fn();
  const component = {} as ActiveWorkoutPage;
  const createRouterState = (url: string) =>
    ({ url }) as unknown as RouterStateSnapshot;

  const runGuard = (nextUrl: string) =>
    TestBed.runInInjectionContext(() =>
      activeWorkoutExitGuard(
        component,
        {} as never,
        {} as never,
        createRouterState(nextUrl),
      ),
    );

  beforeEach(() => {
    session.set({} as ReturnType<WorkoutSessionStore['session']>);
    confirmWorkoutCancellation.mockReset();
    cancelWorkout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: WorkoutSessionStore,
          useValue: {
            session,
            cancelWorkout,
          },
        },
        {
          provide: WorkoutCancellationService,
          useValue: {
            confirmWorkoutCancellation,
          },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('allows the normal workout completion route', async () => {
    await expect(runGuard('/workout-completion')).resolves.toBe(true);
    expect(confirmWorkoutCancellation).not.toHaveBeenCalled();
  });

  it('allows navigation when there is no active workout session', async () => {
    session.set(null);

    await expect(runGuard('/tabs/today')).resolves.toBe(true);
    expect(confirmWorkoutCancellation).not.toHaveBeenCalled();
  });

  it('keeps the user on the active workout when cancellation is dismissed', async () => {
    confirmWorkoutCancellation.mockResolvedValue(false);

    await expect(runGuard('/tabs/today')).resolves.toBe(false);
    expect(cancelWorkout).not.toHaveBeenCalled();
  });

  it('cancels the workout and redirects to Today when confirmed', async () => {
    const router = TestBed.inject(Router);
    confirmWorkoutCancellation.mockResolvedValue(true);
    const result = await runGuard('/tabs/today');

    expect(cancelWorkout).toHaveBeenCalledTimes(1);
    expect(router.serializeUrl(result as ReturnType<Router['parseUrl']>)).toBe(
      '/tabs/today',
    );
  });
});
