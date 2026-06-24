import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { appWorkoutConfig } from '../curriculum/data/curriculum.data';
import { CurriculumStore } from '../curriculum/curriculum.store';
import { Drill, WorkoutTemplate } from '../curriculum/model/curriculum.model';

@Component({
  selector: 'app-active-workout',
  templateUrl: 'active-workout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, RouterLink],
})
export class ActiveWorkoutPage {
  private readonly curriculumStore = inject(CurriculumStore);

  readonly currentWorkout = this.curriculumStore.currentWorkout;
  readonly currentWorkoutTemplate = this.curriculumStore.currentWorkoutTemplate;
  readonly currentPhase = this.curriculumStore.currentPhase;
  readonly defaultRestSeconds = appWorkoutConfig.defaultRestSeconds;
  readonly estimatedMinutes = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return null;
    }

    return `${currentWorkoutTemplate.estimatedMinutes.min}-${currentWorkoutTemplate.estimatedMinutes.max} min`;
  });

  trackDrill(index: number, drill: Drill): string {
    return `${index}-${drill.id}`;
  }

  formatDrillMeta(drill: Drill): string | null {
    if (drill.prescription) {
      return drill.prescription;
    }

    if (drill.durationConfig) {
      return this.formatMinutes(drill.durationConfig.durationSeconds);
    }

    if (drill.roundsConfig) {
      return `${drill.roundsConfig.rounds} rounds x ${this.formatMinutes(drill.roundsConfig.roundSeconds)} with ${drill.roundsConfig.restBetweenRoundsSeconds} sec rest`;
    }

    return null;
  }

  formatEquipment(workoutTemplate: WorkoutTemplate | null): string {
    if (workoutTemplate === null) {
      return '';
    }

    return workoutTemplate.equipment.join(' + ');
  }

  private formatMinutes(durationSeconds: number): string {
    if (durationSeconds % 60 === 0) {
      return `${durationSeconds / 60} min`;
    }

    return `${durationSeconds} sec`;
  }
}
