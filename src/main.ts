import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideNgxLocalstorage } from 'ngx-localstorage';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideNgxLocalstorage({
      prefix: 'solo-wrestler',
      delimiter: '.',
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
});
