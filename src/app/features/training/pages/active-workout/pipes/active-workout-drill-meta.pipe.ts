import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { formatDrillMeta } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutDrillMeta',
  pure: true,
})
export class ActiveWorkoutDrillMetaPipe implements PipeTransform {
  transform(drill: Drill): string | null {
    return formatDrillMeta(drill);
  }
}
