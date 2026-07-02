import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { InstallPromptComponent } from './core/install-prompt/install-prompt';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet, InstallPromptComponent],
})
export class AppComponent {}
