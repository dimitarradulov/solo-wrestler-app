import { Routes } from '@angular/router';

export const firstLaunchRoutes: Routes = [
  {
    path: 'intro',
    loadComponent: () => import('./pages/intro/intro').then((m) => m.IntroPage),
  },
  {
    path: 'safety-disclaimer',
    loadComponent: () =>
      import('./pages/safety-disclaimer/safety-disclaimer').then(
        (m) => m.SafetyDisclaimerPage,
      ),
  },
];
