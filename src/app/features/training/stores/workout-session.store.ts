import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import {
  DrillSequenceState,
  InProgressWorkout,
} from '../models/training-session.model';
import {
  ActiveWorkoutDrillCardView,
  ActiveWorkoutRestPanelView,
  WorkoutSession,
} from '../models/workout-session.model';
import { CurriculumStore } from './curriculum.store';
import {
  CurriculumPhase,
  Drill,
  WorkoutInstance,
  WorkoutTemplate,
} from '../models/curriculum.model';
import { TimerEndAlertService } from '../../../core/timers/timer-end-alert.service';
import { appWorkoutConfig } from '../data/curriculum.data';
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

const IN_PROGRESS_WORKOUT_KEY = 'training.in-progress-workout';

@Injectable({ providedIn: 'root' })
export class WorkoutSessionStore {
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly localStorage = inject(LocalStorageService);
  private readonly timerEndAlertService = inject(TimerEndAlertService);
  private readonly phases = this.curriculumStore.phases;
  private readonly inProgressWorkout = signal<InProgressWorkout | null>(
    this.readStoredWorkout(),
  );

  readonly session = computed<WorkoutSession | null>(() => {
    const inProgressWorkout = this.inProgressWorkout();

    if (inProgressWorkout === null) {
      return null;
    }

    const workout = this.findWorkout(inProgressWorkout.workoutId);
    const workoutTemplate = this.findWorkoutTemplate(
      inProgressWorkout.workoutTemplateId,
    );

    if (workout === null || workoutTemplate === null) {
      return null;
    }

    const completedDrillIds = new Set(
      inProgressWorkout.completedDrillIds,
    );
    const currentDrill = workoutTemplate.drills[inProgressWorkout.currentDrillIndex] ?? null;
    const phase = this.findPhaseForWorkout(workout.id);
    const drills = workoutTemplate.drills.map((drill, drillIndex) => ({
      drill,
      drillIndex,
      state: this.resolveDrillState(
        drill,
        drillIndex,
        inProgressWorkout.currentDrillIndex,
        completedDrillIds,
        inProgressWorkout.timer.phase,
      ),
    }));

    return {
      workout,
      workoutTemplate,
      phaseTitle: phase?.title ?? null,
      progressionFocus:
        phase?.weeks.find((week) => week.number === workout.weekNumber)
          ?.progressionFocus ?? null,
      completedDrillCount: inProgressWorkout.completedDrillIds.length,
      currentDrillIndex: inProgressWorkout.currentDrillIndex,
      currentDrill,
      drills,
      timer: inProgressWorkout.timer,
      action: this.resolveCurrentAction(currentDrill, inProgressWorkout.timer),
      canFinish:
        inProgressWorkout.completedDrillIds.length === workoutTemplate.drills.length,
    };
  });
  readonly drillCards = computed<ActiveWorkoutDrillCardView[]>(() => {
    const session = this.session();

    if (session === null) {
      return [];
    }

    return session.drills.map(({ drill, drillIndex, state }) => ({
      drill,
      drillIndex,
      state,
      stateLabel: this.resolveStateLabel(state),
      typeLabel: drillTypeLabel(drill.type),
      meta: formatDrillMeta(drill),
      coreTechnique: coreTechnique(drill),
      actionEnabled:
        state === 'current' &&
        session.timer.phase !== 'drill-rest' &&
        session.timer.phase !== 'round-rest',
      actionLabel: this.resolveActionLabel(drill, drillIndex),
      actionIcon: this.resolveActionIcon(drill, drillIndex),
      timerLabel: this.resolveTimerLabel(drill, drillIndex),
      timerClock: this.resolveTimerClock(drill, drillIndex),
      showTimerPreview: drill.type === 'duration' || drill.type === 'rounds',
      showTimerControls:
        drillIndex === session.currentDrillIndex &&
        (drill.type === 'duration' || drill.type === 'rounds') &&
        session.timer.phase !== 'drill-rest',
      restText: restText(drill, appWorkoutConfig.defaultRestSeconds),
    }));
  });
  readonly restPanel = computed<ActiveWorkoutRestPanelView | null>(() => {
    const session = this.session();

    if (session?.timer.phase !== 'drill-rest') {
      return null;
    }

    return {
      afterDrillIndex: session.currentDrillIndex - 1,
      clock: this.formatOptionalClock(session.timer.remainingSeconds),
    };
  });
  readonly currentWorkout = computed(() => this.session()?.workout ?? null);
  readonly currentWorkoutTemplate = computed(
    () => this.session()?.workoutTemplate ?? null,
  );
  readonly completedDrillCount = computed(
    () => this.session()?.completedDrillCount ?? 0,
  );
  readonly currentDrillTitle = computed(
    () => this.session()?.currentDrill?.title ?? 'None',
  );
  readonly canFinishWorkout = computed(() => this.session()?.canFinish ?? false);
  readonly estimatedMinutes = computed(() => {
    const workoutTemplate = this.session()?.workoutTemplate;

    if (workoutTemplate === null || workoutTemplate === undefined) {
      return null;
    }

    const { min, max } = workoutTemplate.estimatedMinutes;

    return min === max ? `${min} min` : `${min}-${max} min`;
  });
  readonly progressionFocus = computed(() => this.session()?.progressionFocus ?? null);
  readonly phaseTitle = computed(() => this.session()?.phaseTitle ?? null);

  startOrResumeCurrentWorkout(): void {
    const currentWorkout = this.curriculumStore.currentWorkout();
    const currentWorkoutTemplate =
      this.curriculumStore.currentWorkoutTemplate();

    if (currentWorkout === null || currentWorkoutTemplate === null) {
      return;
    }

    if (this.inProgressWorkout() !== null) {
      return;
    }

    this.persist(
      this.createInProgressWorkout(currentWorkout, currentWorkoutTemplate),
    );
  }

  performCurrentDrillAction(): void {
    const session = this.session();

    if (session === null || session.currentDrill === null) {
      return;
    }

    if (session.action === 'mark-complete') {
      this.markCurrentDrillComplete(session.workoutTemplate);
      return;
    }

    if (session.action === 'start') {
      this.startCurrentTimer(session.workoutTemplate);
    }
  }

  pauseTimer(): void {
    const session = this.session();

    if (session?.timer.status !== 'running') {
      return;
    }

    this.persist({
      ...this.inProgressWorkout()!,
      timer: {
        ...session.timer,
        status: 'paused',
      },
    });
  }

  resumeTimer(): void {
    const session = this.session();

    if (
      session === null ||
      session.timer.status !== 'paused' ||
      (session.timer.phase !== 'work' &&
        session.timer.phase !== 'round-rest' &&
        session.timer.phase !== 'drill-rest')
    ) {
      return;
    }

    this.persist({
      ...this.inProgressWorkout()!,
      timer: {
        ...session.timer,
        status: 'running',
      },
    });
  }

  resetTimer(): void {
    const session = this.session();

    if (session === null) {
      return;
    }

    this.persist({
      ...this.inProgressWorkout()!,
      timer: this.createInitialTimer(session.currentDrill),
    });
  }

  skipRest(): void {
    const session = this.session();

    if (session === null || session.timer.phase !== 'drill-rest') {
      return;
    }

    this.persist({
      ...this.inProgressWorkout()!,
      timer: this.createInitialTimer(session.currentDrill),
    });
  }

  addRest(seconds: number): void {
    const session = this.session();

    if (
      session === null ||
      session.timer.phase !== 'drill-rest' ||
      session.timer.remainingSeconds === null
    ) {
      return;
    }

    this.persist({
      ...this.inProgressWorkout()!,
      timer: {
        ...session.timer,
        remainingSeconds: session.timer.remainingSeconds + seconds,
      },
    });
  }

  tick(): void {
    const session = this.session();

    if (
      session === null ||
      session.timer.status !== 'running' ||
      session.timer.remainingSeconds === null
    ) {
      return;
    }

    const currentWorkout = this.inProgressWorkout()!;
    const nextRemainingSeconds = Math.max(session.timer.remainingSeconds - 1, 0);

    if (session.timer.phase === 'drill-rest') {
      if (nextRemainingSeconds === 0) {
        void this.timerEndAlertService.playTimerEndAlert();
        this.persist({
          ...currentWorkout,
          timer: this.createInitialTimer(session.currentDrill),
        });
        return;
      }

      this.persist({
        ...currentWorkout,
        timer: {
          ...session.timer,
          remainingSeconds: nextRemainingSeconds,
        },
      });
      return;
    }

    if (session.currentDrill?.type === 'duration') {
      if (nextRemainingSeconds === 0) {
        void this.timerEndAlertService.playTimerEndAlert();
      }

      this.persist({
        ...currentWorkout,
        timer: {
          ...session.timer,
          phase: 'work',
          status: nextRemainingSeconds === 0 ? 'finished' : 'running',
          remainingSeconds: nextRemainingSeconds,
        },
      });
      return;
    }

    if (session.currentDrill?.type !== 'rounds') {
      return;
    }

    if (session.timer.phase === 'round-rest') {
      if (nextRemainingSeconds === 0) {
        void this.timerEndAlertService.playTimerEndAlert();
        this.persist({
          ...currentWorkout,
          timer: {
            ...session.timer,
            phase: 'work',
            status: 'running',
            remainingSeconds:
              session.currentDrill.roundsConfig?.roundSeconds ?? null,
            roundNumber: (session.timer.roundNumber ?? 0) + 1,
          },
        });
        return;
      }

      this.persist({
        ...currentWorkout,
        timer: {
          ...session.timer,
          remainingSeconds: nextRemainingSeconds,
        },
      });
      return;
    }

    if (
      nextRemainingSeconds === 0 &&
      session.timer.roundNumber !== null &&
      session.timer.totalRounds !== null &&
      session.timer.roundNumber < session.timer.totalRounds
    ) {
      void this.timerEndAlertService.playTimerEndAlert();
      this.persist({
        ...currentWorkout,
        timer: {
          ...session.timer,
          phase: 'round-rest',
          status: 'running',
          remainingSeconds:
            session.currentDrill.roundsConfig?.restBetweenRoundsSeconds ?? null,
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
        ...session.timer,
        phase: 'work',
        status: nextRemainingSeconds === 0 ? 'finished' : 'running',
        remainingSeconds: nextRemainingSeconds,
      },
    });
  }

  cancelWorkout(): void {
    this.inProgressWorkout.set(null);
    this.localStorage.remove(IN_PROGRESS_WORKOUT_KEY);
  }

  private resolveActionLabel(drill: Drill, drillIndex: number): string {
    const session = this.session();

    if (drill.type === 'reps') {
      return 'Mark Complete';
    }

    if (
      session?.currentDrillIndex === drillIndex &&
      session.timer.status === 'finished'
    ) {
      return 'Mark Complete';
    }

    return drillActionLabel(drill);
  }

  private resolveActionIcon(drill: Drill, drillIndex: number): string {
    const session = this.session();

    if (
      drill.type !== 'reps' &&
      session?.currentDrillIndex === drillIndex &&
      session.timer.status === 'finished'
    ) {
      return 'checkmark-circle-outline';
    }

    return drillActionIcon(drill);
  }

  private resolveTimerLabel(drill: Drill, drillIndex: number): string {
    const session = this.session();

    if (
      drillIndex === session?.currentDrillIndex &&
      drill.type === 'rounds' &&
      session.timer.roundNumber !== null &&
      session.timer.totalRounds !== null
    ) {
      return `Round ${session.timer.roundNumber} of ${session.timer.totalRounds}`;
    }

    return timerLabel(drill);
  }

  private resolveTimerClock(drill: Drill, drillIndex: number): string {
    const session = this.session();

    if (
      drillIndex === session?.currentDrillIndex &&
      session.timer.phase !== 'drill-rest' &&
      session.timer.remainingSeconds !== null &&
      (drill.type === 'duration' || drill.type === 'rounds')
    ) {
      return formatClock(session.timer.remainingSeconds);
    }

    return timerClock(drill);
  }

  private resolveCurrentAction(
    currentDrill: Drill | null,
    timer: InProgressWorkout['timer'],
  ): WorkoutSession['action'] {
    if (currentDrill === null) {
      return null;
    }

    if (currentDrill.type === 'reps') {
      return 'mark-complete';
    }

    if (
      timer.status === 'finished' &&
      (currentDrill.type === 'duration' || currentDrill.type === 'rounds')
    ) {
      return 'mark-complete';
    }

    if (
      (currentDrill.type === 'duration' || currentDrill.type === 'rounds') &&
      timer.phase !== 'drill-rest' &&
      timer.phase !== 'round-rest'
    ) {
      return 'start';
    }

    return null;
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

  private startCurrentTimer(workoutTemplate: WorkoutTemplate): void {
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

  private markCurrentDrillComplete(workoutTemplate: WorkoutTemplate): void {
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
