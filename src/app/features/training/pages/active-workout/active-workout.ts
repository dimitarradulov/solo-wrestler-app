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
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ngZone = inject(NgZone);
  private readonly isAppVisible = signal(this.documentIsVisible());
  private readonly shouldResumeTechniqueVideoTimer = signal(false);
  private readonly workoutMain =
    viewChild.required<ElementRef<HTMLElement>>('workoutMain');

  readonly currentWorkout = this.workoutSessionStore.currentWorkout;
  readonly currentWorkoutTemplate =
    this.workoutSessionStore.currentWorkoutTemplate;
  readonly isCancelWorkoutConfirmationOpen =
    this.workoutSessionStore.isCancelWorkoutConfirmationOpen;
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
      const timer = this.workoutSessionStore.inProgressWorkout()?.timer;

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
          this.workoutSessionStore.tickCurrentTimer();
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
      this.workoutSessionStore.resumePausedTimer();
    });
  }

  ionViewDidEnter(): void {
    this.workoutMain().nativeElement.focus();
  }

  ionViewWillLeave(): void {
    this.workoutSessionStore.pauseRunningTimer();
  }

  ngOnDestroy(): void {
    this.workoutSessionStore.pauseRunningTimer();
  }

  handleDrillAction(drillIndex: number): void {
    this.workoutSessionStore.handleDrillAction(drillIndex);
  }

  pauseTimer(drillIndex: number): void {
    this.workoutSessionStore.pauseTimer(drillIndex);
  }

  resetTimer(drillIndex: number): void {
    this.workoutSessionStore.resetTimer(drillIndex);
  }

  skipRest(): void {
    this.workoutSessionStore.skipRest();
  }

  addRestSeconds(seconds: number): void {
    this.workoutSessionStore.addRestSeconds(seconds);
  }

  requestCancelWorkout(): Promise<void> {
    return this.workoutSessionStore.requestCancelWorkout();
  }

  keepTraining(): void {
    this.workoutSessionStore.keepTraining();
  }

  confirmCancelWorkout(): void {
    this.workoutSessionStore.confirmCancelWorkout();
  }

  dismissCancelWorkoutConfirmation(): void {
    this.workoutSessionStore.dismissCancelWorkoutConfirmation();
  }

  async openTechniqueVideo(videoUrl: string): Promise<void> {
    const shouldResumeTimer = this.shouldPauseTimerForTechniqueVideo();

    if (shouldResumeTimer) {
      this.workoutSessionStore.pauseRunningTimer();
      this.shouldResumeTechniqueVideoTimer.set(false);
    }

    try {
      await this.techniqueVideoPlayerService.open(videoUrl);
    } finally {
      if (!shouldResumeTimer) {
        return;
      }

      if (this.isAppVisible()) {
        this.workoutSessionStore.resumePausedTimer();
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
    this.workoutSessionStore.pauseRunningTimer();
  }

  private shouldPauseTimerForTechniqueVideo(): boolean {
    const timer = this.workoutSessionStore.inProgressWorkout()?.timer;

    return (
      timer?.status === 'running' &&
      (timer.phase === 'work' ||
        timer.phase === 'round-rest' ||
        timer.phase === 'drill-rest')
    );
  }
}
