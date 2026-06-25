import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { Drill } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutDrillStatePipe } from '../pipes/active-workout-drill-state.pipe';
import { ActiveWorkoutDrillCardComponent } from './active-workout-drill-card';

@Component({
  selector: 'app-active-workout-drill-list',
  templateUrl: 'active-workout-drill-list.html',
  styleUrls: ['active-workout-drill-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActiveWorkoutDrillCardComponent, ActiveWorkoutDrillStatePipe],
})
export class ActiveWorkoutDrillListComponent {
  drills = input.required<Drill[]>();
  defaultRestSeconds = input.required<number>();
  watchVideo = output<string>();
}
