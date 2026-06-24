import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

import { Drill } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutClockPipe } from '../pipes/active-workout-clock.pipe';
import { ActiveWorkoutCoreTechniquePipe } from '../pipes/active-workout-core-technique.pipe';
import { ActiveWorkoutDrillActionIconPipe } from '../pipes/active-workout-drill-action-icon.pipe';
import { ActiveWorkoutDrillActionLabelPipe } from '../pipes/active-workout-drill-action-label.pipe';
import { ActiveWorkoutDrillMetaPipe } from '../pipes/active-workout-drill-meta.pipe';
import { ActiveWorkoutDrillStateLabelPipe } from '../pipes/active-workout-drill-state-label.pipe';
import { ActiveWorkoutDrillTypeLabelPipe } from '../pipes/active-workout-drill-type-label.pipe';
import { ActiveWorkoutHasTimerPreviewPipe } from '../pipes/active-workout-has-timer-preview.pipe';
import { ActiveWorkoutRestTextPipe } from '../pipes/active-workout-rest-text.pipe';
import { ActiveWorkoutTimerClockPipe } from '../pipes/active-workout-timer-clock.pipe';
import { ActiveWorkoutTimerLabelPipe } from '../pipes/active-workout-timer-label.pipe';
import { drillState } from '../utils/active-workout.utils';

@Component({
  selector: 'app-active-workout-drill-card',
  templateUrl: 'active-workout-drill-card.html',
  styleUrls: ['active-workout-drill-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonIcon,
    ActiveWorkoutClockPipe,
    ActiveWorkoutCoreTechniquePipe,
    ActiveWorkoutDrillActionIconPipe,
    ActiveWorkoutDrillActionLabelPipe,
    ActiveWorkoutDrillMetaPipe,
    ActiveWorkoutDrillStateLabelPipe,
    ActiveWorkoutDrillTypeLabelPipe,
    ActiveWorkoutHasTimerPreviewPipe,
    ActiveWorkoutRestTextPipe,
    ActiveWorkoutTimerClockPipe,
    ActiveWorkoutTimerLabelPipe,
  ],
})
export class ActiveWorkoutDrillCardComponent {
  drill = input.required<Drill>();
  drillIndex = input.required<number>();
  defaultRestSeconds = input.required<number>();

  readonly state = computed(() => drillState(this.drillIndex()));
}
