import { computed, inject, Injectable } from '@angular/core';

import { InProgressWorkoutStore } from './in-progress-workout.store';
import { DrillSequenceState } from '../models/training-session.model';
import {
  ActiveWorkoutDrillCardView,
  ActiveWorkoutRestPanelView,
} from '../models/workout-session.model';
import { CurriculumStore } from './curriculum.store';
import {
  CurriculumPhase,
  Drill,
  WorkoutInstance,
  WorkoutTemplate,
} from '../models/curriculum.model';
import { appWorkoutConfig } from '../data/curriculum.data';
import { WorkoutCancellationService } from '../services/workout-cancellation.service';
import {
  coreTechnique,
  drillActionIcon,
  drillActionLabel,
  drillTypeLabel,
  formatClock,
  formatDrillMeta,
  restText,
  timerClock,
  timerLabel,
} from '../utils/workout-session.formatters';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionStore {
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly inProgressWorkoutStore = inject(InProgressWorkoutStore);
  private readonly workoutCancellationService = inject(
    WorkoutCancellationService,
  );
  private readonly phases = this.curriculumStore.phases;

  readonly inProgressWorkout = this.inProgressWorkoutStore.inProgressWorkout;
  readonly hasInProgressWorkout =
    this.inProgressWorkoutStore.hasInProgressWorkout;
  readonly completedDrillCount =
    this.inProgressWorkoutStore.completedDrillCount;
  readonly isCancelWorkoutConfirmationOpen =
    this.workoutCancellationService.isCancelWorkoutConfirmationOpen;
  readonly currentWorkout = computed(() => {
    const inProgressWorkout = this.inProgressWorkout();

    if (inProgressWorkout === null) {
      return this.curriculumStore.currentWorkout();
    }

    return this.findWorkout(inProgressWorkout.workoutId);
  });
  readonly currentWorkoutTemplate = computed(() => {
    const inProgressWorkout = this.inProgressWorkout();

    if (inProgressWorkout === null) {
      return this.curriculumStore.currentWorkoutTemplate();
    }

    return this.findWorkoutTemplate(inProgressWorkout.workoutTemplateId);
  });
  readonly currentPhase = computed(() => {
    const currentWorkout = this.currentWorkout();

    if (currentWorkout === null) {
      return this.curriculumStore.currentPhase();
    }

    return this.findPhaseForWorkout(currentWorkout.id);
  });
  readonly currentDrillTitle = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const inProgressWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return 'None';
    }

    const currentDrillIndex = inProgressWorkout?.currentDrillIndex ?? 0;

    return currentWorkoutTemplate.drills[currentDrillIndex]?.title ?? 'None';
  });
  readonly drillCards = computed<ActiveWorkoutDrillCardView[]>(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const inProgressWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    const completedDrillIds = new Set(
      inProgressWorkout?.completedDrillIds ?? [],
    );
    const currentDrillIndex = inProgressWorkout?.currentDrillIndex ?? 0;
    const timerPhase = inProgressWorkout?.timer.phase ?? 'idle';

    return currentWorkoutTemplate.drills.map((drill, drillIndex) => {
      const state = this.resolveDrillState(
        drill,
        drillIndex,
        currentDrillIndex,
        completedDrillIds,
        timerPhase,
      );

      return {
        drill,
        drillIndex,
        state,
        stateLabel: this.resolveStateLabel(state),
        typeLabel: drillTypeLabel(drill.type),
        meta: formatDrillMeta(drill),
        coreTechnique: coreTechnique(drill),
        actionEnabled:
          state === 'current' &&
          inProgressWorkout?.timer.phase !== 'drill-rest' &&
          inProgressWorkout?.timer.phase !== 'round-rest',
        actionLabel: this.resolveActionLabel(drill, drillIndex),
        actionIcon: this.resolveActionIcon(drill, drillIndex),
        timerLabel: this.resolveTimerLabel(drill, drillIndex),
        timerClock: this.resolveTimerClock(drill, drillIndex),
        showTimerPreview: drill.type === 'duration' || drill.type === 'rounds',
        showTimerControls:
          drillIndex === inProgressWorkout?.currentDrillIndex &&
          (drill.type === 'duration' || drill.type === 'rounds') &&
          inProgressWorkout.timer.phase !== 'drill-rest',
        restText: restText(drill, appWorkoutConfig.defaultRestSeconds),
      };
    });
  });
  readonly restPanel = computed<ActiveWorkoutRestPanelView | null>(() => {
    const inProgressWorkout = this.inProgressWorkout();

    if (inProgressWorkout?.timer.phase !== 'drill-rest') {
      return null;
    }

    return {
      afterDrillIndex: inProgressWorkout.currentDrillIndex - 1,
      clock: this.formatOptionalClock(inProgressWorkout.timer.remainingSeconds),
    };
  });
  readonly canFinishWorkout = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return false;
    }

    return this.completedDrillCount() === currentWorkoutTemplate.drills.length;
  });
  readonly estimatedMinutes = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return null;
    }

    return `${currentWorkoutTemplate.estimatedMinutes.min}-${currentWorkoutTemplate.estimatedMinutes.max} min`;
  });
  readonly progressionFocus = computed(() => {
    const currentPhase = this.currentPhase();
    const currentWorkout = this.currentWorkout();

    if (currentPhase === null || currentWorkout === null) {
      return null;
    }

    return (
      currentPhase.weeks.find(
        (week) => week.number === currentWorkout.weekNumber,
      )?.progressionFocus ?? null
    );
  });
  readonly phaseTitle = computed(() => this.currentPhase()?.title ?? null);

  startOrResumeCurrentWorkout(): void {
    const currentWorkout = this.curriculumStore.currentWorkout();
    const currentWorkoutTemplate =
      this.curriculumStore.currentWorkoutTemplate();

    if (currentWorkout === null || currentWorkoutTemplate === null) {
      return;
    }

    this.inProgressWorkoutStore.startOrResumeWorkout(
      currentWorkout,
      currentWorkoutTemplate,
    );
  }

  handleDrillAction(drillIndex: number): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (
      currentWorkoutTemplate === null ||
      currentWorkout === null ||
      currentWorkout.currentDrillIndex !== drillIndex
    ) {
      return;
    }

    const currentDrill = currentWorkoutTemplate.drills[drillIndex];

    if (currentDrill?.type === 'reps') {
      this.inProgressWorkoutStore.markCurrentDrillComplete(
        currentWorkoutTemplate,
      );
      return;
    }

    if (
      currentWorkout.timer.status === 'finished' &&
      (currentDrill?.type === 'duration' || currentDrill?.type === 'rounds')
    ) {
      this.inProgressWorkoutStore.markCurrentDrillComplete(
        currentWorkoutTemplate,
      );
      return;
    }

    if (currentDrill?.type === 'duration' || currentDrill?.type === 'rounds') {
      this.inProgressWorkoutStore.startCurrentTimer(currentWorkoutTemplate);
    }
  }

  pauseTimer(drillIndex: number): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout?.currentDrillIndex !== drillIndex) {
      return;
    }

    this.inProgressWorkoutStore.pauseCurrentTimer();
  }

  resetTimer(drillIndex: number): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (
      currentWorkoutTemplate === null ||
      currentWorkout?.currentDrillIndex !== drillIndex
    ) {
      return;
    }

    this.inProgressWorkoutStore.resetCurrentTimer(currentWorkoutTemplate);
  }

  skipRest(): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return;
    }

    this.inProgressWorkoutStore.skipRest(currentWorkoutTemplate);
  }

  addRestSeconds(seconds: number): void {
    this.inProgressWorkoutStore.addRestSeconds(seconds);
  }

  tickCurrentTimer(): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return;
    }

    this.inProgressWorkoutStore.tickCurrentTimer(currentWorkoutTemplate);
  }

  pauseRunningTimer(): void {
    if (this.inProgressWorkout()?.timer.status !== 'running') {
      return;
    }

    this.inProgressWorkoutStore.pauseCurrentTimer();
  }

  resumePausedTimer(): void {
    this.inProgressWorkoutStore.resumeCurrentTimer();
  }

  requestCancelWorkout(): Promise<void> {
    return this.workoutCancellationService.requestCancelWorkout();
  }

  confirmWorkoutCancellation(): Promise<boolean> {
    return this.workoutCancellationService.confirmWorkoutCancellation();
  }

  cancelWorkout(): void {
    this.workoutCancellationService.cancelWorkout();
  }

  keepTraining(): void {
    this.workoutCancellationService.keepTraining();
  }

  confirmCancelWorkout(): void {
    this.workoutCancellationService.confirmCancelWorkout();
  }

  dismissCancelWorkoutConfirmation(): void {
    this.workoutCancellationService.dismissCancelWorkoutConfirmation();
  }

  private resolveActionLabel(drill: Drill, drillIndex: number): string {
    const currentWorkout = this.inProgressWorkout();

    if (drill.type === 'reps') {
      return 'Mark Complete';
    }

    if (
      currentWorkout?.currentDrillIndex === drillIndex &&
      currentWorkout.timer.status === 'finished'
    ) {
      return 'Mark Complete';
    }

    return drillActionLabel(drill);
  }

  private resolveActionIcon(drill: Drill, drillIndex: number): string {
    const currentWorkout = this.inProgressWorkout();

    if (
      drill.type !== 'reps' &&
      currentWorkout?.currentDrillIndex === drillIndex &&
      currentWorkout.timer.status === 'finished'
    ) {
      return 'checkmark-circle-outline';
    }

    return drillActionIcon(drill);
  }

  private resolveTimerLabel(drill: Drill, drillIndex: number): string {
    const currentWorkout = this.inProgressWorkout();

    if (
      drillIndex === currentWorkout?.currentDrillIndex &&
      drill.type === 'rounds' &&
      currentWorkout.timer.roundNumber !== null &&
      currentWorkout.timer.totalRounds !== null
    ) {
      return `Round ${currentWorkout.timer.roundNumber} of ${currentWorkout.timer.totalRounds}`;
    }

    return timerLabel(drill);
  }

  private resolveTimerClock(drill: Drill, drillIndex: number): string {
    const currentWorkout = this.inProgressWorkout();

    if (
      drillIndex === currentWorkout?.currentDrillIndex &&
      currentWorkout.timer.phase !== 'drill-rest' &&
      currentWorkout.timer.remainingSeconds !== null &&
      (drill.type === 'duration' || drill.type === 'rounds')
    ) {
      return formatClock(currentWorkout.timer.remainingSeconds);
    }

    return timerClock(drill);
  }

  private resolveDrillState(
    drill: Drill,
    drillIndex: number,
    currentDrillIndex: number,
    completedDrillIds: Set<string>,
    timerPhase: 'idle' | 'work' | 'round-rest' | 'drill-rest' | 'complete',
  ): DrillSequenceState {
    if (completedDrillIds.has(drill.id)) {
      return 'completed';
    }

    if (timerPhase === 'drill-rest') {
      return 'queued';
    }

    if (drillIndex === currentDrillIndex) {
      return 'current';
    }

    return 'queued';
  }

  private resolveStateLabel(state: DrillSequenceState): string {
    if (state === 'completed') {
      return 'Complete';
    }

    if (state === 'current') {
      return 'Current';
    }

    return 'Queued';
  }

  private formatOptionalClock(remainingSeconds: number | null): string {
    return remainingSeconds === null ? '0:00' : formatClock(remainingSeconds);
  }

  private findWorkout(workoutId: string): WorkoutInstance | null {
    for (const phase of this.phases()) {
      for (const week of phase.weeks) {
        const workout = week.workouts.find((item) => item.id === workoutId);

        if (workout) {
          return workout;
        }
      }
    }

    return null;
  }

  private findWorkoutTemplate(
    workoutTemplateId: string,
  ): WorkoutTemplate | null {
    for (const phase of this.phases()) {
      const workoutTemplate =
        phase.workoutTemplates.find((item) => item.id === workoutTemplateId) ??
        null;

      if (workoutTemplate) {
        return workoutTemplate;
      }
    }

    return null;
  }

  private findPhaseForWorkout(workoutId: string): CurriculumPhase | null {
    return (
      this.phases().find((phase) =>
        phase.weeks.some((week) =>
          week.workouts.some((workout) => workout.id === workoutId),
        ),
      ) ?? null
    );
  }
}
