import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  NavController,
} from '@ionic/angular/standalone';
import { OnboardingCompletionStore } from '../../onboarding-completion-store';
import { isWrestlingStyle } from '../../../../features/training/models/wrestling-style.model';
import { WorkoutSessionStore } from '../../../../features/training/stores/workout-session.store';

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
  private readonly route = inject(ActivatedRoute);
  private readonly workoutSessionStore = inject(WorkoutSessionStore);
  private readonly routeParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  constructor() {
    effect(() => {
      const style = this.routeParams().get('style');

      if (isWrestlingStyle(style)) {
        this.workoutSessionStore.switchStyle(style);
      }
    });
  }

  acknowledgeDisclaimer(): void {
    this.onboardingCompletionStore.markComplete();
    this.navController.navigateRoot('/tabs/today');
  }
}
