import { Pipe, PipeTransform } from '@angular/core';

import { formatRest } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutRest',
  pure: true,
})
export class ActiveWorkoutRestPipe implements PipeTransform {
  transform(seconds: number): string {
    return formatRest(seconds);
  }
}
