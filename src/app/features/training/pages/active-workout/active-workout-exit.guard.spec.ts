import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import type { ActiveWorkoutPage } from './active-workout';
import { activeWorkoutExitGuard } from './active-workout-exit.guard';

describe('activeWorkoutExitGuard', () => {
  const createRouterState = (url: string) =>
    ({ url }) as unknown as RouterStateSnapshot;

  const runGuard = (component: ActiveWorkoutPage, nextUrl: string) =>
    TestBed.runInInjectionContext(() =>
      activeWorkoutExitGuard(
        component,
        {} as never,
        {} as never,
        createRouterState(nextUrl),
      ),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('allows the normal workout completion route', async () => {
    const component = {
      hasInProgressWorkout: signal(true),
      confirmWorkoutCancellation: vi.fn(),
      cancelWorkout: vi.fn(),
    } as unknown as ActiveWorkoutPage;

    await expect(runGuard(component, '/workout-completion')).resolves.toBe(
      true,
    );
    expect(component.confirmWorkoutCancellation).not.toHaveBeenCalled();
  });

  it('keeps the user on the active workout when cancellation is dismissed', async () => {
    const component = {
      hasInProgressWorkout: signal(true),
      confirmWorkoutCancellation: vi.fn().mockResolvedValue(false),
      cancelWorkout: vi.fn(),
    } as unknown as ActiveWorkoutPage;

    await expect(runGuard(component, '/tabs/today')).resolves.toBe(false);
    expect(component.cancelWorkout).not.toHaveBeenCalled();
  });

  it('cancels the workout and redirects to Today when confirmed', async () => {
    const router = TestBed.inject(Router);
    const component = {
      hasInProgressWorkout: signal(true),
      confirmWorkoutCancellation: vi.fn().mockResolvedValue(true),
      cancelWorkout: vi.fn(),
    } as unknown as ActiveWorkoutPage;
    const result = await runGuard(component, '/tabs/today');

    expect(component.cancelWorkout).toHaveBeenCalledTimes(1);
    expect(router.serializeUrl(result as ReturnType<Router['parseUrl']>)).toBe(
      '/tabs/today',
    );
  });
});
