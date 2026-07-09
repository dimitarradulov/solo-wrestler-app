export type CurriculumNodeStatus = 'completed' | 'current' | 'locked';
export type WorkoutInstanceId = string;
export type WorkoutTemplateId = string;
export type DrillType = 'reps' | 'duration' | 'rounds';

export const DEFAULT_REST_SECONDS = 120;

export interface WorkoutEstimateMinutes {
  min: number;
  max: number;
}

export interface DrillEstimateSeconds {
  seconds: number;
}

export interface RepsDrillConfig {
  sets?: number;
  reps: number;
  perSide?: boolean;
}

export interface DurationDrillConfig {
  durationSeconds: number;
}

export interface RoundsDrillConfig {
  rounds: number;
  roundSeconds: number;
  restBetweenRoundsSeconds: number;
}

export interface Drill {
  id: string;
  title: string;
  type: DrillType;
  prescription?: string;
  cue: string;
  details?: string[];
  options?: string[];
  optionInstruction?: string;
  coreTechnique?: string;
  videoUrl?: string;
  videoNote?: string;
  estimatedDuration?: DrillEstimateSeconds;
  repsConfig?: RepsDrillConfig;
  durationConfig?: DurationDrillConfig;
  roundsConfig?: RoundsDrillConfig;
}

export interface WorkoutTemplate {
  id: WorkoutTemplateId;
  label: string;
  title: string;
  focus: string;
  estimatedMinutes: WorkoutEstimateMinutes;
  equipment: string[];
  drills: Drill[];
}

export interface WorkoutInstance {
  id: WorkoutInstanceId;
  weekNumber: number;
  workoutTemplateId: WorkoutTemplateId;
  label: string;
  title: string;
  status: CurriculumNodeStatus;
}

export interface CurriculumWeek {
  number: number;
  progressionFocus: string;
  workouts: WorkoutInstance[];
}

export interface CurriculumPhase {
  id: string;
  title: string;
  description: string;
  principle: string;
  meta: string;
  workoutTemplates: WorkoutTemplate[];
  weeks: CurriculumWeek[];
}

export interface FutureCurriculumPhase {
  id: string;
  title: string;
  status: CurriculumNodeStatus;
  statusText: string;
}

export interface AppWorkoutConfig {
  defaultRestSeconds: number;
}
