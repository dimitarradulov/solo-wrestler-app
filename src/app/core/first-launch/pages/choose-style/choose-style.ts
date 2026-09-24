import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import { WorkoutSessionStore } from '../../../../features/training/stores/workout-session.store';

@Component({
  selector: 'app-choose-style',
  templateUrl: 'choose-style.html',
  styleUrl: 'choose-style.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, RouterLink],
})
export class ChooseStylePage {
  private readonly workoutSessionStore = inject(WorkoutSessionStore);
  readonly hasInProgressWorkout = this.workoutSessionStore.hasInProgressWorkout;
  readonly freestyleChoice = { style: 'freestyle' };
  readonly grecoRomanChoice = { style: 'greco-roman' };
}
