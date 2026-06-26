import { TestBed } from '@angular/core/testing';
import { provideNgxLocalstorage } from 'ngx-localstorage';

import { CompletedWorkoutLogStore } from './completed-workout-log.store';
import { CompletedWorkoutLogEntry } from '../models/training-session.model';

describe('CompletedWorkoutLogStore', () => {
  const storageKey = 'solo-wrestler.training.completed-workout-log';
  const firstEntry: CompletedWorkoutLogEntry = {
    workoutId: 'phase-1-week-1-workout-a',
    completedAt: '2026-06-25T16:00:00.000Z',
    difficulty: 'good',
    note: 'Felt sharp.',
    completedDrillIds: ['warm-up', 'level-change-drill'],
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

  it('appends a completed workout log entry and persists it', () => {
    const store = TestBed.inject(CompletedWorkoutLogStore);

    store.appendEntry(firstEntry);

    expect(store.entries()).toEqual([firstEntry]);
    expect(storage.getItem(storageKey)).toBe(JSON.stringify([firstEntry]));
  });

  it('ignores malformed stored completed workout log values', () => {
    storage.setItem(storageKey, JSON.stringify({ workoutId: firstEntry.workoutId }));

    const store = TestBed.inject(CompletedWorkoutLogStore);

    expect(store.entries()).toEqual([]);
  });
});
