import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline } from 'ionicons/icons';
import { InstallPromptService } from './install-prompt.service';

@Component({
  selector: 'app-install-prompt',
  templateUrl: 'install-prompt.html',
  styleUrl: 'install-prompt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class InstallPromptComponent {
  protected readonly installPrompt = inject(InstallPromptService);

  constructor() {
    addIcons({ downloadOutline });
  }
}
