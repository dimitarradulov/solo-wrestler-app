import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { InProgressWorkoutStore } from '../stores/in-progress-workout.store';

@Injectable({ providedIn: 'root' })
export class WorkoutCancellationService {
  private readonly inProgressWorkoutStore = inject(InProgressWorkoutStore);
  private readonly router = inject(Router);
  private readonly cancelWorkoutConfirmationOpen = signal(false);
  private cancelWorkoutConfirmationResolver:
    | ((shouldCancelWorkout: boolean) => void)
    | null = null;
  private cancelWorkoutConfirmationPromise: Promise<boolean> | null = null;

  readonly isCancelWorkoutConfirmationOpen =
    this.cancelWorkoutConfirmationOpen.asReadonly();

  async requestCancelWorkout(): Promise<void> {
    const shouldCancelWorkout = await this.confirmWorkoutCancellation();

    if (!shouldCancelWorkout) {
      return;
    }

    this.cancelWorkout();
    void this.router.navigateByUrl('/tabs/today', { replaceUrl: true });
  }

  confirmWorkoutCancellation(): Promise<boolean> {
    this.pauseRunningTimer();

    if (this.cancelWorkoutConfirmationPromise !== null) {
      return this.cancelWorkoutConfirmationPromise;
    }

    this.cancelWorkoutConfirmationOpen.set(true);
    this.cancelWorkoutConfirmationPromise = new Promise<boolean>((resolve) => {
      this.cancelWorkoutConfirmationResolver = resolve;
    });

    return this.cancelWorkoutConfirmationPromise;
  }

  cancelWorkout(): void {
    this.inProgressWorkoutStore.clear();
  }

  keepTraining(): void {
    this.resolveCancelWorkoutConfirmation(false);
  }

  confirmCancelWorkout(): void {
    this.resolveCancelWorkoutConfirmation(true);
  }

  dismissCancelWorkoutConfirmation(): void {
    this.resolveCancelWorkoutConfirmation(false);
  }

  private pauseRunningTimer(): void {
    if (
      this.inProgressWorkoutStore.inProgressWorkout()?.timer.status !==
      'running'
    ) {
      return;
    }

    this.inProgressWorkoutStore.pauseCurrentTimer();
  }

  private resolveCancelWorkoutConfirmation(shouldCancelWorkout: boolean): void {
    const resolver = this.cancelWorkoutConfirmationResolver;

    this.cancelWorkoutConfirmationResolver = null;
    this.cancelWorkoutConfirmationPromise = null;
    this.cancelWorkoutConfirmationOpen.set(false);
    resolver?.(shouldCancelWorkout);
  }
}
