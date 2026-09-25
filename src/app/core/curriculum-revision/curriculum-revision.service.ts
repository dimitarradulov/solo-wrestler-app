import { computed, Injectable, signal } from '@angular/core';

import {
  isWrestlingStyle,
  WrestlingStyle,
  wrestlingStyleLabel,
} from '../../features/training/models/wrestling-style.model';

const STORAGE_PREFIX = 'solo-wrestler.';
// This marker belongs to the one-time full reset introduced before style-owned revisions.
const INITIAL_REVISION_KEY = `${STORAGE_PREFIX}curriculum.revision`;
const RESET_NOTICE_KEY = `${STORAGE_PREFIX}curriculum.revision-reset-notice`;
const INITIAL_REVISION = 'freestyle-foundations-18-workout';
const STYLE_REVISIONS: Record<WrestlingStyle, string> = {
  freestyle: 'freestyle-foundations-18-workout',
  'greco-roman': 'greco-foundations-18-workout',
};
const STYLES: WrestlingStyle[] = ['freestyle', 'greco-roman'];
const COMPLETED_WORKOUT_LOG_KEY = `${STORAGE_PREFIX}training.completed-workout-log`;
const IN_PROGRESS_WORKOUT_KEY = `${STORAGE_PREFIX}training.in-progress-workout`;
const LEGACY_TRAINING_KEYS: string[] = [
  `${STORAGE_PREFIX}curriculum.completed-workout-ids`,
  COMPLETED_WORKOUT_LOG_KEY,
  IN_PROGRESS_WORKOUT_KEY,
];

@Injectable({ providedIn: 'root' })
export class CurriculumRevisionService {
  private readonly resetNoticeStylesState = signal<WrestlingStyle[]>([]);

  readonly resetNoticeStyles = this.resetNoticeStylesState.asReadonly();
  readonly shouldShowResetNotice = computed(
    () => this.resetNoticeStylesState().length > 0,
  );
  readonly resetNoticeMessage = computed(() =>
    this.formatResetNotice(this.resetNoticeStylesState()),
  );

  initialize(): void {
    const newlyResetStyles: WrestlingStyle[] = [];

    if (localStorage.getItem(INITIAL_REVISION_KEY) !== INITIAL_REVISION) {
      const hasLegacyTrainingState = LEGACY_TRAINING_KEYS.some(
        (key) => localStorage.getItem(key) !== null,
      );

      for (const key of LEGACY_TRAINING_KEYS) {
        localStorage.removeItem(key);
      }

      localStorage.setItem(INITIAL_REVISION_KEY, INITIAL_REVISION);

      if (hasLegacyTrainingState) {
        newlyResetStyles.push('freestyle');
      }
    }

    for (const style of STYLES) {
      const revisionKey = this.revisionKey(style);
      const storedRevision = localStorage.getItem(revisionKey);

      if (storedRevision === null) {
        localStorage.setItem(revisionKey, STYLE_REVISIONS[style]);
        continue;
      }

      if (storedRevision !== STYLE_REVISIONS[style]) {
        this.resetStyleState(style);
        newlyResetStyles.push(style);
        localStorage.setItem(revisionKey, STYLE_REVISIONS[style]);
      }
    }

    const resetStyles = this.mergeStyles(
      this.readResetNoticeStyles(),
      newlyResetStyles,
    );
    this.persistResetNoticeStyles(resetStyles);
    this.resetNoticeStylesState.set(resetStyles);
  }

  dismissResetNotice(): void {
    localStorage.removeItem(RESET_NOTICE_KEY);
    this.resetNoticeStylesState.set([]);
  }

  private resetStyleState(style: WrestlingStyle): void {
    const completedWorkoutIdsKey = `${STORAGE_PREFIX}curriculum.${style}.completed-workout-ids`;
    localStorage.removeItem(completedWorkoutIdsKey);

    if (style === 'freestyle') {
      const legacyCompletedWorkoutIdsKey = `${STORAGE_PREFIX}curriculum.completed-workout-ids`;
      localStorage.removeItem(legacyCompletedWorkoutIdsKey);
    }

    const completedEntries = this.readStoredValue(COMPLETED_WORKOUT_LOG_KEY);
    if (Array.isArray(completedEntries)) {
      const retainedEntries = completedEntries.filter(
        (entry) => this.ownerStyle(entry) !== style,
      );
      if (retainedEntries.length !== completedEntries.length) {
        this.writeStoredValue(COMPLETED_WORKOUT_LOG_KEY, retainedEntries);
      }
    }

    const inProgressWorkout = this.readStoredValue(IN_PROGRESS_WORKOUT_KEY);
    if (
      inProgressWorkout !== null &&
      this.ownerStyle(inProgressWorkout) === style
    ) {
      localStorage.removeItem(IN_PROGRESS_WORKOUT_KEY);
    }
  }

  private ownerStyle(value: unknown): WrestlingStyle {
    if (typeof value !== 'object' || value === null) {
      return 'freestyle';
    }

    const style = (value as { style?: unknown }).style;
    return isWrestlingStyle(style) ? style : 'freestyle';
  }

  private revisionKey(style: WrestlingStyle): string {
    return `${STORAGE_PREFIX}curriculum.${style}.revision`;
  }

  private readStoredValue(key: string): unknown {
    const value = localStorage.getItem(key);
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }

  private writeStoredValue(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private readResetNoticeStyles(): WrestlingStyle[] {
    const storedNotice = localStorage.getItem(RESET_NOTICE_KEY);
    if (storedNotice === 'true') {
      return ['freestyle'];
    }
    if (storedNotice === null) {
      return [];
    }

    try {
      const styles: unknown = JSON.parse(storedNotice);
      return Array.isArray(styles)
        ? styles.filter(isWrestlingStyle)
        : [];
    } catch {
      return [];
    }
  }

  private persistResetNoticeStyles(styles: WrestlingStyle[]): void {
    if (styles.length === 0) {
      localStorage.removeItem(RESET_NOTICE_KEY);
      return;
    }

    this.writeStoredValue(RESET_NOTICE_KEY, styles);
  }

  private mergeStyles(
    existingStyles: WrestlingStyle[],
    newlyResetStyles: WrestlingStyle[],
  ): WrestlingStyle[] {
    return STYLES.filter(
      (style) => existingStyles.includes(style) || newlyResetStyles.includes(style),
    );
  }

  private formatResetNotice(styles: WrestlingStyle[]): string {
    if (styles.length === 2) {
      return 'The Freestyle and Greco-Roman curricula were updated. Any saved progress, completed workout history and notes, and unfinished workout owned by either style were reset. Your selected style and unrelated preferences were preserved.';
    }
    if (styles.length === 0) {
      return '';
    }

    const style = styles[0];
    const otherStyle = style === 'freestyle' ? 'Greco-Roman' : 'Freestyle';
    return `The ${wrestlingStyleLabel(style)} curriculum was updated. Any saved progress, completed workout history and notes, and unfinished workout owned by ${wrestlingStyleLabel(style)} were reset. Your ${otherStyle} training, selected style, and unrelated preferences were preserved.`;
  }
}
