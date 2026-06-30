import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark } from 'ionicons/icons';

import { CurriculumStore } from '../../stores/curriculum.store';
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import { Drill } from '../../models/curriculum.model';
import { formatDrillMeta } from '../../utils/workout-session.formatters';

type TodayDrillState = 'completed' | 'next' | 'pending';

interface TodayDrillView {
  number: number;
  title: string;
  meta: string | null;
  state: TodayDrillState;
}

type TodayPageState =
  | 'available'
  | 'in-progress'
  | 'finished-unsaved'
  | 'curriculum-complete';

@Component({
  selector: 'app-today',
  templateUrl: 'today.html',
  styleUrls: ['today.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, IonIcon, RouterLink],
})
export class TodayPage {
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly workoutSessionStore = inject(WorkoutSessionStore);

  constructor() {
    addIcons({ checkmark });
  }

  readonly currentWorkout = this.curriculumStore.currentWorkout;
  readonly session = this.workoutSessionStore.session;
  readonly workout = computed(
    () => this.session()?.workout ?? this.curriculumStore.currentWorkout(),
  );
  readonly workoutTemplate = computed(
    () =>
      this.session()?.workoutTemplate ??
      this.curriculumStore.currentWorkoutTemplate(),
  );

  readonly totalWorkoutCount = this.curriculumStore.totalWorkoutCount;

  readonly pageState = computed<TodayPageState>(() => {
    const session = this.session();
    const currentWorkout = this.currentWorkout();

    if (session === null && currentWorkout === null) {
      return 'curriculum-complete';
    }

    if (session !== null) {
      const totalDrills = session.workoutTemplate.drills.length;
      const completedDrills = session.completedDrillCount;

      if (completedDrills === totalDrills && totalDrills > 0) {
        return 'finished-unsaved';
      }

      return 'in-progress';
    }

    return 'available';
  });

  readonly isCurriculumComplete = computed(
    () => this.pageState() === 'curriculum-complete',
  );

  readonly completionHeading = computed(() => {
    const currentPhase = this.curriculumStore.currentPhase();

    if (currentPhase === null) {
      return 'Phase 1 complete';
    }

    const shortName = currentPhase.title.split(':')[0]?.trim() ?? '';

    return shortName === '' ? `${currentPhase.title} complete` : `${shortName} complete`;
  });

  readonly positionLabel = computed(() => {
    const workout = this.workout();

    if (workout === null) {
      return null;
    }

    const sequenceNumber = this.curriculumStore.getWorkoutSequenceNumber(
      workout.id,
    );
    const totalCount = this.curriculumStore.totalWorkoutCount();

    if (sequenceNumber === null || totalCount === 0) {
      return null;
    }

    return `Week ${workout.weekNumber} · Workout ${sequenceNumber} of ${totalCount}`;
  });

  readonly workoutIdentity = computed(() => {
    const workout = this.workout();

    if (workout === null) {
      return null;
    }

    return `${workout.label}: ${workout.title}`;
  });

  readonly estimatedDuration = computed(() => {
    const template = this.workoutTemplate();

    if (template === null) {
      return null;
    }

    return `${template.estimatedMinutes.min}-${template.estimatedMinutes.max} min`;
  });

  readonly drillCountLabel = computed(() => {
    const template = this.workoutTemplate();

    if (template === null) {
      return null;
    }

    const count = template.drills.length;

    return `${count} drill${count === 1 ? '' : 's'}`;
  });

  readonly equipmentLabel = computed(() => {
    const template = this.workoutTemplate();

    if (template === null || template.equipment.length === 0) {
      return null;
    }

    return template.equipment.join(' + ');
  });

  readonly progressionFocus = this.workoutSessionStore.progressionFocus;

  readonly progressLabel = computed(() => {
    const session = this.session();
    const template = this.workoutTemplate();

    if (session === null || template === null) {
      return null;
    }

    const completed = session.completedDrillCount;
    const total = template.drills.length;
    const nextDrill = session.currentDrill;

    if (completed === total) {
      return `${completed} of ${total} drills completed`;
    }

    return nextDrill === null
      ? `${completed} of ${total} completed`
      : `${completed} of ${total} completed · Up next: ${nextDrill.title}`;
  });

  readonly drills = computed<TodayDrillView[]>(() => {
    const template = this.workoutTemplate();
    const session = this.session();

    if (template === null) {
      return [];
    }

    const completedDrillIds = new Set(
      session?.drills
        .filter((drill) => drill.state === 'completed')
        .map((drill) => drill.drill.id) ?? [],
    );
    const currentDrillIndex = session?.currentDrillIndex ?? null;

    return template.drills.map((drill, index) => ({
      number: index + 1,
      title: drill.title,
      meta: this.compactDrillMeta(drill),
      state: this.resolveDrillState(drill, index, completedDrillIds, currentDrillIndex),
    }));
  });

  readonly actionLabel = computed(() => {
    const pageState = this.pageState();

    if (pageState === 'finished-unsaved') {
      return 'Finish Workout';
    }

    if (pageState === 'in-progress') {
      return 'Resume Workout';
    }

    return 'Start Workout';
  });

  readonly actionLink = computed(() => {
    if (this.pageState() === 'finished-unsaved') {
      return '/workout-completion';
    }

    return '/active-workout';
  });

  private compactDrillMeta(drill: Drill): string | null {
    if (drill.prescription) {
      return drill.prescription;
    }

    return formatDrillMeta(drill);
  }

  private resolveDrillState(
    drill: Drill,
    drillIndex: number,
    completedDrillIds: Set<string>,
    currentDrillIndex: number | null,
  ): TodayDrillState {
    if (completedDrillIds.has(drill.id)) {
      return 'completed';
    }

    if (currentDrillIndex !== null && drillIndex === currentDrillIndex) {
      return 'next';
    }

    return 'pending';
  }
}
