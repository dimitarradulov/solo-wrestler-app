import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import {
  CurriculumPhase,
  CurriculumWorkout,
  CurriculumWorkoutId,
} from './model/curriculum.model';
import { curriculumPhases } from './data/curriculum.data';

const COMPLETED_WORKOUT_IDS_KEY = 'curriculum.completed-workout-ids';

@Injectable({ providedIn: 'root' })
export class CurriculumStore {
  private readonly localStorage = inject(LocalStorageService);
  private readonly orderedWorkouts = this.getOrderedWorkouts();
  private readonly validWorkoutIds = new Set(
    this.orderedWorkouts.map((workout) => workout.id)
  );
  private readonly completedWorkoutIds = signal<CurriculumWorkoutId[]>(
    this.readCompletedWorkoutIds()
  );
  private readonly completedWorkoutIdSet = computed(
    () => new Set(this.completedWorkoutIds())
  );
  private readonly currentWorkoutId = computed(() => {
    const completedIds = this.completedWorkoutIdSet();

    return (
      this.orderedWorkouts.find((workout) => !completedIds.has(workout.id))
        ?.id ?? null
    );
  });

  readonly phases = computed<CurriculumPhase[]>(() => {
    const completedIds = this.completedWorkoutIdSet();
    const currentWorkoutId = this.currentWorkoutId();

    return curriculumPhases.map((phase) => ({
      ...phase,
      weeks: phase.weeks.map((week) => ({
        ...week,
        workouts: week.workouts.map((workout) =>
          this.withDerivedStatus(workout, completedIds, currentWorkoutId)
        ),
      })),
    }));
  });

  setWorkoutCompleted(
    workoutId: CurriculumWorkoutId,
    completed: boolean
  ): void {
    if (!this.validWorkoutIds.has(workoutId)) {
      return;
    }

    const nextCompletedIds = completed
      ? this.addCompletedWorkout(workoutId)
      : this.removeCompletedWorkoutAndLater(workoutId);

    this.completedWorkoutIds.set(nextCompletedIds);
    this.localStorage.set(COMPLETED_WORKOUT_IDS_KEY, nextCompletedIds);
  }

  private withDerivedStatus(
    workout: CurriculumWorkout,
    completedIds: Set<CurriculumWorkoutId>,
    currentWorkoutId: CurriculumWorkoutId | null
  ): CurriculumWorkout {
    if (completedIds.has(workout.id)) {
      return { ...workout, status: 'completed' };
    }

    if (workout.id === currentWorkoutId) {
      return { ...workout, status: 'current' };
    }

    return { ...workout, status: 'locked' };
  }

  private addCompletedWorkout(
    workoutId: CurriculumWorkoutId
  ): CurriculumWorkoutId[] {
    const completedIds = new Set(this.completedWorkoutIds());
    completedIds.add(workoutId);

    return this.sequentialCompletedWorkoutIds(completedIds);
  }

  private removeCompletedWorkoutAndLater(
    workoutId: CurriculumWorkoutId
  ): CurriculumWorkoutId[] {
    const workoutIndex = this.orderedWorkouts.findIndex(
      (workout) => workout.id === workoutId
    );

    return this.completedWorkoutIds().filter((completedWorkoutId) => {
      const completedWorkoutIndex = this.orderedWorkouts.findIndex(
        (workout) => workout.id === completedWorkoutId
      );

      return completedWorkoutIndex < workoutIndex;
    });
  }

  private readCompletedWorkoutIds(): CurriculumWorkoutId[] {
    const storedWorkoutIds =
      this.localStorage.get<CurriculumWorkoutId[]>(COMPLETED_WORKOUT_IDS_KEY) ??
      [];

    if (!Array.isArray(storedWorkoutIds)) {
      return [];
    }

    return this.sequentialCompletedWorkoutIds(new Set(storedWorkoutIds));
  }

  private sequentialCompletedWorkoutIds(
    completedIds: Set<CurriculumWorkoutId>
  ): CurriculumWorkoutId[] {
    const sequentialWorkoutIds: CurriculumWorkoutId[] = [];

    for (const workout of this.orderedWorkouts) {
      if (!completedIds.has(workout.id)) {
        return sequentialWorkoutIds;
      }

      sequentialWorkoutIds.push(workout.id);
    }

    return sequentialWorkoutIds;
  }

  private getOrderedWorkouts(): CurriculumWorkout[] {
    const workouts: CurriculumWorkout[] = [];

    for (const phase of curriculumPhases) {
      for (const week of phase.weeks) {
        workouts.push(...week.workouts);
      }
    }

    return workouts;
  }
}
