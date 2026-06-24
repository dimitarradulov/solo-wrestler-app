import { TestBed } from '@angular/core/testing';
import { provideNgxLocalstorage } from 'ngx-localstorage';

import { CurriculumStore } from './curriculum.store';
import { WorkoutInstance } from './model/curriculum.model';

describe('CurriculumStore', () => {
  const storageKey = 'solo-wrestler.curriculum.completed-workout-ids';
  const firstWorkoutId = 'phase-1-week-1-workout-a';
  const secondWorkoutId = 'phase-1-week-1-workout-b';
  const lastWorkoutId = 'phase-1-week-6-workout-b';

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
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  const getWorkoutStatus = (workoutId: string) =>
    getWorkouts().find((workout) => workout.id === workoutId)?.status;

  const getWorkouts = (): WorkoutInstance[] => {
    const workouts: WorkoutInstance[] = [];

    for (const phase of TestBed.inject(CurriculumStore).phases()) {
      for (const week of phase.weeks) {
        workouts.push(...week.workouts);
      }
    }

    return workouts;
  };

  it('uses the first incomplete workout as current by default', () => {
    expect(getWorkoutStatus(firstWorkoutId)).toBe('current');
    expect(getWorkoutStatus(secondWorkoutId)).toBe('locked');
  });

  it('marks the next workout current after completing the current workout', () => {
    const store = TestBed.inject(CurriculumStore);

    store.setWorkoutCompleted(firstWorkoutId, true);

    expect(getWorkoutStatus(firstWorkoutId)).toBe('completed');
    expect(getWorkoutStatus(secondWorkoutId)).toBe('current');
    expect(store.currentWorkout()?.id).toBe(secondWorkoutId);
    expect(store.currentWorkoutTemplate()?.title).toBe('Application');
    expect(storage.getItem(storageKey)).toBe(JSON.stringify([firstWorkoutId]));
  });

  it('undoes the selected workout and later completed workouts', () => {
    const store = TestBed.inject(CurriculumStore);

    store.setWorkoutCompleted(firstWorkoutId, true);
    store.setWorkoutCompleted(secondWorkoutId, true);
    store.setWorkoutCompleted(firstWorkoutId, false);

    expect(getWorkoutStatus(firstWorkoutId)).toBe('current');
    expect(getWorkoutStatus(secondWorkoutId)).toBe('locked');
    expect(storage.getItem(storageKey)).toBe(JSON.stringify([]));
  });

  it('ignores unknown and non-sequential stored workout ids', () => {
    storage.setItem(
      storageKey,
      JSON.stringify(['unknown-workout', secondWorkoutId]),
    );

    expect(getWorkoutStatus(firstWorkoutId)).toBe('current');
    expect(getWorkoutStatus(secondWorkoutId)).toBe('locked');
  });

  it('has no current workout after all real workouts are completed', () => {
    const store = TestBed.inject(CurriculumStore);
    const workouts = getWorkouts();

    for (const workout of workouts) {
      store.setWorkoutCompleted(workout.id, true);
    }

    expect(getWorkoutStatus(lastWorkoutId)).toBe('completed');
    expect(getWorkouts().some((workout) => workout.status === 'current')).toBe(
      false,
    );
  });
});
