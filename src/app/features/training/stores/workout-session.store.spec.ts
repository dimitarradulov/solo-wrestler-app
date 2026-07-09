import { TestBed } from '@angular/core/testing';
import { provideNgxLocalstorage } from 'ngx-localstorage';
import { vi } from 'vitest';

import { TimerEndAlertService } from '../../../core/timers/timer-end-alert.service';
import {
  CurriculumPhase,
  Drill,
  WorkoutInstance,
  WorkoutTemplate,
} from '../models/curriculum.model';
import { CurriculumStore } from './curriculum.store';
import { WorkoutSessionStore } from './workout-session.store';

describe('WorkoutSessionStore', () => {
  const storageKey = 'solo-wrestler.training.in-progress-workout';
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

  const createStorage = (): Storage => {
    const values = new Map<string, string>();

    return {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => Array.from(values.keys())[index] ?? null,
      removeItem: (key: string) => {
        values.delete(key);
      },
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
  };

  let storage: Storage;
  const originalLocalStorage = window.localStorage;
  const playTimerEndAlert = vi.fn();

  beforeEach(() => {
    storage = createStorage();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    });

    TestBed.configureTestingModule({
      providers: [
        WorkoutSessionStore,
        provideNgxLocalstorage({
          prefix: 'solo-wrestler',
          delimiter: '.',
        }),
        {
          provide: CurriculumStore,
          useValue: {
            currentWorkout: vi.fn(() => workout),
            currentWorkoutTemplate: vi.fn(() => workoutTemplate),
            currentPhase: vi.fn(() => phase),
            phases: vi.fn(() => [phase]),
          },
        },
        {
          provide: TimerEndAlertService,
          useValue: {
            playTimerEndAlert,
          },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    playTimerEndAlert.mockReset();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it('starts the current workout and exposes one semantic session', () => {
    const store = TestBed.inject(WorkoutSessionStore);

    store.startOrResumeCurrentWorkout();

    expect(store.session()).toEqual(
      expect.objectContaining({
        workout,
        workoutTemplate,
        phaseTitle: 'Phase 1: Foundations',
        progressionFocus: 'Add speed without losing clean mechanics.',
        completedDrillCount: 0,
        currentDrillIndex: 0,
        currentDrill: workoutTemplate.drills[0],
        action: 'mark-complete',
        canFinish: false,
      }),
    );
    expect(store.currentDrillTitle()).toBe('Level change drill');
    expect(storage.getItem(storageKey)).toContain(workout.id);
  });

  it('restores a persisted workout session on construction', () => {
    storage.setItem(
      storageKey,
      JSON.stringify({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: ['level-change'],
        currentDrillIndex: 1,
        timer: {
          phase: 'work',
          status: 'paused',
          remainingSeconds: 125,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      }),
    );

    const store = TestBed.inject(WorkoutSessionStore);

    expect(store.session()).toEqual(
      expect.objectContaining({
        completedDrillCount: 1,
        currentDrillIndex: 1,
        currentDrill: workoutTemplate.drills[1],
      }),
    );
    expect(store.drillCards()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ drillIndex: 0, state: 'completed' }),
        expect.objectContaining({
          drillIndex: 1,
          state: 'current',
          timerClock: '2:05',
          showTimerControls: true,
        }),
      ]),
    );
  });

  it('performs the current drill action for reps and timed drills', () => {
    const store = TestBed.inject(WorkoutSessionStore);
    store.startOrResumeCurrentWorkout();

    store.performCurrentDrillAction();

    expect(store.session()).toEqual(
      expect.objectContaining({
        completedDrillCount: 1,
        currentDrillIndex: 1,
      }),
    );
    expect(store.restPanel()).toEqual({
      afterDrillIndex: 0,
      clock: '2:00',
    });

    store.skipRest();
    store.performCurrentDrillAction();

    expect(store.session()?.timer).toEqual(
      expect.objectContaining({
        phase: 'work',
        status: 'running',
        remainingSeconds: 180,
      }),
    );
  });

  it('pauses resumes and resets the current timer through the session seam', () => {
    const store = TestBed.inject(WorkoutSessionStore);
    store.startOrResumeCurrentWorkout();
    store.performCurrentDrillAction();
    store.skipRest();
    store.performCurrentDrillAction();

    store.pauseTimer();
    expect(store.session()?.timer.status).toBe('paused');

    store.resumeTimer();
    expect(store.session()?.timer.status).toBe('running');

    store.tick();
    expect(store.session()?.timer.remainingSeconds).toBe(179);

    store.resetTimer();
    expect(store.session()?.timer).toEqual(
      expect.objectContaining({
        phase: 'idle',
        status: 'stopped',
        remainingSeconds: 180,
      }),
    );
  });

  it('adds and skips between-drill rest through the session seam', () => {
    const store = TestBed.inject(WorkoutSessionStore);
    store.startOrResumeCurrentWorkout();
    store.performCurrentDrillAction();

    store.addRest(30);
    expect(store.restPanel()).toEqual({
      afterDrillIndex: 0,
      clock: '2:30',
    });

    store.skipRest();
    expect(store.session()?.currentDrillIndex).toBe(1);
    expect(store.session()?.timer).toEqual(
      expect.objectContaining({
        phase: 'idle',
        status: 'stopped',
        remainingSeconds: 180,
      }),
    );
  });

  it('ticks duration timers to finished without auto-completing the drill', () => {
    const store = TestBed.inject(WorkoutSessionStore);
    store.startOrResumeCurrentWorkout();
    store.performCurrentDrillAction();
    store.skipRest();
    store.performCurrentDrillAction();

    for (let tick = 0; tick < 180; tick += 1) {
      store.tick();
    }

    expect(store.session()?.timer).toEqual(
      expect.objectContaining({
        phase: 'work',
        status: 'finished',
        remainingSeconds: 0,
      }),
    );
    expect(store.session()?.completedDrillCount).toBe(1);
    expect(playTimerEndAlert).toHaveBeenCalledTimes(1);
  });

  it('ticks rounds through work and rest transitions behind the session seam', () => {
    storage.setItem(
      storageKey,
      JSON.stringify({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: ['level-change', 'stance-motion'],
        currentDrillIndex: 2,
        timer: {
          phase: 'idle',
          status: 'stopped',
          remainingSeconds: 60,
          roundNumber: 1,
          totalRounds: 3,
        },
        restSeconds: 120,
      }),
    );

    const restoredStore = TestBed.inject(WorkoutSessionStore);
    restoredStore.performCurrentDrillAction();

    for (let tick = 0; tick < 60; tick += 1) {
      restoredStore.tick();
    }

    expect(restoredStore.session()?.timer).toEqual(
      expect.objectContaining({
        phase: 'round-rest',
        status: 'running',
        remainingSeconds: 30,
        roundNumber: 1,
        totalRounds: 3,
      }),
    );

    for (let tick = 0; tick < 30; tick += 1) {
      restoredStore.tick();
    }

    expect(restoredStore.session()?.timer).toEqual(
      expect.objectContaining({
        phase: 'work',
        status: 'running',
        remainingSeconds: 60,
        roundNumber: 2,
        totalRounds: 3,
      }),
    );
    expect(playTimerEndAlert).toHaveBeenCalledTimes(2);
  });

  it('cancels the workout and clears persisted state', () => {
    const store = TestBed.inject(WorkoutSessionStore);
    store.startOrResumeCurrentWorkout();

    store.cancelWorkout();

    expect(store.session()).toBeNull();
    expect(storage.getItem(storageKey)).toBeNull();
  });

  it('marks the workout finishable after the final drill completes', () => {
    storage.setItem(
      storageKey,
      JSON.stringify({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: ['level-change', 'stance-motion'],
        currentDrillIndex: 2,
        timer: {
          phase: 'work',
          status: 'finished',
          remainingSeconds: 0,
          roundNumber: 3,
          totalRounds: 3,
        },
        restSeconds: 120,
      }),
    );

    const restoredStore = TestBed.inject(WorkoutSessionStore);
    restoredStore.performCurrentDrillAction();

    expect(restoredStore.canFinishWorkout()).toBe(true);
    expect(restoredStore.session()?.canFinish).toBe(true);
    expect(restoredStore.session()?.timer.phase).toBe('complete');
  });
});
