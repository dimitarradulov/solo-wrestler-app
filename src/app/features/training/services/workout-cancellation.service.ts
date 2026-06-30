import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { WorkoutSessionStore } from '../stores/workout-session.store';

@Injectable({ providedIn: 'root' })
export class WorkoutCancellationService {
  private readonly workoutSessionStore = inject(WorkoutSessionStore);
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
    this.workoutSessionStore.cancelWorkout();
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
    this.workoutSessionStore.pauseTimer();
  }

  private resolveCancelWorkoutConfirmation(shouldCancelWorkout: boolean): void {
    const resolver = this.cancelWorkoutConfirmationResolver;

    this.cancelWorkoutConfirmationResolver = null;
    this.cancelWorkoutConfirmationPromise = null;
    this.cancelWorkoutConfirmationOpen.set(false);
    resolver?.(shouldCancelWorkout);
  }
}
