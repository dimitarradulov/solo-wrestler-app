import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { WorkoutTemplate } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutCurrentDrillTitlePipe } from '../pipes/active-workout-current-drill-title.pipe';
import { ActiveWorkoutDrillProgressPipe } from '../pipes/active-workout-drill-progress.pipe';

@Component({
  selector: 'app-active-workout-progress-strip',
  templateUrl: 'active-workout-progress-strip.html',
  styleUrls: ['active-workout-progress-strip.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActiveWorkoutCurrentDrillTitlePipe, ActiveWorkoutDrillProgressPipe],
})
export class ActiveWorkoutProgressStripComponent {
  workoutTemplate = input.required<WorkoutTemplate>();
  completedDrillCount = input.required<number>();
}
