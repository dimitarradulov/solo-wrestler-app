import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
  ViewDidEnter,
  ViewWillLeave,
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
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import { TechniqueVideoPlayerService } from '../../../../core/video/technique-video-player.service';
import { WorkoutCancellationService } from '../../services/workout-cancellation.service';
import { ActiveWorkoutDrillListComponent } from './components/active-workout-drill-list';
import { ActiveWorkoutHeaderComponent } from './components/active-workout-header';
import { ActiveWorkoutProgressStripComponent } from './components/active-workout-progress-strip';

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
export class ActiveWorkoutPage
  implements OnDestroy, ViewDidEnter, ViewWillLeave
{
  private readonly workoutSessionStore = inject(WorkoutSessionStore);
  private readonly techniqueVideoPlayerService = inject(
    TechniqueVideoPlayerService,
  );
  private readonly workoutCancellationService = inject(
    WorkoutCancellationService,
  );
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ngZone = inject(NgZone);
  private readonly isAppVisible = signal(this.documentIsVisible());
  private readonly shouldResumeTechniqueVideoTimer = signal(false);
  private readonly workoutMain =
    viewChild.required<ElementRef<HTMLElement>>('workoutMain');

  readonly session = this.workoutSessionStore.session;
  readonly currentWorkout = computed(() => this.session()?.workout ?? null);
  readonly currentWorkoutTemplate = computed(
    () => this.session()?.workoutTemplate ?? null,
  );
  readonly isCancelWorkoutConfirmationOpen =
    this.workoutCancellationService.isCancelWorkoutConfirmationOpen;
  readonly isTechniqueVideoOpen =
    this.techniqueVideoPlayerService.isWebModalOpen;
  readonly selectedVideoEmbedSrc = this.techniqueVideoPlayerService.webEmbedUrl;
  readonly selectedVideoEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const embedUrl = this.selectedVideoEmbedSrc();

    return embedUrl === null
      ? null
      : this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  });

  readonly completedDrillCount = this.workoutSessionStore.completedDrillCount;
  readonly currentDrillTitle = this.workoutSessionStore.currentDrillTitle;
  readonly drillCards = this.workoutSessionStore.drillCards;
  readonly restPanel = this.workoutSessionStore.restPanel;
  readonly isWorkoutReadyToFinish = this.workoutSessionStore.canFinishWorkout;
  readonly estimatedMinutes = this.workoutSessionStore.estimatedMinutes;
  readonly progressionFocus = this.workoutSessionStore.progressionFocus;
  readonly phaseTitle = this.workoutSessionStore.phaseTitle;

  constructor() {
    this.workoutSessionStore.startOrResumeCurrentWorkout();

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

    effect((onCleanup) => {
      const handleVisibilityChange = () => {
        this.isAppVisible.set(this.documentIsVisible());
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      handleVisibilityChange();

      onCleanup(() => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      });
    });

    effect((onCleanup) => {
      const timer = this.session()?.timer;

      if (
        timer?.status !== 'running' ||
        (timer.phase !== 'work' &&
          timer.phase !== 'round-rest' &&
          timer.phase !== 'drill-rest')
      ) {
        return;
      }

      const intervalId = this.ngZone.runOutsideAngular(() =>
        window.setInterval(() => {
          this.workoutSessionStore.tick();
        }, 1000),
      );

      onCleanup(() => {
        window.clearInterval(intervalId);
      });
    });

    effect(() => {
      if (this.isAppVisible()) {
        return;
      }

      this.pauseRunningTimer();
    });

    effect(() => {
      if (!this.isAppVisible() || !this.shouldResumeTechniqueVideoTimer()) {
        return;
      }

      this.shouldResumeTechniqueVideoTimer.set(false);
      this.workoutSessionStore.resumeTimer();
    });
  }

  ionViewDidEnter(): void {
    this.workoutMain().nativeElement.focus();
  }

  ionViewWillLeave(): void {
    this.workoutSessionStore.pauseTimer();
  }

  ngOnDestroy(): void {
    this.workoutSessionStore.pauseTimer();
  }

  performCurrentDrillAction(): void {
    this.workoutSessionStore.performCurrentDrillAction();
  }

  pauseTimer(): void {
    this.workoutSessionStore.pauseTimer();
  }

  resetTimer(): void {
    this.workoutSessionStore.resetTimer();
  }

  skipRest(): void {
    this.workoutSessionStore.skipRest();
  }

  addRestSeconds(seconds: number): void {
    this.workoutSessionStore.addRest(seconds);
  }

  requestCancelWorkout(): Promise<void> {
    return this.workoutCancellationService.requestCancelWorkout();
  }

  keepTraining(): void {
    this.workoutCancellationService.keepTraining();
  }

  confirmCancelWorkout(): void {
    this.workoutCancellationService.confirmCancelWorkout();
  }

  dismissCancelWorkoutConfirmation(): void {
    this.workoutCancellationService.dismissCancelWorkoutConfirmation();
  }

  async openTechniqueVideo(videoUrl: string): Promise<void> {
    const shouldResumeTimer = this.shouldPauseTimerForTechniqueVideo();

    if (shouldResumeTimer) {
      this.workoutSessionStore.pauseTimer();
      this.shouldResumeTechniqueVideoTimer.set(false);
    }

    try {
      await this.techniqueVideoPlayerService.open(videoUrl);
    } finally {
      if (!shouldResumeTimer) {
        return;
      }

      if (this.isAppVisible()) {
        this.workoutSessionStore.resumeTimer();
        return;
      }

      this.shouldResumeTechniqueVideoTimer.set(true);
    }
  }

  closeTechniqueVideo(): void {
    this.techniqueVideoPlayerService.closeWebModal();
  }

  private documentIsVisible(): boolean {
    return document.visibilityState !== 'hidden';
  }

  private pauseRunningTimer(): void {
    this.workoutSessionStore.pauseTimer();
  }

  private shouldPauseTimerForTechniqueVideo(): boolean {
    const timer = this.session()?.timer;

    return (
      timer?.status === 'running' &&
      (timer.phase === 'work' ||
        timer.phase === 'round-rest' ||
        timer.phase === 'drill-rest')
    );
  }
}
