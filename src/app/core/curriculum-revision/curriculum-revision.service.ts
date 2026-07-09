import { Injectable, signal } from '@angular/core';

const STORAGE_PREFIX = 'solo-wrestler.';
const REVISION_KEY = `${STORAGE_PREFIX}curriculum.revision`;
const RESET_NOTICE_KEY = `${STORAGE_PREFIX}curriculum.revision-reset-notice`;
const CURRENT_REVISION = 'phase-1-neutral-defense';
const LEGACY_TRAINING_KEYS: string[] = [
  `${STORAGE_PREFIX}curriculum.completed-workout-ids`,
  `${STORAGE_PREFIX}training.completed-workout-log`,
  `${STORAGE_PREFIX}training.in-progress-workout`,
];

@Injectable({ providedIn: 'root' })
export class CurriculumRevisionService {
  private readonly resetNoticePending = signal(false);

  readonly shouldShowResetNotice = this.resetNoticePending.asReadonly();

  initialize(): void {
    if (localStorage.getItem(REVISION_KEY) !== CURRENT_REVISION) {
      const hasLegacyTrainingState = LEGACY_TRAINING_KEYS.some(
        (key) => localStorage.getItem(key) !== null,
      );

      for (const key of LEGACY_TRAINING_KEYS) {
        localStorage.removeItem(key);
      }

      localStorage.setItem(REVISION_KEY, CURRENT_REVISION);

      if (hasLegacyTrainingState) {
        localStorage.setItem(RESET_NOTICE_KEY, 'true');
      }
    }

    this.resetNoticePending.set(
      localStorage.getItem(RESET_NOTICE_KEY) === 'true',
    );
  }

  dismissResetNotice(): void {
    localStorage.removeItem(RESET_NOTICE_KEY);
    this.resetNoticePending.set(false);
  }
}
