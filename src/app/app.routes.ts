import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { appShellRoutes } from './core/app-shell/app-shell.routes';
import { firstLaunchRoutes } from './core/first-launch/first-launch.routes';
import { OnboardingCompletionStore } from './core/first-launch/onboarding-completion-store';
import { workoutRoutes } from './features/training/workout.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const onboardingCompletionStore = inject(OnboardingCompletionStore);

      return onboardingCompletionStore.isComplete()
        ? '/tabs/today'
        : '/intro';
    },
  },
  ...firstLaunchRoutes,
  ...workoutRoutes,
  ...appShellRoutes,
  {
    path: '**',
    redirectTo: 'intro',
  },
];
