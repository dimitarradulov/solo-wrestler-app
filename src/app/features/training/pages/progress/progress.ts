import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';

import { CompletedWorkoutCardView } from '../../models/completed-workout-history.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import {
  formatWorkoutDifficulty,
  resolveCompletedWorkout,
} from '../../utils/completed-workout-history';

@Component({
  selector: 'app-progress',
  templateUrl: 'progress.html',
  styleUrls: ['progress.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IonButton, IonContent, IonIcon, RouterLink],
})
export class ProgressPage {
  private readonly completedWorkoutLogStore = inject(CompletedWorkoutLogStore);

  constructor() {
    addIcons({ chevronForwardOutline });
  }

  readonly completedWorkouts = computed<CompletedWorkoutCardView[]>(() => {
    const entries = [...this.completedWorkoutLogStore.entries()].sort((a, b) =>
      b.completedAt.localeCompare(a.completedAt),
    );
    const completedWorkouts: CompletedWorkoutCardView[] = [];

    for (const entry of entries) {
      const resolvedWorkout = resolveCompletedWorkout(entry.workoutId);

      if (resolvedWorkout === null) {
        continue;
      }

      completedWorkouts.push({
        workoutId: entry.workoutId,
        workoutTitle: resolvedWorkout.workout.title,
        workoutMeta: `${resolvedWorkout.phase.title} · Week ${resolvedWorkout.week.number} · ${resolvedWorkout.workout.label}`,
        completedAt: entry.completedAt,
        difficultyLabel: formatWorkoutDifficulty(entry.difficulty),
        detailLink: `/completed-workouts/${entry.workoutId}`,
      });
    }

    return completedWorkouts;
  });

  readonly hasCompletedWorkouts = computed(
    () => this.completedWorkouts().length > 0,
  );
}
