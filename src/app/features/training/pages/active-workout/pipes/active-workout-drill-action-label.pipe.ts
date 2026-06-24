import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { drillActionLabel } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutDrillActionLabel',
  pure: true,
})
export class ActiveWorkoutDrillActionLabelPipe implements PipeTransform {
  transform(drill: Drill): string {
    return drillActionLabel(drill);
  }
}
