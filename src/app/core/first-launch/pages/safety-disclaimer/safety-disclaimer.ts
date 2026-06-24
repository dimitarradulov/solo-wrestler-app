import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonButton,
  IonContent,
  NavController,
} from '@ionic/angular/standalone';
import { OnboardingCompletionStore } from '../../onboarding-completion-store';

@Component({
  selector: 'app-safety-disclaimer',
  templateUrl: 'safety-disclaimer.html',
  styleUrl: 'safety-disclaimer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent],
})
export class SafetyDisclaimerPage {
  private readonly navController = inject(NavController);
  private readonly onboardingCompletionStore = inject(
    OnboardingCompletionStore,
  );

  acknowledgeDisclaimer(): void {
    this.onboardingCompletionStore.markComplete();
    this.navController.navigateRoot('/tabs/today');
  }
}
