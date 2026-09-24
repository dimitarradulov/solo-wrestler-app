import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import {
  CurriculumPhase,
  WorkoutInstance,
  WorkoutInstanceId,
  WorkoutTemplate,
} from '../models/curriculum.model';
import { curriculumPhases } from '../data/curriculum.data';
import { grecoCurriculumPhases } from '../data/greco-curriculum.data';
import { WrestlingStyle } from '../models/wrestling-style.model';
import { WrestlingStyleStore } from './wrestling-style.store';
import { OnboardingCompletionStore } from '../../../core/first-launch/onboarding-completion-store';

const completedWorkoutIdsKey = (style: WrestlingStyle) =>
  `curriculum.${style}.completed-workout-ids`;
const LEGACY_COMPLETED_WORKOUT_IDS_KEY = 'curriculum.completed-workout-ids';

export function curriculumPhasesForStyle(
  style: WrestlingStyle,
): CurriculumPhase[] {
  return style === 'freestyle' ? curriculumPhases : grecoCurriculumPhases;
}

@Injectable({ providedIn: 'root' })
export class CurriculumStore {
  private readonly localStorage = inject(LocalStorageService);
  private readonly wrestlingStyleStore = inject(WrestlingStyleStore);
  private readonly onboardingCompletionStore = inject(OnboardingCompletionStore);
  readonly style = computed(
    () => this.wrestlingStyleStore.selectedStyle() ?? 'freestyle',
  );
  private readonly completedWorkoutIds = signal<WorkoutInstanceId[]>([]);
  private readonly completedWorkoutIdSet = computed(
    () => new Set(this.completedWorkoutIds()),
  );
  private readonly orderedWorkouts = computed(() =>
    this.getOrderedWorkouts(this.style()),
  );
  private readonly currentWorkoutId = computed(() => {
    const completedIds = this.completedWorkoutIdSet();

    return (
      this.orderedWorkouts().find((workout) => !completedIds.has(workout.id))
        ?.id ?? null
    );
  });

  readonly totalWorkoutCount = computed(() => this.orderedWorkouts().length);
  readonly currentWorkoutSequenceNumber = computed(() => {
    const currentWorkoutId = this.currentWorkoutId();

    return currentWorkoutId === null
      ? null
      : this.getWorkoutSequenceNumber(currentWorkoutId);
  });

  readonly phases = computed<CurriculumPhase[]>(() => {
    const completedIds = this.completedWorkoutIdSet();
    const currentWorkoutId = this.currentWorkoutId();

    return curriculumPhasesForStyle(this.style()).map((phase) => ({
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

    return currentWorkout === null
      ? null
      : this.getWorkoutTemplate(currentWorkout.workoutTemplateId, this.style());
  });
  readonly currentPhase = computed<CurriculumPhase | null>(() => {
    const currentWorkout = this.currentWorkout();
    const phases = this.phases();

    return currentWorkout === null
      ? phases[phases.length - 1] ?? null
      : phases.find((phase) =>
          phase.weeks.some((week) =>
            week.workouts.some((workout) => workout.id === currentWorkout.id),
          ),
        ) ?? null;
  });

  constructor() {
    const selectedStyle = this.wrestlingStyleStore.selectedStyle();

    if (selectedStyle !== null) {
      this.loadCompletedWorkoutIds(selectedStyle);
    } else if (this.onboardingCompletionStore.isComplete()) {
      this.ensureSelectedStyle();
    }
  }

  ensureSelectedStyle(): WrestlingStyle {
    const selectedStyle = this.wrestlingStyleStore.ensureSelectedStyle();
    this.loadCompletedWorkoutIds(selectedStyle);

    return selectedStyle;
  }

  setStyle(style: WrestlingStyle): void {
    this.wrestlingStyleStore.chooseStyle(style);
    this.loadCompletedWorkoutIds(style);
  }

  getWorkoutSequenceNumber(workoutId: WorkoutInstanceId): number | null {
    const index = this.orderedWorkouts().findIndex(
      (workout) => workout.id === workoutId,
    );

    return index === -1 ? null : index + 1;
  }

  setWorkoutCompleted(
    workoutId: WorkoutInstanceId,
    completed: boolean,
    style: WrestlingStyle = this.style(),
  ): void {
    const orderedWorkouts = this.getOrderedWorkouts(style);
    if (!orderedWorkouts.some((workout) => workout.id === workoutId)) {
      return;
    }

    const currentIds =
      style === this.style()
        ? this.completedWorkoutIds()
        : this.readCompletedWorkoutIds(style);
    const nextCompletedIds = completed
      ? this.addCompletedWorkout(workoutId, currentIds, style)
      : this.removeCompletedWorkoutAndLater(workoutId, currentIds, style);

    if (style === this.style()) {
      this.completedWorkoutIds.set(nextCompletedIds);
    }
    this.localStorage.set(completedWorkoutIdsKey(style), nextCompletedIds);
  }

  private withDerivedStatus(
    workout: WorkoutInstance,
    completedIds: Set<WorkoutInstanceId>,
    currentWorkoutId: WorkoutInstanceId | null,
  ): WorkoutInstance {
    if (completedIds.has(workout.id)) {
      return { ...workout, status: 'completed' };
    }

    return {
      ...workout,
      status: workout.id === currentWorkoutId ? 'current' : 'locked',
    };
  }

  private addCompletedWorkout(
    workoutId: WorkoutInstanceId,
    currentIds: WorkoutInstanceId[],
    style: WrestlingStyle,
  ): WorkoutInstanceId[] {
    const completedIds = new Set(currentIds);
    completedIds.add(workoutId);

    return this.sequentialCompletedWorkoutIds(completedIds, style);
  }

  private removeCompletedWorkoutAndLater(
    workoutId: WorkoutInstanceId,
    currentIds: WorkoutInstanceId[],
    style: WrestlingStyle,
  ): WorkoutInstanceId[] {
    const orderedWorkouts = this.getOrderedWorkouts(style);
    const workoutIndex = orderedWorkouts.findIndex(
      (workout) => workout.id === workoutId,
    );

    return currentIds.filter((completedWorkoutId) => {
      const completedWorkoutIndex = orderedWorkouts.findIndex(
        (workout) => workout.id === completedWorkoutId,
      );

      return completedWorkoutIndex < workoutIndex;
    });
  }

  private loadCompletedWorkoutIds(style: WrestlingStyle): void {
    this.completedWorkoutIds.set(this.readCompletedWorkoutIds(style));
  }

  private readCompletedWorkoutIds(style: WrestlingStyle): WorkoutInstanceId[] {
    const styleKey = completedWorkoutIdsKey(style);
    let storedWorkoutIds = this.localStorage.get<WorkoutInstanceId[]>(styleKey);

    if (storedWorkoutIds === null && style === 'freestyle') {
      storedWorkoutIds = this.localStorage.get<WorkoutInstanceId[]>(
        LEGACY_COMPLETED_WORKOUT_IDS_KEY,
      );
    }

    const completedWorkoutIds = Array.isArray(storedWorkoutIds)
      ? this.sequentialCompletedWorkoutIds(new Set(storedWorkoutIds), style)
      : [];

    if (this.localStorage.get<WorkoutInstanceId[]>(styleKey) === null && completedWorkoutIds.length > 0) {
      this.localStorage.set(styleKey, completedWorkoutIds);
    }

    return completedWorkoutIds;
  }

  private sequentialCompletedWorkoutIds(
    completedIds: Set<WorkoutInstanceId>,
    style: WrestlingStyle,
  ): WorkoutInstanceId[] {
    const sequentialWorkoutIds: WorkoutInstanceId[] = [];

    for (const workout of this.getOrderedWorkouts(style)) {
      if (!completedIds.has(workout.id)) {
        return sequentialWorkoutIds;
      }

      sequentialWorkoutIds.push(workout.id);
    }

    return sequentialWorkoutIds;
  }

  private getOrderedWorkouts(style: WrestlingStyle): WorkoutInstance[] {
    const workouts: WorkoutInstance[] = [];

    for (const phase of curriculumPhasesForStyle(style)) {
      for (const week of phase.weeks) {
        workouts.push(...week.workouts);
      }
    }

    return workouts;
  }

  private getWorkoutTemplate(
    workoutTemplateId: string,
    style: WrestlingStyle,
  ): WorkoutTemplate | null {
    for (const phase of curriculumPhasesForStyle(style)) {
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
