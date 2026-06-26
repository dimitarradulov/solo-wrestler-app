import { Pipe, PipeTransform } from '@angular/core';

import { formatClock } from '../../../utils/workout-session.formatters';

@Pipe({
  name: 'activeWorkoutClock',
  pure: true,
})
export class ActiveWorkoutClockPipe implements PipeTransform {
  transform(durationSeconds: number): string {
    return formatClock(durationSeconds);
  }
}
