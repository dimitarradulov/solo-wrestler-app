import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  flagOutline,
  pauseOutline,
  playOutline,
  refreshOutline,
  timeOutline,
  videocamOutline,
} from 'ionicons/icons';
import { appWorkoutConfig } from '../curriculum/data/curriculum.data';
import { CurriculumStore } from '../curriculum/curriculum.store';
import { ActiveWorkoutClockPipe } from './pipes/active-workout-clock.pipe';
import { ActiveWorkoutCoreTechniquePipe } from './pipes/active-workout-core-technique.pipe';
import { ActiveWorkoutCurrentDrillTitlePipe } from './pipes/active-workout-current-drill-title.pipe';
import { ActiveWorkoutDrillActionIconPipe } from './pipes/active-workout-drill-action-icon.pipe';
import { ActiveWorkoutDrillActionLabelPipe } from './pipes/active-workout-drill-action-label.pipe';
import { ActiveWorkoutDrillMetaPipe } from './pipes/active-workout-drill-meta.pipe';
import { ActiveWorkoutDrillProgressPipe } from './pipes/active-workout-drill-progress.pipe';
import { ActiveWorkoutDrillStateLabelPipe } from './pipes/active-workout-drill-state-label.pipe';
import { ActiveWorkoutDrillStatePipe } from './pipes/active-workout-drill-state.pipe';
import { ActiveWorkoutDrillTypeLabelPipe } from './pipes/active-workout-drill-type-label.pipe';
import { ActiveWorkoutEquipmentPipe } from './pipes/active-workout-equipment.pipe';
import { ActiveWorkoutHasTimerPreviewPipe } from './pipes/active-workout-has-timer-preview.pipe';
import { ActiveWorkoutRestTextPipe } from './pipes/active-workout-rest-text.pipe';
import { ActiveWorkoutRestPipe } from './pipes/active-workout-rest.pipe';
import { ActiveWorkoutTimerClockPipe } from './pipes/active-workout-timer-clock.pipe';
import { ActiveWorkoutTimerLabelPipe } from './pipes/active-workout-timer-label.pipe';

@Component({
  selector: 'app-active-workout',
  templateUrl: 'active-workout.html',
  styleUrls: ['active-workout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonContent,
    IonIcon,
    RouterLink,
    ActiveWorkoutClockPipe,
    ActiveWorkoutCoreTechniquePipe,
    ActiveWorkoutCurrentDrillTitlePipe,
    ActiveWorkoutDrillActionIconPipe,
    ActiveWorkoutDrillActionLabelPipe,
    ActiveWorkoutDrillMetaPipe,
    ActiveWorkoutDrillProgressPipe,
    ActiveWorkoutDrillStateLabelPipe,
    ActiveWorkoutDrillStatePipe,
    ActiveWorkoutDrillTypeLabelPipe,
    ActiveWorkoutEquipmentPipe,
    ActiveWorkoutHasTimerPreviewPipe,
    ActiveWorkoutRestPipe,
    ActiveWorkoutRestTextPipe,
    ActiveWorkoutTimerClockPipe,
    ActiveWorkoutTimerLabelPipe,
  ],
})
export class ActiveWorkoutPage {
  private readonly curriculumStore = inject(CurriculumStore);

  readonly currentWorkout = this.curriculumStore.currentWorkout;
  readonly currentWorkoutTemplate = this.curriculumStore.currentWorkoutTemplate;
  readonly currentPhase = this.curriculumStore.currentPhase;
  readonly defaultRestSeconds = appWorkoutConfig.defaultRestSeconds;
  readonly completedDrillCount = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return 0;
    }

    return currentWorkoutTemplate.drills.length > 0 ? 1 : 0;
  });
  readonly estimatedMinutes = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return null;
    }

    return `${currentWorkoutTemplate.estimatedMinutes.min}-${currentWorkoutTemplate.estimatedMinutes.max} min`;
  });
  readonly progressionFocus = computed(() => {
    const currentPhase = this.currentPhase();
    const currentWorkout = this.currentWorkout();

    if (currentPhase === null || currentWorkout === null) {
      return null;
    }

    return (
      currentPhase.weeks.find(
        (week) => week.number === currentWorkout.weekNumber
      )?.progressionFocus ?? null
    );
  });

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      flagOutline,
      pauseOutline,
      playOutline,
      refreshOutline,
      timeOutline,
      videocamOutline,
    });
  }
}
