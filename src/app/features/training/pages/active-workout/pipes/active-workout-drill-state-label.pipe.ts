import { Pipe, PipeTransform } from '@angular/core';

import { drillStateLabel } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutDrillStateLabel',
  pure: true,
})
export class ActiveWorkoutDrillStateLabelPipe implements PipeTransform {
  transform(index: number): string {
    return drillStateLabel(index);
  }
}
