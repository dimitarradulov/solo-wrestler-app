import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import {
  CompletedWorkoutDetailView,
} from '../../models/completed-workout-history.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import {
  formatWorkoutDifficulty,
  resolveCompletedWorkout,
} from '../../utils/completed-workout-history';
import { formatDrillMeta } from '../../utils/workout-session.formatters';

@Component({
  selector: 'app-completed-workout-detail',
  templateUrl: 'completed-workout-detail.html',
  styleUrls: ['completed-workout-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IonButton, IonContent, RouterLink],
})
export class CompletedWorkoutDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly completedWorkoutLogStore = inject(CompletedWorkoutLogStore);
  private readonly workoutId = this.route.snapshot.paramMap.get('workoutId');

  readonly completedWorkout = computed<CompletedWorkoutDetailView | null>(() => {
    if (this.workoutId === null) {
      return null;
    }

    const completedWorkoutEntry =
      this.completedWorkoutLogStore
        .entries()
        .find((entry) => entry.workoutId === this.workoutId) ?? null;

    if (completedWorkoutEntry === null) {
      return null;
    }

    const resolvedWorkout = resolveCompletedWorkout(this.workoutId);

    if (resolvedWorkout === null) {
      return null;
    }

    const note = completedWorkoutEntry.note?.trim() ?? null;

    return {
      workoutTitle: resolvedWorkout.workout.title,
      workoutMeta: `${resolvedWorkout.phase.title} · Week ${resolvedWorkout.week.number} · ${resolvedWorkout.workout.label}`,
      completedAt: completedWorkoutEntry.completedAt,
      difficultyLabel: formatWorkoutDifficulty(
        completedWorkoutEntry.difficulty,
      ),
      note: note === '' ? null : note,
      drills: resolvedWorkout.workoutTemplate.drills.map((drill, index) => ({
        number: index + 1,
        title: drill.title,
        meta: formatDrillMeta(drill),
      })),
    };
  });
}
