import { Drill } from './curriculum.model';
import { DrillSequenceState } from './training-session.model';

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
