import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonAlert, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { InstallPromptComponent } from './core/install-prompt/install-prompt';
import { CurriculumRevisionService } from './core/curriculum-revision/curriculum-revision.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonAlert, IonApp, IonRouterOutlet, InstallPromptComponent],
})
export class AppComponent {
  private readonly curriculumRevisionService = inject(
    CurriculumRevisionService,
  );

  readonly shouldShowCurriculumResetNotice =
    this.curriculumRevisionService.shouldShowResetNotice;

  dismissCurriculumResetNotice(): void {
    this.curriculumRevisionService.dismissResetNotice();
  }
}
