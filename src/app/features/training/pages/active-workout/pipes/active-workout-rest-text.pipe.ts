import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { restText } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutRestText',
  pure: true,
})
export class ActiveWorkoutRestTextPipe implements PipeTransform {
  transform(drill: Drill, defaultRestSeconds: number): string {
    return restText(drill, defaultRestSeconds);
  }
}
