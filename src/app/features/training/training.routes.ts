import { Routes } from '@angular/router';

export const trainingRoutes: Routes = [
  {
    path: 'today',
    loadComponent: () =>
      import('./pages/today/today').then((m) => m.TodayPage),
  },
  {
    path: 'curriculum',
    loadComponent: () =>
      import('./pages/curriculum/curriculum').then((m) => m.CurriculumPage),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./pages/progress/progress').then((m) => m.ProgressPage),
  },
];
