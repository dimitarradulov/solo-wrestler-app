import { Pipe, PipeTransform } from '@angular/core';

import { WorkoutTemplate } from '../../curriculum/model/curriculum.model';
import { drillProgressText } from '../utils/active-workout.utils';

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
