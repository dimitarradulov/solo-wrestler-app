import { Pipe, PipeTransform } from '@angular/core';

import {
  drillState,
  MockDrillState,
} from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutDrillState',
  pure: true,
})
export class ActiveWorkoutDrillStatePipe implements PipeTransform {
  transform(index: number): MockDrillState {
    return drillState(index);
  }
}
