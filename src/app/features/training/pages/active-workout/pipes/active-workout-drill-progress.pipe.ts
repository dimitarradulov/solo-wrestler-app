import { Pipe, PipeTransform } from '@angular/core';

import { WorkoutTemplate } from '../../../models/curriculum.model';
import { drillProgressText } from '../../../utils/workout-session.formatters';

@Pipe({
  name: 'activeWorkoutDrillProgress',
  pure: true,
})
export class ActiveWorkoutDrillProgressPipe implements PipeTransform {
  transform(
    workoutTemplate: WorkoutTemplate,
    completedDrillCount: number,
  ): string {
    return drillProgressText(workoutTemplate, completedDrillCount);
  }
}
