import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';

import type { ActiveWorkoutPage } from './active-workout';

export const activeWorkoutExitGuard: CanDeactivateFn<
  ActiveWorkoutPage
> = async (component, _currentRoute, _currentState, nextState) => {
  const router = inject(Router);

  if (nextState?.url === '/workout-completion') {
    return true;
  }

  if (!component.hasInProgressWorkout()) {
    return true;
  }

  const shouldCancelWorkout = await component.confirmWorkoutCancellation();

  if (!shouldCancelWorkout) {
    return false;
  }

  component.cancelWorkout();

  return router.parseUrl('/tabs/today');
};
