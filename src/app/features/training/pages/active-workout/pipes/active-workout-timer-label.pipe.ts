import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { timerLabel } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutTimerLabel',
  pure: true,
})
export class ActiveWorkoutTimerLabelPipe implements PipeTransform {
  transform(drill: Drill): string {
    return timerLabel(drill);
  }
}
