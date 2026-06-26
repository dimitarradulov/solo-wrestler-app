import { TestBed } from '@angular/core/testing';
import { provideNgxLocalstorage } from 'ngx-localstorage';
import { vi } from 'vitest';

import { InProgressWorkoutStore } from './in-progress-workout.store';
import { TimerEndAlertService } from '../../../core/timers/timer-end-alert.service';
import {
  Drill,
  WorkoutInstance,
  WorkoutTemplate,
} from '../models/curriculum.model';

describe('InProgressWorkoutStore', () => {
  const storageKey = 'solo-wrestler.training.in-progress-workout';
  const baseWorkout: WorkoutInstance = {
    id: 'phase-1-week-1-workout-a',
    weekNumber: 1,
    workoutTemplateId: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    status: 'current',
  };
  const nextWorkout: WorkoutInstance = {
    ...baseWorkout,
    id: 'phase-1-week-1-workout-b',
    workoutTemplateId: 'workout-template-b',
    label: 'Workout B',
    title: 'Application',
  };
  const drills: Drill[] = [
    {
      id: 'warm-up',
      title: 'Warm-up',
      type: 'duration',
      cue: 'Move easy.',
      durationConfig: { durationSeconds: 300 },
    },
    {
      id: 'level-change-drill',
      title: 'Level change drill',
      type: 'reps',
      cue: 'Stay tall.',
      repsConfig: { reps: 10 },
    },
  ];
  const baseTemplate: WorkoutTemplate = {
    id: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    focus: 'Clean mechanics.',
    estimatedMinutes: { min: 35, max: 45 },
    equipment: ['Mat'],
    drills,
  };
  const nextTemplate: WorkoutTemplate = {
    ...baseTemplate,
    id: 'workout-template-b',
    label: 'Workout B',
    title: 'Application',
  };
  const sequenceTemplate: WorkoutTemplate = {
    ...baseTemplate,
    id: 'sequence-template',
    drills: [
      {
        id: 'reps-first',
        title: 'Reps first',
        type: 'reps',
        cue: 'Stay tall.',
        repsConfig: { reps: 10 },
      },
      {
        id: 'duration-second',
        title: 'Duration second',
        type: 'duration',
        cue: 'Keep moving.',
        durationConfig: { durationSeconds: 90 },
      },
    ],
  };
  const durationTemplate: WorkoutTemplate = {
    ...baseTemplate,
    id: 'duration-template',
    drills: [
      {
        id: 'duration-first',
        title: 'Duration first',
        type: 'duration',
        cue: 'Keep moving.',
        durationConfig: { durationSeconds: 3 },
      },
      {
        id: 'reps-second',
        title: 'Reps second',
        type: 'reps',
        cue: 'Stay tall.',
        repsConfig: { reps: 10 },
      },
    ],
  };
  const roundsTemplate: WorkoutTemplate = {
    ...baseTemplate,
    id: 'rounds-template',
    drills: [
      {
        id: 'rounds-first',
        title: 'Rounds first',
        type: 'rounds',
        cue: 'Stay sharp.',
        roundsConfig: {
          rounds: 2,
          roundSeconds: 3,
          restBetweenRoundsSeconds: 2,
        },
      },
      {
        id: 'reps-second',
        title: 'Reps second',
        type: 'reps',
        cue: 'Stay tall.',
        repsConfig: { reps: 10 },
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
        provideNgxLocalstorage({
          prefix: 'solo-wrestler',
          delimiter: '.',
        }),
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

  it('starts a workout and persists the initial in-progress state', () => {
    const store = TestBed.inject(InProgressWorkoutStore);

    const inProgressWorkout = store.startOrResumeWorkout(baseWorkout, baseTemplate);

    expect(inProgressWorkout.workoutId).toBe(baseWorkout.id);
    expect(inProgressWorkout.completedDrillIds).toEqual([]);
    expect(inProgressWorkout.currentDrillIndex).toBe(0);
    expect(inProgressWorkout.timer.phase).toBe('idle');
    expect(inProgressWorkout.timer.status).toBe('stopped');
    expect(inProgressWorkout.timer.remainingSeconds).toBe(300);
    expect(store.hasInProgressWorkout()).toBe(true);
    expect(store.completedDrillCount()).toBe(0);
    expect(storage.getItem(storageKey)).toContain('"workoutId":"phase-1-week-1-workout-a"');
  });

  it('resumes the stored workout instead of replacing it with a new one', () => {
    const store = TestBed.inject(InProgressWorkoutStore);

    const firstWorkout = store.startOrResumeWorkout(baseWorkout, baseTemplate);
    const resumedWorkout = store.startOrResumeWorkout(nextWorkout, nextTemplate);

    expect(resumedWorkout).toEqual(firstWorkout);
    expect(store.inProgressWorkout()?.workoutId).toBe(baseWorkout.id);
    expect(store.inProgressWorkout()?.workoutTemplateId).toBe(baseTemplate.id);
  });

  it('ignores malformed stored values', () => {
    storage.setItem(storageKey, JSON.stringify({ workoutId: 123 }));

    const store = TestBed.inject(InProgressWorkoutStore);

    expect(store.inProgressWorkout()).toBeNull();
    expect(store.hasInProgressWorkout()).toBe(false);
  });

  it('clears the current in-progress workout', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, baseTemplate);

    store.clear();

    expect(store.inProgressWorkout()).toBeNull();
    expect(store.hasInProgressWorkout()).toBe(false);
    expect(storage.getItem(storageKey)).toBeNull();
  });

  it('marks the current drill complete and enters between-drill rest', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, sequenceTemplate);

    store.markCurrentDrillComplete(sequenceTemplate);

    expect(store.inProgressWorkout()?.completedDrillIds).toEqual(['reps-first']);
    expect(store.inProgressWorkout()?.currentDrillIndex).toBe(1);
    expect(store.inProgressWorkout()?.timer.phase).toBe('drill-rest');
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(120);
    expect(storage.getItem(storageKey)).toContain('"completedDrillIds":["reps-first"]');
  });

  it('skips between-drill rest and makes the next drill current', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, sequenceTemplate);
    store.markCurrentDrillComplete(sequenceTemplate);

    store.skipRest(sequenceTemplate);

    expect(store.inProgressWorkout()?.currentDrillIndex).toBe(1);
    expect(store.inProgressWorkout()?.timer.phase).toBe('idle');
    expect(store.inProgressWorkout()?.timer.status).toBe('stopped');
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(90);
  });

  it('adds time to the current between-drill rest', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, sequenceTemplate);
    store.markCurrentDrillComplete(sequenceTemplate);

    store.addRestSeconds(30);

    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(150);
  });

  it('ticks between-drill rest down and makes the next drill current when rest finishes', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, sequenceTemplate);
    store.markCurrentDrillComplete(sequenceTemplate);

    for (let remainingSeconds = 119; remainingSeconds >= 0; remainingSeconds -= 1) {
      store.tickCurrentTimer(sequenceTemplate);
    }

    expect(store.inProgressWorkout()?.completedDrillIds).toEqual(['reps-first']);
    expect(store.inProgressWorkout()?.currentDrillIndex).toBe(1);
    expect(store.inProgressWorkout()?.timer.phase).toBe('idle');
    expect(store.inProgressWorkout()?.timer.status).toBe('stopped');
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(90);
    expect(playTimerEndAlert).toHaveBeenCalledTimes(1);
  });

  it('starts the current duration drill timer and ticks it down to finished', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, durationTemplate);

    store.startCurrentTimer(durationTemplate);
    store.tickCurrentTimer(durationTemplate);
    store.tickCurrentTimer(durationTemplate);
    store.tickCurrentTimer(durationTemplate);

    expect(store.inProgressWorkout()?.timer.phase).toBe('work');
    expect(store.inProgressWorkout()?.timer.status).toBe('finished');
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(0);
    expect(store.inProgressWorkout()?.completedDrillIds).toEqual([]);
    expect(playTimerEndAlert).toHaveBeenCalledTimes(1);
    expect(storage.getItem(storageKey)).toContain('"remainingSeconds":0');
  });

  it('pauses and resets the current duration drill timer', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, durationTemplate);

    store.startCurrentTimer(durationTemplate);
    store.tickCurrentTimer(durationTemplate);
    store.pauseCurrentTimer();
    store.resetCurrentTimer(durationTemplate);

    expect(store.inProgressWorkout()?.timer.phase).toBe('idle');
    expect(store.inProgressWorkout()?.timer.status).toBe('stopped');
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(3);
  });

  it('starts the current rounds drill timer as round work', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, roundsTemplate);

    store.startCurrentTimer(roundsTemplate);

    expect(store.inProgressWorkout()?.timer.phase).toBe('work');
    expect(store.inProgressWorkout()?.timer.status).toBe('running');
    expect(store.inProgressWorkout()?.timer.roundNumber).toBe(1);
    expect(store.inProgressWorkout()?.timer.totalRounds).toBe(2);
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(3);
  });

  it('enters round rest when a non-final round finishes', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, roundsTemplate);

    store.startCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);

    expect(store.inProgressWorkout()?.timer.phase).toBe('round-rest');
    expect(store.inProgressWorkout()?.timer.status).toBe('running');
    expect(store.inProgressWorkout()?.timer.roundNumber).toBe(1);
    expect(store.inProgressWorkout()?.timer.totalRounds).toBe(2);
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(2);
    expect(playTimerEndAlert).toHaveBeenCalledTimes(1);
  });

  it('starts the next round work when round rest finishes', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, roundsTemplate);

    store.startCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);
    store.tickCurrentTimer(roundsTemplate);

    expect(store.inProgressWorkout()?.timer.phase).toBe('work');
    expect(store.inProgressWorkout()?.timer.status).toBe('running');
    expect(store.inProgressWorkout()?.timer.roundNumber).toBe(2);
    expect(store.inProgressWorkout()?.timer.totalRounds).toBe(2);
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(3);
    expect(playTimerEndAlert).toHaveBeenCalledTimes(2);
  });

  it('finishes the final round without auto-completing the drill', () => {
    const store = TestBed.inject(InProgressWorkoutStore);
    store.startOrResumeWorkout(baseWorkout, roundsTemplate);

    store.startCurrentTimer(roundsTemplate);

    for (let tick = 0; tick < 8; tick += 1) {
      store.tickCurrentTimer(roundsTemplate);
    }

    expect(store.inProgressWorkout()?.timer.phase).toBe('work');
    expect(store.inProgressWorkout()?.timer.status).toBe('finished');
    expect(store.inProgressWorkout()?.timer.roundNumber).toBe(2);
    expect(store.inProgressWorkout()?.timer.totalRounds).toBe(2);
    expect(store.inProgressWorkout()?.timer.remainingSeconds).toBe(0);
    expect(store.inProgressWorkout()?.completedDrillIds).toEqual([]);
    expect(store.inProgressWorkout()?.currentDrillIndex).toBe(0);
    expect(playTimerEndAlert).toHaveBeenCalledTimes(3);
  });
});
