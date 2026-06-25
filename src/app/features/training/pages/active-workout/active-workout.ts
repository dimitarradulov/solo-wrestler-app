import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeOutline,
  flagOutline,
  pauseOutline,
  playOutline,
  refreshOutline,
  timeOutline,
  videocamOutline,
} from 'ionicons/icons';
import { appWorkoutConfig } from '../curriculum/data/curriculum.data';
import { CurriculumStore } from '../curriculum/curriculum.store';
import { ActiveWorkoutDrillListComponent } from './components/active-workout-drill-list';
import { ActiveWorkoutHeaderComponent } from './components/active-workout-header';
import { ActiveWorkoutProgressStripComponent } from './components/active-workout-progress-strip';
import { toYouTubeEmbedUrl } from './utils/active-workout.utils';

@Component({
  selector: 'app-active-workout',
  templateUrl: 'active-workout.html',
  styleUrls: ['active-workout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonContent,
    IonIcon,
    IonModal,
    RouterLink,
    ActiveWorkoutDrillListComponent,
    ActiveWorkoutHeaderComponent,
    ActiveWorkoutProgressStripComponent,
  ],
})
export class ActiveWorkoutPage {
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly sanitizer = inject(DomSanitizer);

  readonly currentWorkout = this.curriculumStore.currentWorkout;
  readonly currentWorkoutTemplate = this.curriculumStore.currentWorkoutTemplate;
  readonly currentPhase = this.curriculumStore.currentPhase;
  readonly defaultRestSeconds = appWorkoutConfig.defaultRestSeconds;
  readonly selectedVideoUrl = signal<string | null>(null);
  readonly selectedVideoEmbedSrc = computed(() => {
    const videoUrl = this.selectedVideoUrl();

    if (videoUrl === null) {
      return null;
    }

    return toYouTubeEmbedUrl(videoUrl);
  });
  readonly selectedVideoEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const embedUrl = this.selectedVideoEmbedSrc();

    return embedUrl === null
      ? null
      : this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  });

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
        (week) => week.number === currentWorkout.weekNumber,
      )?.progressionFocus ?? null
    );
  });
  readonly phaseTitle = computed(() => this.currentPhase()?.title ?? null);

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      closeOutline,
      flagOutline,
      pauseOutline,
      playOutline,
      refreshOutline,
      timeOutline,
      videocamOutline,
    });
  }
}
