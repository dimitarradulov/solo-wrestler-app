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
import { WorkoutSessionStore } from '../../stores/workout-session.store';

@Component({
  selector: 'app-workout-completion',
  templateUrl: 'workout-completion.html',
  styleUrls: ['workout-completion.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent],
})
export class WorkoutCompletionPage {
  private readonly router = inject(Router);
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly completedWorkoutLogStore = inject(CompletedWorkoutLogStore);
  private readonly workoutSessionStore = inject(WorkoutSessionStore);

  readonly session = this.workoutSessionStore.session;
  readonly selectedDifficulty = signal<WorkoutDifficulty | null>(null);
  readonly note = signal('');
  readonly canSaveWorkout = computed(() => this.selectedDifficulty() !== null);

  constructor() {
    effect(() => {
      const session = this.session();

      if (this.isWorkoutReadyForCompletion(session)) {
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
    const session = this.session();
    const difficulty = this.selectedDifficulty();

    if (difficulty === null || session === null) {
      return;
    }

    if (!this.isWorkoutReadyForCompletion(session)) {
      return;
    }

    this.completedWorkoutLogStore.appendEntry({
      workoutId: session.workout.id,
      completedAt: new Date().toISOString(),
      difficulty,
      note: this.note().trim() === '' ? null : this.note().trim(),
      completedDrillIds: session.drills
        .filter((drill) => drill.state === 'completed')
        .map((drill) => drill.drill.id),
    });
    this.curriculumStore.setWorkoutCompleted(session.workout.id, true);
    this.workoutSessionStore.cancelWorkout();
    void this.router.navigateByUrl('/tabs/today');
  }

  private isWorkoutReadyForCompletion(
    session: ReturnType<WorkoutSessionStore['session']>,
  ): boolean {
    return (
      session !== null && session.canFinish
    );
  }
}
