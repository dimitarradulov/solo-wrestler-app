import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import { WorkoutDifficulty } from '../../models/training-session.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import { CurriculumStore } from '../../stores/curriculum.store';
import { InProgressWorkoutStore } from '../../stores/in-progress-workout.store';

@Component({
  selector: 'app-workout-completion',
  templateUrl: 'workout-completion.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent],
})
export class WorkoutCompletionPage {
  private readonly router = inject(Router);
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly completedWorkoutLogStore = inject(CompletedWorkoutLogStore);
  private readonly inProgressWorkoutStore = inject(InProgressWorkoutStore);

  readonly inProgressWorkout = this.inProgressWorkoutStore.inProgressWorkout;
  readonly selectedDifficulty = signal<WorkoutDifficulty | null>(null);
  readonly note = signal('');
  readonly canSaveWorkout = computed(() => this.selectedDifficulty() !== null);

  constructor() {
    effect(() => {
      const inProgressWorkout = this.inProgressWorkout();

      if (this.isWorkoutReadyForCompletion(inProgressWorkout)) {
        return;
      }

      void this.router.navigateByUrl('/active-workout');
    });
  }

  selectDifficulty(difficulty: WorkoutDifficulty): void {
    this.selectedDifficulty.set(difficulty);
  }

  updateNote(note: string): void {
    this.note.set(note);
  }

  saveWorkout(): void {
    const inProgressWorkout = this.inProgressWorkout();
    const difficulty = this.selectedDifficulty();

    if (difficulty === null || inProgressWorkout === null) {
      return;
    }

    if (!this.isWorkoutReadyForCompletion(inProgressWorkout)) {
      return;
    }

    this.completedWorkoutLogStore.appendEntry({
      workoutId: inProgressWorkout.workoutId,
      completedAt: new Date().toISOString(),
      difficulty,
      note: this.note().trim() === '' ? null : this.note().trim(),
      completedDrillIds: [...inProgressWorkout.completedDrillIds],
    });
    this.curriculumStore.setWorkoutCompleted(inProgressWorkout.workoutId, true);
    this.inProgressWorkoutStore.clear();
    void this.router.navigateByUrl('/tabs/today');
  }

  private isWorkoutReadyForCompletion(
    inProgressWorkout: ReturnType<InProgressWorkoutStore['inProgressWorkout']>,
  ): boolean {
    return (
      inProgressWorkout !== null &&
      inProgressWorkout.completedDrillIds.length === inProgressWorkout.drillIds.length
    );
  }
}
