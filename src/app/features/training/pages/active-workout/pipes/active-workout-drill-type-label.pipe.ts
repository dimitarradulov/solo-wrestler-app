import { Pipe, PipeTransform } from '@angular/core';

import { DrillType } from '../../curriculum/model/curriculum.model';
import { drillTypeLabel } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutDrillTypeLabel',
  pure: true,
})
export class ActiveWorkoutDrillTypeLabelPipe implements PipeTransform {
  transform(type: DrillType): string {
    return drillTypeLabel(type);
  }
}
