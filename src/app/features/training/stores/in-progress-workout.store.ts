import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import { TimerEndAlertService } from '../../../core/timers/timer-end-alert.service';
import { appWorkoutConfig } from '../data/curriculum.data';
import {
  Drill,
  WorkoutInstance,
  WorkoutTemplate,
} from '../models/curriculum.model';
import { InProgressWorkout } from '../models/training-session.model';

const IN_PROGRESS_WORKOUT_KEY = 'training.in-progress-workout';

@Injectable({ providedIn: 'root' })
export class InProgressWorkoutStore {
  private readonly localStorage = inject(LocalStorageService);
  private readonly timerEndAlertService = inject(TimerEndAlertService);
  readonly inProgressWorkout = signal<InProgressWorkout | null>(
    this.readStoredWorkout(),
  );
  readonly hasInProgressWorkout = computed(
    () => this.inProgressWorkout() !== null,
  );
  readonly completedDrillCount = computed(
    () => this.inProgressWorkout()?.completedDrillIds.length ?? 0,
  );

  startOrResumeWorkout(
    workout: WorkoutInstance,
    workoutTemplate: WorkoutTemplate,
  ): InProgressWorkout {
    const existingWorkout = this.inProgressWorkout();

    if (existingWorkout !== null) {
      return existingWorkout;
    }

    const nextWorkout = this.createInProgressWorkout(workout, workoutTemplate);
    this.inProgressWorkout.set(nextWorkout);
    this.localStorage.set(IN_PROGRESS_WORKOUT_KEY, nextWorkout);

    return nextWorkout;
  }

  startCurrentTimer(workoutTemplate: WorkoutTemplate): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout === null || currentWorkout.timer.phase === 'drill-rest') {
      return;
    }

    const currentDrill = this.getCurrentDrill(workoutTemplate, currentWorkout);

    if (
      (currentDrill?.type !== 'duration' && currentDrill?.type !== 'rounds') ||
      currentWorkout.timer.remainingSeconds === null ||
      currentWorkout.timer.remainingSeconds <= 0
    ) {
      return;
    }

    this.persist({
      ...currentWorkout,
      timer: {
        ...currentWorkout.timer,
        phase: 'work',
        status: 'running',
      },
    });
  }

  tickCurrentTimer(workoutTemplate: WorkoutTemplate): void {
    const currentWorkout = this.inProgressWorkout();

    if (
      currentWorkout === null ||
      currentWorkout.timer.status !== 'running' ||
      currentWorkout.timer.remainingSeconds === null
    ) {
      return;
    }

    if (currentWorkout.timer.phase === 'drill-rest') {
      const nextRemainingSeconds = Math.max(
        currentWorkout.timer.remainingSeconds - 1,
        0,
      );

      if (nextRemainingSeconds === 0) {
        void this.timerEndAlertService.playTimerEndAlert();

        this.persist({
          ...currentWorkout,
          timer: this.createInitialTimer(
            this.getCurrentDrill(workoutTemplate, currentWorkout) ?? null,
          ),
        });

        return;
      }

      this.persist({
        ...currentWorkout,
        timer: {
          ...currentWorkout.timer,
          remainingSeconds: nextRemainingSeconds,
        },
      });

      return;
    }

    const currentDrill = this.getCurrentDrill(workoutTemplate, currentWorkout);
    const nextRemainingSeconds = Math.max(
      currentWorkout.timer.remainingSeconds - 1,
      0,
    );

    if (currentDrill?.type === 'duration') {
      if (nextRemainingSeconds === 0) {
        void this.timerEndAlertService.playTimerEndAlert();
      }

      this.persist({
        ...currentWorkout,
        timer: {
          ...currentWorkout.timer,
          phase: 'work',
          status: nextRemainingSeconds === 0 ? 'finished' : 'running',
          remainingSeconds: nextRemainingSeconds,
        },
      });

      return;
    }

    if (currentDrill?.type !== 'rounds') {
      return;
    }

    if (currentWorkout.timer.phase === 'round-rest') {
      if (nextRemainingSeconds === 0) {
        void this.timerEndAlertService.playTimerEndAlert();

        this.persist({
          ...currentWorkout,
          timer: {
            ...currentWorkout.timer,
            phase: 'work',
            status: 'running',
            remainingSeconds: currentDrill.roundsConfig?.roundSeconds ?? null,
            roundNumber: (currentWorkout.timer.roundNumber ?? 0) + 1,
          },
        });

        return;
      }

      this.persist({
        ...currentWorkout,
        timer: {
          ...currentWorkout.timer,
          remainingSeconds: nextRemainingSeconds,
        },
      });

      return;
    }

    if (
      nextRemainingSeconds === 0 &&
      currentWorkout.timer.roundNumber !== null &&
      currentWorkout.timer.totalRounds !== null &&
      currentWorkout.timer.roundNumber < currentWorkout.timer.totalRounds
    ) {
      void this.timerEndAlertService.playTimerEndAlert();

      this.persist({
        ...currentWorkout,
        timer: {
          ...currentWorkout.timer,
          phase: 'round-rest',
          status: 'running',
          remainingSeconds:
            currentDrill.roundsConfig?.restBetweenRoundsSeconds ?? null,
        },
      });

      return;
    }

    if (nextRemainingSeconds === 0) {
      void this.timerEndAlertService.playTimerEndAlert();
    }

    this.persist({
      ...currentWorkout,
      timer: {
        ...currentWorkout.timer,
        phase: 'work',
        status: nextRemainingSeconds === 0 ? 'finished' : 'running',
        remainingSeconds: nextRemainingSeconds,
      },
    });
  }

  pauseCurrentTimer(): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout === null || currentWorkout.timer.status !== 'running') {
      return;
    }

    this.persist({
      ...currentWorkout,
      timer: {
        ...currentWorkout.timer,
        status: 'paused',
      },
    });
  }

  resetCurrentTimer(workoutTemplate: WorkoutTemplate): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout === null) {
      return;
    }

    this.persist({
      ...currentWorkout,
      timer: this.createInitialTimer(
        this.getCurrentDrill(workoutTemplate, currentWorkout) ?? null,
      ),
    });
  }

  markCurrentDrillComplete(workoutTemplate: WorkoutTemplate): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout === null) {
      return;
    }

    const currentDrill = workoutTemplate.drills[currentWorkout.currentDrillIndex];

    if (currentDrill === undefined) {
      return;
    }

    const completedDrillIds = currentWorkout.completedDrillIds.includes(
      currentDrill.id,
    )
      ? currentWorkout.completedDrillIds
      : [...currentWorkout.completedDrillIds, currentDrill.id];
    const nextWorkout =
      currentWorkout.currentDrillIndex === workoutTemplate.drills.length - 1
        ? {
            ...currentWorkout,
            completedDrillIds,
            timer: {
              phase: 'complete' as const,
              status: 'finished' as const,
              remainingSeconds: 0,
              roundNumber: null,
              totalRounds: null,
            },
          }
        : {
            ...currentWorkout,
            completedDrillIds,
            currentDrillIndex: currentWorkout.currentDrillIndex + 1,
            timer: {
              phase: 'drill-rest' as const,
              status: 'running' as const,
              remainingSeconds: appWorkoutConfig.defaultRestSeconds,
              roundNumber: null,
              totalRounds: null,
            },
          };

    this.persist(nextWorkout);
  }

  skipRest(workoutTemplate: WorkoutTemplate): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout === null || currentWorkout.timer.phase !== 'drill-rest') {
      return;
    }

    const currentDrill = workoutTemplate.drills[currentWorkout.currentDrillIndex];

    this.persist({
      ...currentWorkout,
      timer: this.createInitialTimer(currentDrill ?? null),
    });
  }

  addRestSeconds(seconds: number): void {
    const currentWorkout = this.inProgressWorkout();

    if (
      currentWorkout === null ||
      currentWorkout.timer.phase !== 'drill-rest' ||
      currentWorkout.timer.remainingSeconds === null
    ) {
      return;
    }

    this.persist({
      ...currentWorkout,
      timer: {
        ...currentWorkout.timer,
        remainingSeconds: currentWorkout.timer.remainingSeconds + seconds,
      },
    });
  }

  clear(): void {
    this.inProgressWorkout.set(null);
    this.localStorage.remove(IN_PROGRESS_WORKOUT_KEY);
  }

  private createInProgressWorkout(
    workout: WorkoutInstance,
    workoutTemplate: WorkoutTemplate,
  ): InProgressWorkout {
    const firstDrill = workoutTemplate.drills[0] ?? null;

    return {
      workoutId: workout.id,
      workoutTemplateId: workoutTemplate.id,
      workoutLabel: workout.label,
      workoutTitle: workout.title,
      weekNumber: workout.weekNumber,
      drillIds: workoutTemplate.drills.map((drill) => drill.id),
      completedDrillIds: [],
      currentDrillIndex: 0,
      timer: this.createInitialTimer(firstDrill),
      restSeconds: appWorkoutConfig.defaultRestSeconds,
    };
  }

  private createInitialTimer(drill: Drill | null): InProgressWorkout['timer'] {
    if (drill?.type === 'duration') {
      return {
        phase: 'idle',
        status: 'stopped',
        remainingSeconds: drill.durationConfig?.durationSeconds ?? null,
        roundNumber: null,
        totalRounds: null,
      };
    }

    if (drill?.type === 'rounds') {
      return {
        phase: 'idle',
        status: 'stopped',
        remainingSeconds: drill.roundsConfig?.roundSeconds ?? null,
        roundNumber: 1,
        totalRounds: drill.roundsConfig?.rounds ?? null,
      };
    }

    return {
      phase: 'idle',
      status: 'stopped',
      remainingSeconds: null,
      roundNumber: null,
      totalRounds: null,
    };
  }

  private readStoredWorkout(): InProgressWorkout | null {
    const storedWorkout = this.localStorage.get<unknown>(IN_PROGRESS_WORKOUT_KEY);

    return this.isInProgressWorkout(storedWorkout) ? storedWorkout : null;
  }

  private persist(inProgressWorkout: InProgressWorkout): void {
    this.inProgressWorkout.set(inProgressWorkout);
    this.localStorage.set(IN_PROGRESS_WORKOUT_KEY, inProgressWorkout);
  }

  private getCurrentDrill(
    workoutTemplate: WorkoutTemplate,
    currentWorkout: InProgressWorkout,
  ): Drill | null {
    return workoutTemplate.drills[currentWorkout.currentDrillIndex] ?? null;
  }

  private isInProgressWorkout(value: unknown): value is InProgressWorkout {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Partial<InProgressWorkout>;

    return (
      typeof candidate.workoutId === 'string' &&
      typeof candidate.workoutTemplateId === 'string' &&
      typeof candidate.workoutLabel === 'string' &&
      typeof candidate.workoutTitle === 'string' &&
      typeof candidate.weekNumber === 'number' &&
      Array.isArray(candidate.drillIds) &&
      Array.isArray(candidate.completedDrillIds) &&
      typeof candidate.currentDrillIndex === 'number' &&
      typeof candidate.restSeconds === 'number' &&
      typeof candidate.timer === 'object' &&
      candidate.timer !== null
    );
  }
}
