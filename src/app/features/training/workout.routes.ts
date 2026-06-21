import { Routes } from '@angular/router';

export const workoutRoutes: Routes = [
  {
    path: 'active-workout',
    loadComponent: () =>
      import('./pages/active-workout/active-workout').then(
        (m) => m.ActiveWorkoutPage,
      ),
  },
  {
    path: 'workout-completion',
    loadComponent: () =>
      import('./pages/workout-completion/workout-completion').then(
        (m) => m.WorkoutCompletionPage,
      ),
  },
];
