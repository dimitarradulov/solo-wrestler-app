import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';

import { WorkoutCancellationService } from '../../services/workout-cancellation.service';
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import type { ActiveWorkoutPage } from './active-workout';

export const activeWorkoutExitGuard: CanDeactivateFn<
  ActiveWorkoutPage
> = async (_component, _currentRoute, _currentState, nextState) => {
  const router = inject(Router);
  const workoutCancellationService = inject(WorkoutCancellationService);
  const workoutSessionStore = inject(WorkoutSessionStore);

  if (nextState?.url === '/workout-completion') {
    return true;
  }

  if (workoutSessionStore.session() === null) {
    return true;
  }

  const shouldCancelWorkout =
    await workoutCancellationService.confirmWorkoutCancellation();

  if (!shouldCancelWorkout) {
    return false;
  }

  workoutSessionStore.cancelWorkout();

  return router.parseUrl('/tabs/today');
};
