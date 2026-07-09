import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

import {
  ActiveWorkoutDrillCardView,
  ActiveWorkoutRestPanelView,
} from '../../../models/workout-session.model';
import { Drill } from '../../../models/curriculum.model';
import { ActiveWorkoutDrillCardComponent } from './active-workout-drill-card';

@Component({
  selector: 'app-active-workout-drill-list',
  templateUrl: 'active-workout-drill-list.html',
  styleUrls: ['active-workout-drill-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, ActiveWorkoutDrillCardComponent],
})
export class ActiveWorkoutDrillListComponent {
  drillCards = input.required<ActiveWorkoutDrillCardView[]>();
  restPanel = input.required<ActiveWorkoutRestPanelView | null>();
  drillAction = output<number>();
  pauseTimer = output<number>();
  resetTimer = output<number>();
  skipRest = output<void>();
  addRestSeconds = output<number>();
  watchVideo = output<Drill>();
}
