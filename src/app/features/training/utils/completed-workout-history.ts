import { curriculumPhases } from '../data/curriculum.data';
import { CompletedWorkoutContext } from '../models/completed-workout-history.model';
import { WorkoutDifficulty } from '../models/training-session.model';

export function resolveCompletedWorkout(
  workoutId: string,
): CompletedWorkoutContext | null {
  for (const phase of curriculumPhases) {
    for (const week of phase.weeks) {
      const workout = week.workouts.find((candidate) => candidate.id === workoutId);

      if (workout === undefined) {
        continue;
      }

      const workoutTemplate =
        phase.workoutTemplates.find(
          (candidate) => candidate.id === workout.workoutTemplateId,
        ) ?? null;

      if (workoutTemplate === null) {
        return null;
      }

      return {
        phase,
        week,
        workout,
        workoutTemplate,
      };
    }
  }

  return null;
}

export function formatWorkoutDifficulty(
  difficulty: WorkoutDifficulty,
): string {
  if (difficulty === 'easy') {
    return 'Easy';
  }

  if (difficulty === 'good') {
    return 'Good';
  }

  return 'Hard';
}
