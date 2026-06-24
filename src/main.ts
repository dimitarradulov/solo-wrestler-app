import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
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
  ],
});
