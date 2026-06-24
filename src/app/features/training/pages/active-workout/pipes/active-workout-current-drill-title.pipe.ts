import { Pipe, PipeTransform } from '@angular/core';

import { WorkoutTemplate } from '../../curriculum/model/curriculum.model';
import { currentDrillTitle } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutCurrentDrillTitle',
  pure: true,
})
export class ActiveWorkoutCurrentDrillTitlePipe implements PipeTransform {
  transform(workoutTemplate: WorkoutTemplate): string {
    return currentDrillTitle(workoutTemplate);
  }
}
