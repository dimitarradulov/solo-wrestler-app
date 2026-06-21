import { Routes } from '@angular/router';
import { firstLaunchRoutes } from './core/first-launch/first-launch.routes';
import { trainingRoutes } from './features/training/training.routes';
import { workoutRoutes } from './features/training/workout.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full',
  },
  ...firstLaunchRoutes,
  ...workoutRoutes,
  {
    path: 'completed-workout-detail',
    loadComponent: () =>
      import('./features/training/pages/completed-workout-detail/completed-workout-detail').then(
        (m) => m.CompletedWorkoutDetailPage,
      ),
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./core/app-shell/tabs/tabs').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'today',
        pathMatch: 'full',
      },
      ...trainingRoutes,
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/pages/about/about').then((m) => m.AboutPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'intro',
  },
];
