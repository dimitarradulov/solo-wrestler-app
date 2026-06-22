import { Routes } from '@angular/router';
import { appShellRoutes } from './core/app-shell/app-shell.routes';
import { firstLaunchRoutes } from './core/first-launch/first-launch.routes';
import { workoutRoutes } from './features/training/workout.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full',
  },
  ...firstLaunchRoutes,
  ...workoutRoutes,
  ...appShellRoutes,
  {
    path: '**',
    redirectTo: 'intro',
  },
];
