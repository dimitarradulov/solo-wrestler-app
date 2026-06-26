import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import { InProgressWorkoutStore } from '../../in-progress-workout.store';
import { CurriculumStore } from '../curriculum/curriculum.store';

@Component({
  selector: 'app-today',
  templateUrl: 'today.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, RouterLink],
})
export class TodayPage {
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly inProgressWorkoutStore = inject(InProgressWorkoutStore);

  readonly inProgressWorkout = this.inProgressWorkoutStore.inProgressWorkout;
  readonly currentWorkout = this.curriculumStore.currentWorkout;
  readonly workoutLabel = computed(
    () =>
      this.inProgressWorkout()?.workoutLabel ?? this.currentWorkout()?.label ?? null,
  );
  readonly workoutTitle = computed(
    () =>
      this.inProgressWorkout()?.workoutTitle ?? this.currentWorkout()?.title ?? null,
  );
  readonly workoutActionLabel = computed(() =>
    this.inProgressWorkoutStore.hasInProgressWorkout()
      ? 'Resume Workout'
      : 'Start Workout',
  );
  readonly completedDrillCount = this.inProgressWorkoutStore.completedDrillCount;
}
