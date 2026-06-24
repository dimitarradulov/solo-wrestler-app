import { Pipe, PipeTransform } from '@angular/core';

import { WorkoutTemplate } from '../../curriculum/model/curriculum.model';
import { formatEquipment } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutEquipment',
  pure: true,
})
export class ActiveWorkoutEquipmentPipe implements PipeTransform {
  transform(workoutTemplate: WorkoutTemplate | null): string {
    return formatEquipment(workoutTemplate);
  }
}
