export type CurriculumNodeStatus = 'completed' | 'current' | 'locked';
export type CurriculumWorkoutId = string;

export interface CurriculumWorkout {
  id: CurriculumWorkoutId;
  label: string;
  title: string;
  status: CurriculumNodeStatus;
}

export interface CurriculumWeek {
  number: number;
  workouts: CurriculumWorkout[];
}

export interface CurriculumPhase {
  id: string;
  title: string;
  meta: string;
  weeks: CurriculumWeek[];
}

export interface FutureCurriculumPhase {
  id: string;
  title: string;
  status: CurriculumNodeStatus;
  statusText: string;
}
