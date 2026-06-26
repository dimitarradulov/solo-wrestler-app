import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

import { DrillSequenceState } from '../../../training-session.model';
import { Drill } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutDrillCardComponent } from './active-workout-drill-card';

@Component({
  selector: 'app-active-workout-drill-list',
  templateUrl: 'active-workout-drill-list.html',
  styleUrls: ['active-workout-drill-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, ActiveWorkoutDrillCardComponent],
})
export class ActiveWorkoutDrillListComponent {
  drills = input.required<Drill[]>();
  drillStates = input.required<DrillSequenceState[]>();
  actionEnabledStates = input.required<boolean[]>();
  actionLabels = input.required<string[]>();
  actionIcons = input.required<string[]>();
  defaultRestSeconds = input.required<number>();
  timerLabels = input.required<string[]>();
  timerClocks = input.required<string[]>();
  timerControlStates = input.required<boolean[]>();
  restAfterDrillIndex = input.required<number | null>();
  drillRestClock = input.required<string>();
  drillAction = output<number>();
  pauseTimer = output<number>();
  resetTimer = output<number>();
  skipRest = output<void>();
  addRestSeconds = output<number>();
  watchVideo = output<string>();
}
