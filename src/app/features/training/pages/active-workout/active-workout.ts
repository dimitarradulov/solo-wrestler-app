import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  NgZone,
  OnDestroy,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
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
export class ActiveWorkoutPage implements OnDestroy, ViewWillLeave {
  private readonly workoutSessionStore = inject(WorkoutSessionStore);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ngZone = inject(NgZone);
  private readonly isAppVisible = signal(this.documentIsVisible());
  private cancelWorkoutConfirmationResolver:
    | ((shouldCancelWorkout: boolean) => void)
    | null = null;
  private cancelWorkoutConfirmationPromise: Promise<boolean> | null = null;

  readonly currentWorkout = this.workoutSessionStore.currentWorkout;
  readonly currentWorkoutTemplate =
    this.workoutSessionStore.currentWorkoutTemplate;
  readonly hasInProgressWorkout = this.workoutSessionStore.hasInProgressWorkout;
  readonly isCancelWorkoutConfirmationOpen = signal(false);
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

  async requestCancelWorkout(): Promise<void> {
    const shouldCancelWorkout = await this.confirmWorkoutCancellation();

    if (!shouldCancelWorkout) {
      return;
    }

    this.cancelWorkout();
    void this.router.navigateByUrl('/tabs/today', { replaceUrl: true });
  }

  confirmWorkoutCancellation(): Promise<boolean> {
    this.pauseRunningTimer();

    if (this.cancelWorkoutConfirmationPromise !== null) {
      return this.cancelWorkoutConfirmationPromise;
    }

    this.isCancelWorkoutConfirmationOpen.set(true);
    this.cancelWorkoutConfirmationPromise = new Promise<boolean>((resolve) => {
      this.cancelWorkoutConfirmationResolver = resolve;
    });

    return this.cancelWorkoutConfirmationPromise;
  }

  cancelWorkout(): void {
    this.workoutSessionStore.cancelWorkout();
  }

  keepTraining(): void {
    this.resolveCancelWorkoutConfirmation(false);
  }

  confirmCancelWorkout(): void {
    this.resolveCancelWorkoutConfirmation(true);
  }

  dismissCancelWorkoutConfirmation(): void {
    this.resolveCancelWorkoutConfirmation(false);
  }

  private documentIsVisible(): boolean {
    return document.visibilityState !== 'hidden';
  }

  private pauseRunningTimer(): void {
    this.workoutSessionStore.pauseRunningTimer();
  }

  private resolveCancelWorkoutConfirmation(shouldCancelWorkout: boolean): void {
    const resolver = this.cancelWorkoutConfirmationResolver;

    this.cancelWorkoutConfirmationResolver = null;
    this.cancelWorkoutConfirmationPromise = null;
    this.isCancelWorkoutConfirmationOpen.set(false);
    resolver?.(shouldCancelWorkout);
  }
}
