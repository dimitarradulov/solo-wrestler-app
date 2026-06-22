import { Routes } from '@angular/router';

export const appShellRoutes: Routes = [
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'today',
        pathMatch: 'full',
      },
      {
        path: 'today',
        loadComponent: () =>
          import('../../features/training/pages/today/today').then(
            (m) => m.TodayPage,
          ),
      },
      {
        path: 'curriculum',
        loadComponent: () =>
          import('../../features/training/pages/curriculum/curriculum').then(
            (m) => m.CurriculumPage,
          ),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('../../features/training/pages/progress/progress').then(
            (m) => m.ProgressPage,
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('../../features/about/pages/about/about').then(
            (m) => m.AboutPage,
          ),
      },
    ],
  },
];
