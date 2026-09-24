import {
  WorkoutInstanceId,
  WorkoutTemplateId,
} from './curriculum.model';
import { WrestlingStyle } from './wrestling-style.model';

export type DrillSequenceState = 'completed' | 'current' | 'queued';
export type WorkoutTimerPhase =
  | 'idle'
  | 'work'
  | 'round-rest'
  | 'drill-rest'
  | 'complete';
export type WorkoutTimerStatus = 'stopped' | 'running' | 'paused' | 'finished';
export type WorkoutDifficulty = 'easy' | 'good' | 'hard';

export interface InProgressWorkoutTimer {
  phase: WorkoutTimerPhase;
  status: WorkoutTimerStatus;
  remainingSeconds: number | null;
  roundNumber: number | null;
  totalRounds: number | null;
}

export interface InProgressWorkout {
  /** Missing only in stored sessions written before style ownership was added. */
  style?: WrestlingStyle;
  workoutId: WorkoutInstanceId;
  workoutTemplateId: WorkoutTemplateId;
  workoutLabel: string;
  workoutTitle: string;
  weekNumber: number;
  drillIds: string[];
  completedDrillIds: string[];
  currentDrillIndex: number;
  timer: InProgressWorkoutTimer;
  restSeconds: number;
}

export interface CompletedWorkoutLogEntry {
  /** Missing only in history written before style ownership was added. */
  style?: WrestlingStyle;
  workoutId: WorkoutInstanceId;
  completedAt: string;
  difficulty: WorkoutDifficulty;
  note: string | null;
  completedDrillIds: string[];
}
