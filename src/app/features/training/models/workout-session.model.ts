import { Drill, WorkoutInstance, WorkoutTemplate } from './curriculum.model';
import {
  DrillSequenceState,
  InProgressWorkoutTimer,
} from './training-session.model';

export type WorkoutSessionAction = 'start' | 'mark-complete' | null;

export interface WorkoutSessionDrill {
  drill: Drill;
  drillIndex: number;
  state: DrillSequenceState;
}

export interface WorkoutSession {
  workout: WorkoutInstance;
  workoutTemplate: WorkoutTemplate;
  phaseTitle: string | null;
  progressionFocus: string | null;
  completedDrillCount: number;
  currentDrillIndex: number;
  currentDrill: Drill | null;
  drills: WorkoutSessionDrill[];
  timer: InProgressWorkoutTimer;
  action: WorkoutSessionAction;
  canFinish: boolean;
}

export interface ActiveWorkoutDrillCardView {
  drill: Drill;
  drillIndex: number;
  state: DrillSequenceState;
  stateLabel: string;
  typeLabel: string;
  meta: string | null;
  coreTechnique: string;
  actionEnabled: boolean;
  actionLabel: string;
  actionIcon: string;
  timerLabel: string;
  timerClock: string;
  showTimerPreview: boolean;
  showTimerControls: boolean;
  restText: string;
}

export interface ActiveWorkoutRestPanelView {
  afterDrillIndex: number;
  clock: string;
}
