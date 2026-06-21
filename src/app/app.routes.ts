import { Routes } from '@angular/router';
import { trainingRoutes } from './features/training/training.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/today',
    pathMatch: 'full',
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
    redirectTo: 'tabs/today',
  },
];
