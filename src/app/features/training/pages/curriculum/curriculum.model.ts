export type CurriculumNodeStatus = 'completed' | 'current' | 'locked';

export interface CurriculumWorkout {
  label: string;
  title: string;
  status: CurriculumNodeStatus;
}

export interface CurriculumWeek {
  number: number;
  workouts: CurriculumWorkout[];
}
