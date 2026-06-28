import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import {
  CurriculumPhase,
  WorkoutInstance,
  WorkoutInstanceId,
  WorkoutTemplate,
} from '../models/curriculum.model';
import { curriculumPhases } from '../data/curriculum.data';

const COMPLETED_WORKOUT_IDS_KEY = 'curriculum.completed-workout-ids';

@Injectable({ providedIn: 'root' })
export class CurriculumStore {
  private readonly localStorage = inject(LocalStorageService);
  private readonly orderedWorkouts = this.getOrderedWorkouts();
  private readonly validWorkoutIds = new Set(
    this.orderedWorkouts.map((workout) => workout.id),
  );
  private readonly completedWorkoutIds = signal<WorkoutInstanceId[]>(
    this.readCompletedWorkoutIds(),
  );
  private readonly completedWorkoutIdSet = computed(
    () => new Set(this.completedWorkoutIds()),
  );
  private readonly currentWorkoutId = computed(() => {
    const completedIds = this.completedWorkoutIdSet();

    return (
      this.orderedWorkouts.find((workout) => !completedIds.has(workout.id))
        ?.id ?? null
    );
  });

  readonly totalWorkoutCount = computed(() => this.orderedWorkouts.length);
  readonly currentWorkoutSequenceNumber = computed(() => {
    const currentWorkoutId = this.currentWorkoutId();

    if (currentWorkoutId === null) {
      return null;
    }

    return this.getWorkoutSequenceNumber(currentWorkoutId);
  });

  getWorkoutSequenceNumber(workoutId: WorkoutInstanceId): number | null {
    const index = this.orderedWorkouts.findIndex(
      (workout) => workout.id === workoutId,
    );

    return index === -1 ? null : index + 1;
  }

  readonly phases = computed<CurriculumPhase[]>(() => {
    const completedIds = this.completedWorkoutIdSet();
    const currentWorkoutId = this.currentWorkoutId();

    return curriculumPhases.map((phase) => ({
      ...phase,
      weeks: phase.weeks.map((week) => ({
        ...week,
        workouts: week.workouts.map((workout) =>
          this.withDerivedStatus(workout, completedIds, currentWorkoutId),
        ),
      })),
    }));
  });
  readonly currentWorkout = computed<WorkoutInstance | null>(() => {
    const currentWorkoutId = this.currentWorkoutId();

    if (currentWorkoutId === null) {
      return null;
    }

    for (const phase of this.phases()) {
      for (const week of phase.weeks) {
        const currentWorkout = week.workouts.find(
          (workout) => workout.id === currentWorkoutId,
        );

        if (currentWorkout) {
          return currentWorkout;
        }
      }
    }

    return null;
  });
  readonly currentWorkoutTemplate = computed<WorkoutTemplate | null>(() => {
    const currentWorkout = this.currentWorkout();

    if (currentWorkout === null) {
      return null;
    }

    return this.getWorkoutTemplate(currentWorkout.workoutTemplateId);
  });
  readonly currentPhase = computed<CurriculumPhase | null>(() => {
    const currentWorkout = this.currentWorkout();

    if (currentWorkout === null) {
      const phases = this.phases();

      return phases.length > 0 ? phases[phases.length - 1] : null;
    }

    return (
      this.phases().find((phase) =>
        phase.weeks.some((week) =>
          week.workouts.some((workout) => workout.id === currentWorkout.id),
        ),
      ) ?? null
    );
  });

  setWorkoutCompleted(workoutId: WorkoutInstanceId, completed: boolean): void {
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
    workout: WorkoutInstance,
    completedIds: Set<WorkoutInstanceId>,
    currentWorkoutId: WorkoutInstanceId | null,
  ): WorkoutInstance {
    if (completedIds.has(workout.id)) {
      return { ...workout, status: 'completed' };
    }

    if (workout.id === currentWorkoutId) {
      return { ...workout, status: 'current' };
    }

    return { ...workout, status: 'locked' };
  }

  private addCompletedWorkout(
    workoutId: WorkoutInstanceId,
  ): WorkoutInstanceId[] {
    const completedIds = new Set(this.completedWorkoutIds());
    completedIds.add(workoutId);

    return this.sequentialCompletedWorkoutIds(completedIds);
  }

  private removeCompletedWorkoutAndLater(
    workoutId: WorkoutInstanceId,
  ): WorkoutInstanceId[] {
    const workoutIndex = this.orderedWorkouts.findIndex(
      (workout) => workout.id === workoutId,
    );

    return this.completedWorkoutIds().filter((completedWorkoutId) => {
      const completedWorkoutIndex = this.orderedWorkouts.findIndex(
        (workout) => workout.id === completedWorkoutId,
      );

      return completedWorkoutIndex < workoutIndex;
    });
  }

  private readCompletedWorkoutIds(): WorkoutInstanceId[] {
    const storedWorkoutIds =
      this.localStorage.get<WorkoutInstanceId[]>(COMPLETED_WORKOUT_IDS_KEY) ??
      [];

    if (!Array.isArray(storedWorkoutIds)) {
      return [];
    }

    return this.sequentialCompletedWorkoutIds(new Set(storedWorkoutIds));
  }

  private sequentialCompletedWorkoutIds(
    completedIds: Set<WorkoutInstanceId>,
  ): WorkoutInstanceId[] {
    const sequentialWorkoutIds: WorkoutInstanceId[] = [];

    for (const workout of this.orderedWorkouts) {
      if (!completedIds.has(workout.id)) {
        return sequentialWorkoutIds;
      }

      sequentialWorkoutIds.push(workout.id);
    }

    return sequentialWorkoutIds;
  }

  private getOrderedWorkouts(): WorkoutInstance[] {
    const workouts: WorkoutInstance[] = [];

    for (const phase of curriculumPhases) {
      for (const week of phase.weeks) {
        workouts.push(...week.workouts);
      }
    }

    return workouts;
  }

  private getWorkoutTemplate(
    workoutTemplateId: string,
  ): WorkoutTemplate | null {
    for (const phase of curriculumPhases) {
      const workoutTemplate =
        phase.workoutTemplates.find(
          (template) => template.id === workoutTemplateId,
        ) ?? null;

      if (workoutTemplate) {
        return workoutTemplate;
      }
    }

    return null;
  }
}
