import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

import { Drill } from '../../../models/curriculum.model';
import { ActiveWorkoutDrillCardView } from '../../../models/workout-session.model';
import { ActiveWorkoutClockPipe } from '../pipes/active-workout-clock.pipe';

@Component({
  selector: 'app-active-workout-drill-card',
  templateUrl: 'active-workout-drill-card.html',
  styleUrls: ['active-workout-drill-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonIcon, ActiveWorkoutClockPipe],
})
export class ActiveWorkoutDrillCardComponent {
  drillCard = input.required<ActiveWorkoutDrillCardView>();
  actionTriggered = output<void>();
  pauseTriggered = output<void>();
  resetTriggered = output<void>();
  watchVideo = output<Drill>();
}
