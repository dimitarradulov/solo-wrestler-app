import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { InProgressWorkoutStore } from './in-progress-workout.store';
import { InProgressWorkout } from '../models/training-session.model';
import { WorkoutSessionStore } from './workout-session.store';
import { CurriculumStore } from './curriculum.store';
import { WorkoutCancellationService } from '../services/workout-cancellation.service';
import {
  CurriculumPhase,
  WorkoutInstance,
  WorkoutTemplate,
} from '../models/curriculum.model';

describe('WorkoutSessionStore', () => {
  const workout: WorkoutInstance = {
    id: 'phase-1-week-2-workout-b',
    weekNumber: 2,
    workoutTemplateId: 'template-active-workout',
    label: 'Workout B',
    title: 'Shot Entries',
    status: 'current',
  };

  const workoutTemplate: WorkoutTemplate = {
    id: 'template-active-workout',
    label: 'Workout B',
    title: 'Shot Entries',
    focus: 'Level change, clean entries, round pacing.',
    estimatedMinutes: {
      min: 25,
      max: 30,
    },
    equipment: ['Mat', 'Dummy'],
    drills: [
      {
        id: 'level-change',
        title: 'Level change drill',
        type: 'reps',
        prescription: '3 sets x 10 reps',
        cue: 'Drop your hips and stay tall.',
        repsConfig: {
          sets: 3,
          reps: 10,
        },
      },
      {
        id: 'stance-motion',
        title: 'Stance motion',
        type: 'duration',
        cue: 'Small steps without crossing your feet.',
        coreTechnique: 'Stance and motion',
        durationConfig: {
          durationSeconds: 180,
        },
      },
      {
        id: 'shadow-shot-rounds',
        title: 'Shadow shot rounds',
        type: 'rounds',
        cue: 'Level change before every entry.',
        roundsConfig: {
          rounds: 3,
          roundSeconds: 60,
          restBetweenRoundsSeconds: 30,
        },
      },
    ],
  };

  const phase: CurriculumPhase = {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    description: 'Build the base.',
    principle: 'Enter safely and finish on top.',
    meta: '6 weeks',
    workoutTemplates: [workoutTemplate],
    weeks: [
      {
        number: 2,
        progressionFocus: 'Add speed without losing clean mechanics.',
        workouts: [workout],
      },
    ],
  };

  const createInProgressWorkout = (
    patch: Partial<InProgressWorkout> = {},
  ): InProgressWorkout => ({
    workoutId: workout.id,
    workoutTemplateId: workoutTemplate.id,
    workoutLabel: workout.label,
    workoutTitle: workout.title,
    weekNumber: workout.weekNumber,
    drillIds: workoutTemplate.drills.map((drill) => drill.id),
    completedDrillIds: [],
    currentDrillIndex: 0,
    timer: {
      phase: 'idle',
      status: 'stopped',
      remainingSeconds: null,
      roundNumber: null,
      totalRounds: null,
    },
    restSeconds: 120,
    ...patch,
  });

  const setup = (
    inProgressWorkout = signal<InProgressWorkout | null>(null),
  ) => {
    const startOrResumeWorkout = vi.fn();
    const markCurrentDrillComplete = vi.fn();
    const skipRest = vi.fn();
    const addRestSeconds = vi.fn();
    const startCurrentTimer = vi.fn();
    const tickCurrentTimer = vi.fn();
    const pauseCurrentTimer = vi.fn();
    const resumeCurrentTimer = vi.fn();
    const resetCurrentTimer = vi.fn();
    const clear = vi.fn();
    const isCancelWorkoutConfirmationOpen = signal(false);
    const requestCancelWorkout = vi.fn().mockResolvedValue(undefined);
    const confirmWorkoutCancellation = vi.fn().mockResolvedValue(false);
    const cancelWorkout = vi.fn();
    const keepTraining = vi.fn();
    const confirmCancelWorkout = vi.fn();
    const dismissCancelWorkoutConfirmation = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        WorkoutSessionStore,
        {
          provide: CurriculumStore,
          useValue: {
            currentWorkout: signal(workout),
            currentWorkoutTemplate: signal(workoutTemplate),
            currentPhase: signal(phase),
            phases: signal([phase]),
          },
        },
        {
          provide: InProgressWorkoutStore,
          useValue: {
            inProgressWorkout,
            hasInProgressWorkout: computed(() => inProgressWorkout() !== null),
            completedDrillCount: computed(
              () => inProgressWorkout()?.completedDrillIds.length ?? 0,
            ),
            startOrResumeWorkout,
            markCurrentDrillComplete,
            skipRest,
            addRestSeconds,
            startCurrentTimer,
            tickCurrentTimer,
            pauseCurrentTimer,
            resumeCurrentTimer,
            resetCurrentTimer,
            clear,
          },
        },
        {
          provide: WorkoutCancellationService,
          useValue: {
            isCancelWorkoutConfirmationOpen,
            requestCancelWorkout,
            confirmWorkoutCancellation,
            cancelWorkout,
            keepTraining,
            confirmCancelWorkout,
            dismissCancelWorkoutConfirmation,
          },
        },
      ],
    });

    return {
      store: TestBed.inject(WorkoutSessionStore),
      addRestSeconds,
      cancelWorkout,
      clear,
      confirmCancelWorkout,
      confirmWorkoutCancellation,
      dismissCancelWorkoutConfirmation,
      isCancelWorkoutConfirmationOpen,
      keepTraining,
      markCurrentDrillComplete,
      pauseCurrentTimer,
      resetCurrentTimer,
      requestCancelWorkout,
      resumeCurrentTimer,
      skipRest,
      startCurrentTimer,
      startOrResumeWorkout,
      tickCurrentTimer,
    };
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts or resumes the current workout through the in-progress workout store', () => {
    const { startOrResumeWorkout, store } = setup();

    store.startOrResumeCurrentWorkout();

    expect(startOrResumeWorkout).toHaveBeenCalledWith(workout, workoutTemplate);
  });

  it('resumes a paused timer through the in-progress workout store', () => {
    const { resumeCurrentTimer, store } = setup();

    store.resumePausedTimer();

    expect(resumeCurrentTimer).toHaveBeenCalledTimes(1);
  });

  it('builds display-ready drill cards for the active workout session', () => {
    const { store } = setup(
      signal(
        createInProgressWorkout({
          completedDrillIds: ['level-change'],
          currentDrillIndex: 1,
          timer: {
            phase: 'work',
            status: 'paused',
            remainingSeconds: 125,
            roundNumber: null,
            totalRounds: null,
          },
        }),
      ),
    );

    expect(store.currentDrillTitle()).toBe('Stance motion');
    expect(store.phaseTitle()).toBe('Phase 1: Foundations');
    expect(store.estimatedMinutes()).toBe('25-30 min');
    expect(store.progressionFocus()).toBe(
      'Add speed without losing clean mechanics.',
    );
    expect(store.drillCards()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          drillIndex: 0,
          state: 'completed',
          stateLabel: 'Complete',
          actionLabel: 'Mark Complete',
        }),
        expect.objectContaining({
          drillIndex: 1,
          state: 'current',
          actionEnabled: true,
          coreTechnique: 'Stance and motion',
          timerLabel: 'Work timer',
          timerClock: '2:05',
          showTimerControls: true,
          restText: '2 min default rest',
        }),
      ]),
    );
  });

  it('builds a between-drill rest panel', () => {
    const { store } = setup(
      signal(
        createInProgressWorkout({
          completedDrillIds: ['level-change'],
          currentDrillIndex: 1,
          timer: {
            phase: 'drill-rest',
            status: 'running',
            remainingSeconds: 90,
            roundNumber: null,
            totalRounds: null,
          },
        }),
      ),
    );

    expect(store.restPanel()).toEqual({
      afterDrillIndex: 0,
      clock: '1:30',
    });
    expect(store.drillCards()[1]).toEqual(
      expect.objectContaining({
        state: 'queued',
        actionEnabled: false,
      }),
    );
  });

  it('routes drill actions to the correct in-progress workout behavior', () => {
    const inProgressWorkout = signal(createInProgressWorkout());
    const { markCurrentDrillComplete, startCurrentTimer, store } =
      setup(inProgressWorkout);

    store.handleDrillAction(0);
    expect(markCurrentDrillComplete).toHaveBeenCalledWith(workoutTemplate);

    inProgressWorkout.set(
      createInProgressWorkout({
        completedDrillIds: ['level-change'],
        currentDrillIndex: 1,
        timer: {
          phase: 'idle',
          status: 'stopped',
          remainingSeconds: 180,
          roundNumber: null,
          totalRounds: null,
        },
      }),
    );

    store.handleDrillAction(1);
    expect(startCurrentTimer).toHaveBeenCalledWith(workoutTemplate);

    inProgressWorkout.set(
      createInProgressWorkout({
        completedDrillIds: ['level-change'],
        currentDrillIndex: 1,
        timer: {
          phase: 'work',
          status: 'finished',
          remainingSeconds: 0,
          roundNumber: null,
          totalRounds: null,
        },
      }),
    );

    store.handleDrillAction(1);
    expect(markCurrentDrillComplete).toHaveBeenCalledTimes(2);
  });

  it('routes timer and rest controls through the facade', () => {
    const {
      addRestSeconds,
      pauseCurrentTimer,
      resetCurrentTimer,
      skipRest,
      store,
      tickCurrentTimer,
    } = setup(
      signal(
        createInProgressWorkout({
          completedDrillIds: ['level-change'],
          currentDrillIndex: 1,
          timer: {
            phase: 'work',
            status: 'running',
            remainingSeconds: 125,
            roundNumber: null,
            totalRounds: null,
          },
        }),
      ),
    );

    store.pauseTimer(1);
    store.resetTimer(1);
    store.skipRest();
    store.addRestSeconds(30);
    store.tickCurrentTimer();

    expect(pauseCurrentTimer).toHaveBeenCalled();
    expect(resetCurrentTimer).toHaveBeenCalledWith(workoutTemplate);
    expect(skipRest).toHaveBeenCalledWith(workoutTemplate);
    expect(addRestSeconds).toHaveBeenCalledWith(30);
    expect(tickCurrentTimer).toHaveBeenCalledWith(workoutTemplate);
  });

  it('exposes the cancellation service through the facade', async () => {
    const {
      cancelWorkout,
      confirmCancelWorkout,
      confirmWorkoutCancellation,
      dismissCancelWorkoutConfirmation,
      isCancelWorkoutConfirmationOpen,
      keepTraining,
      requestCancelWorkout,
      store,
    } = setup(signal(createInProgressWorkout()));

    expect(store.isCancelWorkoutConfirmationOpen).toBe(
      isCancelWorkoutConfirmationOpen,
    );

    await store.requestCancelWorkout();
    await store.confirmWorkoutCancellation();
    store.cancelWorkout();
    store.keepTraining();
    store.confirmCancelWorkout();
    store.dismissCancelWorkoutConfirmation();

    expect(requestCancelWorkout).toHaveBeenCalledTimes(1);
    expect(confirmWorkoutCancellation).toHaveBeenCalledTimes(1);
    expect(cancelWorkout).toHaveBeenCalledTimes(1);
    expect(keepTraining).toHaveBeenCalledTimes(1);
    expect(confirmCancelWorkout).toHaveBeenCalledTimes(1);
    expect(dismissCancelWorkoutConfirmation).toHaveBeenCalledTimes(1);
  });
});
