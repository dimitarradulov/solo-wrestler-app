import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { InProgressWorkout } from '../models/training-session.model';
import { InProgressWorkoutStore } from '../stores/in-progress-workout.store';
import { WorkoutCancellationService } from './workout-cancellation.service';

describe('WorkoutCancellationService', () => {
  const createInProgressWorkout = (
    timerStatus: InProgressWorkout['timer']['status'] = 'stopped',
  ): InProgressWorkout => ({
    workoutId: 'workout-1',
    workoutTemplateId: 'template-1',
    workoutLabel: 'Workout A',
    workoutTitle: 'Foundations',
    weekNumber: 1,
    drillIds: ['drill-1'],
    completedDrillIds: [],
    currentDrillIndex: 0,
    timer: {
      phase: timerStatus === 'running' ? 'work' : 'idle',
      status: timerStatus,
      remainingSeconds: 60,
      roundNumber: null,
      totalRounds: null,
    },
    restSeconds: 120,
  });

  const setup = (workout: InProgressWorkout | null = null) => {
    const inProgressWorkout = signal(workout);
    const pauseCurrentTimer = vi.fn();
    const clear = vi.fn(() => inProgressWorkout.set(null));
    const navigateByUrl = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        WorkoutCancellationService,
        {
          provide: InProgressWorkoutStore,
          useValue: {
            inProgressWorkout,
            pauseCurrentTimer,
            clear,
          },
        },
        {
          provide: Router,
          useValue: { navigateByUrl },
        },
      ],
    });

    return {
      service: TestBed.inject(WorkoutCancellationService),
      clear,
      navigateByUrl,
      pauseCurrentTimer,
    };
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('pauses a running timer before opening confirmation', async () => {
    const { pauseCurrentTimer, service } = setup(
      createInProgressWorkout('running'),
    );

    const confirmation = service.confirmWorkoutCancellation();

    expect(pauseCurrentTimer).toHaveBeenCalledTimes(1);
    expect(service.isCancelWorkoutConfirmationOpen()).toBe(true);

    service.keepTraining();
    await expect(confirmation).resolves.toBe(false);
  });

  it('shares a pending confirmation request', async () => {
    const { service } = setup(createInProgressWorkout());

    const firstConfirmation = service.confirmWorkoutCancellation();
    const secondConfirmation = service.confirmWorkoutCancellation();

    expect(secondConfirmation).toBe(firstConfirmation);

    service.confirmCancelWorkout();
    await expect(firstConfirmation).resolves.toBe(true);
    await expect(secondConfirmation).resolves.toBe(true);
  });

  it('keeps the workout when confirmation is kept or dismissed', async () => {
    const { clear, navigateByUrl, service } = setup(createInProgressWorkout());

    const keptConfirmation = service.confirmWorkoutCancellation();
    service.keepTraining();
    await expect(keptConfirmation).resolves.toBe(false);

    const dismissedConfirmation = service.confirmWorkoutCancellation();
    service.dismissCancelWorkoutConfirmation();
    await expect(dismissedConfirmation).resolves.toBe(false);

    expect(service.isCancelWorkoutConfirmationOpen()).toBe(false);
    expect(clear).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('clears the workout and navigates to Today after button-flow confirmation', async () => {
    const { clear, navigateByUrl, service } = setup(createInProgressWorkout());

    const request = service.requestCancelWorkout();
    service.confirmCancelWorkout();
    await request;

    expect(clear).toHaveBeenCalledTimes(1);
    expect(navigateByUrl).toHaveBeenCalledWith('/tabs/today', {
      replaceUrl: true,
    });
  });

  it('supports direct cancellation without navigation for guard use', () => {
    const { clear, navigateByUrl, service } = setup(createInProgressWorkout());

    service.cancelWorkout();

    expect(clear).toHaveBeenCalledTimes(1);
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
