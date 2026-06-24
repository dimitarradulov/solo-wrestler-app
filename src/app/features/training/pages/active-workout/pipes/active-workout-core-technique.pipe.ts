import { Pipe, PipeTransform } from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { coreTechnique } from '../utils/active-workout.utils';

@Pipe({
  name: 'activeWorkoutCoreTechnique',
  pure: true,
})
export class ActiveWorkoutCoreTechniquePipe implements PipeTransform {
  transform(drill: Drill): string {
    return coreTechnique(drill);
  }
}
