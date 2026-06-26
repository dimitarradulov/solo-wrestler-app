import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
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
import { InProgressWorkoutStore } from '../../in-progress-workout.store';
import { appWorkoutConfig } from '../curriculum/data/curriculum.data';
import {
  Drill,
  CurriculumPhase,
  WorkoutInstance,
  WorkoutTemplate,
} from '../curriculum/model/curriculum.model';
import { CurriculumStore } from '../curriculum/curriculum.store';
import { DrillSequenceState } from '../../training-session.model';
import { ActiveWorkoutDrillListComponent } from './components/active-workout-drill-list';
import { ActiveWorkoutHeaderComponent } from './components/active-workout-header';
import { ActiveWorkoutProgressStripComponent } from './components/active-workout-progress-strip';
import {
  drillActionIcon,
  drillActionLabel,
  formatClock,
  timerClock,
  timerLabel,
  toYouTubeEmbedUrl,
} from './utils/active-workout.utils';

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
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly inProgressWorkoutStore = inject(InProgressWorkoutStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly phases = this.curriculumStore.phases;
  private readonly isAppVisible = signal(this.documentIsVisible());

  readonly currentWorkout = computed(() => {
    const inProgressWorkout = this.inProgressWorkoutStore.inProgressWorkout();

    if (inProgressWorkout === null) {
      return this.curriculumStore.currentWorkout();
    }

    return this.findWorkout(inProgressWorkout.workoutId);
  });
  readonly currentWorkoutTemplate = computed(() => {
    const inProgressWorkout = this.inProgressWorkoutStore.inProgressWorkout();

    if (inProgressWorkout === null) {
      return this.curriculumStore.currentWorkoutTemplate();
    }

    return this.findWorkoutTemplate(inProgressWorkout.workoutTemplateId);
  });
  readonly currentPhase = computed(() => {
    const currentWorkout = this.currentWorkout();

    if (currentWorkout === null) {
      return this.curriculumStore.currentPhase();
    }

    return this.findPhaseForWorkout(currentWorkout.id);
  });
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

  readonly completedDrillCount = this.inProgressWorkoutStore.completedDrillCount;
  readonly inProgressWorkout = this.inProgressWorkoutStore.inProgressWorkout;
  readonly currentDrillTitle = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const inProgressWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return 'None';
    }

    const currentDrillIndex = inProgressWorkout?.currentDrillIndex ?? 0;

    return currentWorkoutTemplate.drills[currentDrillIndex]?.title ?? 'None';
  });
  readonly drillStates = computed<DrillSequenceState[]>(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const inProgressWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    const completedDrillIds = new Set(inProgressWorkout?.completedDrillIds ?? []);
    const currentDrillIndex = inProgressWorkout?.currentDrillIndex ?? 0;

    return currentWorkoutTemplate.drills.map((drill, drillIndex) =>
      this.resolveDrillState(
        drill,
        drillIndex,
        currentDrillIndex,
        completedDrillIds,
        inProgressWorkout?.timer.phase ?? 'idle',
      ),
    );
  });
  readonly actionEnabledStates = computed(() => {
    const inProgressWorkout = this.inProgressWorkout();

    return this.drillStates().map(
      (drillState) =>
        drillState === 'current' &&
        inProgressWorkout?.timer.phase !== 'drill-rest' &&
        inProgressWorkout?.timer.phase !== 'round-rest',
    );
  });
  readonly actionLabels = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    return currentWorkoutTemplate.drills.map((drill, drillIndex) => {
      if (drill.type === 'reps') {
        return 'Mark Complete';
      }

      if (
        currentWorkout?.currentDrillIndex === drillIndex &&
        currentWorkout.timer.status === 'finished'
      ) {
        return 'Mark Complete';
      }

      return drillActionLabel(drill);
    });
  });
  readonly actionIcons = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    return currentWorkoutTemplate.drills.map((drill, drillIndex) => {
      if (
        drill.type !== 'reps' &&
        currentWorkout?.currentDrillIndex === drillIndex &&
        currentWorkout.timer.status === 'finished'
      ) {
        return 'checkmark-circle-outline';
      }

      return drillActionIcon(drill);
    });
  });
  readonly timerLabels = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    return currentWorkoutTemplate.drills.map((drill, drillIndex) => {
      if (
        drillIndex === currentWorkout?.currentDrillIndex &&
        drill.type === 'rounds' &&
        currentWorkout.timer.roundNumber !== null &&
        currentWorkout.timer.totalRounds !== null
      ) {
        return `Round ${currentWorkout.timer.roundNumber} of ${currentWorkout.timer.totalRounds}`;
      }

      return timerLabel(drill);
    });
  });
  readonly timerClocks = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    return currentWorkoutTemplate.drills.map((drill, drillIndex) => {
      if (
        drillIndex === currentWorkout?.currentDrillIndex &&
        currentWorkout.timer.phase !== 'drill-rest' &&
        currentWorkout.timer.remainingSeconds !== null &&
        (drill.type === 'duration' || drill.type === 'rounds')
      ) {
        return formatClock(currentWorkout.timer.remainingSeconds);
      }

      return timerClock(drill);
    });
  });
  readonly timerControlStates = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkoutTemplate === null) {
      return [];
    }

    return currentWorkoutTemplate.drills.map(
      (drill, drillIndex) =>
        drillIndex === currentWorkout?.currentDrillIndex &&
        (drill.type === 'duration' || drill.type === 'rounds') &&
        currentWorkout.timer.phase !== 'drill-rest',
    );
  });
  readonly restAfterDrillIndex = computed(() => {
    const inProgressWorkout = this.inProgressWorkout();

    if (inProgressWorkout?.timer.phase !== 'drill-rest') {
      return null;
    }

    return inProgressWorkout.currentDrillIndex - 1;
  });
  readonly drillRestClock = computed(() => {
    const remainingSeconds = this.inProgressWorkout()?.timer.remainingSeconds;

    if (remainingSeconds === null || remainingSeconds === undefined) {
      return '0:00';
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
  readonly isWorkoutReadyToFinish = computed(() => {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return false;
    }

    return this.completedDrillCount() === currentWorkoutTemplate.drills.length;
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
    const currentWorkout = this.curriculumStore.currentWorkout();
    const currentWorkoutTemplate = this.curriculumStore.currentWorkoutTemplate();

    if (currentWorkout !== null && currentWorkoutTemplate !== null) {
      this.inProgressWorkoutStore.startOrResumeWorkout(
        currentWorkout,
        currentWorkoutTemplate,
      );
    }

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
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      });
    });

    effect((onCleanup) => {
      const currentWorkoutTemplate = this.currentWorkoutTemplate();
      const timer = this.inProgressWorkout()?.timer;

      if (
        currentWorkoutTemplate === null ||
        timer?.status !== 'running' ||
        (timer.phase !== 'work' &&
          timer.phase !== 'round-rest' &&
          timer.phase !== 'drill-rest')
      ) {
        return;
      }

      const intervalId = window.setInterval(() => {
        this.inProgressWorkoutStore.tickCurrentTimer(currentWorkoutTemplate);
      }, 1000);

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
    this.pauseRunningTimer();
  }

  ngOnDestroy(): void {
    this.pauseRunningTimer();
  }

  handleDrillAction(drillIndex: number): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (
      currentWorkoutTemplate === null ||
      currentWorkout === null ||
      currentWorkout.currentDrillIndex !== drillIndex
    ) {
      return;
    }

    const currentDrill = currentWorkoutTemplate.drills[drillIndex];

    if (currentDrill?.type === 'reps') {
      this.inProgressWorkoutStore.markCurrentDrillComplete(currentWorkoutTemplate);
      return;
    }

    if (
      currentWorkout.timer.status === 'finished' &&
      (currentDrill?.type === 'duration' || currentDrill?.type === 'rounds')
    ) {
      this.inProgressWorkoutStore.markCurrentDrillComplete(currentWorkoutTemplate);
      return;
    }

    if (currentDrill?.type === 'duration' || currentDrill?.type === 'rounds') {
      this.inProgressWorkoutStore.startCurrentTimer(currentWorkoutTemplate);
    }
  }

  pauseTimer(drillIndex: number): void {
    const currentWorkout = this.inProgressWorkout();

    if (currentWorkout?.currentDrillIndex !== drillIndex) {
      return;
    }

    this.inProgressWorkoutStore.pauseCurrentTimer();
  }

  resetTimer(drillIndex: number): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();
    const currentWorkout = this.inProgressWorkout();

    if (
      currentWorkoutTemplate === null ||
      currentWorkout?.currentDrillIndex !== drillIndex
    ) {
      return;
    }

    this.inProgressWorkoutStore.resetCurrentTimer(currentWorkoutTemplate);
  }

  skipRest(): void {
    const currentWorkoutTemplate = this.currentWorkoutTemplate();

    if (currentWorkoutTemplate === null) {
      return;
    }

    this.inProgressWorkoutStore.skipRest(currentWorkoutTemplate);
  }

  addRestSeconds(seconds: number): void {
    this.inProgressWorkoutStore.addRestSeconds(seconds);
  }

  private findWorkout(workoutId: string): WorkoutInstance | null {
    for (const phase of this.phases()) {
      for (const week of phase.weeks) {
        const workout = week.workouts.find((item) => item.id === workoutId);

        if (workout) {
          return workout;
        }
      }
    }

    return null;
  }

  private findWorkoutTemplate(workoutTemplateId: string): WorkoutTemplate | null {
    for (const phase of this.phases()) {
      const workoutTemplate =
        phase.workoutTemplates.find((item) => item.id === workoutTemplateId) ??
        null;

      if (workoutTemplate) {
        return workoutTemplate;
      }
    }

    return null;
  }

  private findPhaseForWorkout(workoutId: string): CurriculumPhase | null {
    return (
      this.phases().find((phase) =>
        phase.weeks.some((week) =>
          week.workouts.some((workout) => workout.id === workoutId),
        ),
      ) ?? null
    );
  }

  private resolveDrillState(
    drill: Drill,
    drillIndex: number,
    currentDrillIndex: number,
    completedDrillIds: Set<string>,
    timerPhase: 'idle' | 'work' | 'round-rest' | 'drill-rest' | 'complete',
  ): DrillSequenceState {
    if (completedDrillIds.has(drill.id)) {
      return 'completed';
    }

    if (timerPhase === 'drill-rest') {
      return 'queued';
    }

    if (drillIndex === currentDrillIndex) {
      return 'current';
    }

    return 'queued';
  }

  private documentIsVisible(): boolean {
    return document.visibilityState !== 'hidden';
  }

  private pauseRunningTimer(): void {
    if (this.inProgressWorkout()?.timer.status !== 'running') {
      return;
    }

    this.inProgressWorkoutStore.pauseCurrentTimer();
  }
}
