import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { WorkoutTemplate } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutDrillProgressPipe } from '../pipes/active-workout-drill-progress.pipe';

@Component({
  selector: 'app-active-workout-progress-strip',
  templateUrl: 'active-workout-progress-strip.html',
  styleUrls: ['active-workout-progress-strip.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActiveWorkoutDrillProgressPipe],
})
export class ActiveWorkoutProgressStripComponent {
  workoutTemplate = input.required<WorkoutTemplate>();
  completedDrillCount = input.required<number>();
  currentDrillTitle = input.required<string>();

  progressPercent = computed(() => {
    const totalDrills = this.workoutTemplate().drills.length;

    if (totalDrills === 0) {
      return 0;
    }

    return (this.completedDrillCount() / totalDrills) * 100;
  });
}
