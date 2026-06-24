import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { timerClock } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutTimerClock',
  pure: true,
})
export class ActiveWorkoutTimerClockPipe implements PipeTransform {
  transform(drill: Drill): string {
    return timerClock(drill);
  }
}
