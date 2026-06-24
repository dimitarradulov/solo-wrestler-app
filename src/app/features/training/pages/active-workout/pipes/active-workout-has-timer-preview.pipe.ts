import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { hasTimerPreview } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutHasTimerPreview',
  pure: true,
})
export class ActiveWorkoutHasTimerPreviewPipe implements PipeTransform {
  transform(drill: Drill): boolean {
    return hasTimerPreview(drill);
  }
}
