import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { drillActionIcon } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutDrillActionIcon',
  pure: true,
})
export class ActiveWorkoutDrillActionIconPipe implements PipeTransform {
  transform(drill: Drill): string {
    return drillActionIcon(drill);
  }
}
