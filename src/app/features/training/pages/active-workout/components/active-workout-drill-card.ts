import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

import { DrillSequenceState } from '../../../training-session.model';
import { Drill } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutClockPipe } from '../pipes/active-workout-clock.pipe';
import { ActiveWorkoutCoreTechniquePipe } from '../pipes/active-workout-core-technique.pipe';
import { ActiveWorkoutDrillMetaPipe } from '../pipes/active-workout-drill-meta.pipe';
import { ActiveWorkoutDrillTypeLabelPipe } from '../pipes/active-workout-drill-type-label.pipe';
import { ActiveWorkoutHasTimerPreviewPipe } from '../pipes/active-workout-has-timer-preview.pipe';
import { ActiveWorkoutRestTextPipe } from '../pipes/active-workout-rest-text.pipe';

@Component({
  selector: 'app-active-workout-drill-card',
  templateUrl: 'active-workout-drill-card.html',
  styleUrls: ['active-workout-drill-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonIcon,
    ActiveWorkoutClockPipe,
    ActiveWorkoutCoreTechniquePipe,
    ActiveWorkoutDrillMetaPipe,
    ActiveWorkoutDrillTypeLabelPipe,
    ActiveWorkoutHasTimerPreviewPipe,
    ActiveWorkoutRestTextPipe,
  ],
})
export class ActiveWorkoutDrillCardComponent {
  drill = input.required<Drill>();
  drillIndex = input.required<number>();
  drillState = input.required<DrillSequenceState>();
  isActionEnabled = input.required<boolean>();
  actionLabel = input.required<string>();
  actionIcon = input.required<string>();
  defaultRestSeconds = input.required<number>();
  timerLabel = input.required<string>();
  timerClock = input.required<string>();
  showTimerControls = input.required<boolean>();
  actionTriggered = output<void>();
  pauseTriggered = output<void>();
  resetTriggered = output<void>();
  watchVideo = output<string>();

  readonly stateLabel = computed(() => {
    if (this.drillState() === 'completed') {
      return 'Complete';
    }

    if (this.drillState() === 'current') {
      return 'Current';
    }

    return 'Queued';
  });
}
