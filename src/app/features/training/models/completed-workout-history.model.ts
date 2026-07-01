import {
  CurriculumPhase,
  CurriculumWeek,
  WorkoutInstance,
  WorkoutTemplate,
} from './curriculum.model';

export interface CompletedWorkoutContext {
  phase: CurriculumPhase;
  week: CurriculumWeek;
  workout: WorkoutInstance;
  workoutTemplate: WorkoutTemplate;
}

export interface CompletedWorkoutCardView {
  workoutId: string;
  workoutTitle: string;
  workoutMeta: string;
  completedAt: string;
  difficultyLabel: string;
  detailLink: string;
}

export interface CompletedWorkoutDetailDrillView {
  number: number;
  title: string;
  meta: string | null;
}

export interface CompletedWorkoutDetailView {
  workoutTitle: string;
  workoutMeta: string;
  completedAt: string;
  difficultyLabel: string;
  note: string | null;
  drills: CompletedWorkoutDetailDrillView[];
}
