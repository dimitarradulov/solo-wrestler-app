import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import { CompletedWorkoutLogEntry } from '../models/training-session.model';

const COMPLETED_WORKOUT_LOG_KEY = 'training.completed-workout-log';

@Injectable({ providedIn: 'root' })
export class CompletedWorkoutLogStore {
  private readonly localStorage = inject(LocalStorageService);
  private readonly storedEntries = signal<CompletedWorkoutLogEntry[]>(
    this.readStoredEntries(),
  );

  readonly entries = computed(() => this.storedEntries());

  appendEntry(entry: CompletedWorkoutLogEntry): void {
    const nextEntries = [...this.storedEntries(), entry];

    this.storedEntries.set(nextEntries);
    this.localStorage.set(COMPLETED_WORKOUT_LOG_KEY, nextEntries);
  }

  private readStoredEntries(): CompletedWorkoutLogEntry[] {
    const storedEntries =
      this.localStorage.get<CompletedWorkoutLogEntry[]>(
        COMPLETED_WORKOUT_LOG_KEY,
      ) ?? [];

    return Array.isArray(storedEntries) ? storedEntries : [];
  }
}
