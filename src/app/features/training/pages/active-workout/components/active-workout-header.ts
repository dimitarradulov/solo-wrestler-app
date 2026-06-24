import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
  WorkoutInstance,
  WorkoutTemplate,
} from '../../curriculum/model/curriculum.model';

@Component({
  selector: 'app-active-workout-header',
  templateUrl: 'active-workout-header.html',
  styleUrls: ['active-workout-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveWorkoutHeaderComponent {
  workout = input.required<WorkoutInstance>();
  workoutTemplate = input.required<WorkoutTemplate>();
  phaseTitle = input.required<string | null>();
  estimatedMinutes = input.required<string | null>();
  progressionFocus = input.required<string | null>();
}
