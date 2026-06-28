import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { CurriculumStore } from '../../stores/curriculum.store';
import { InProgressWorkoutStore } from '../../stores/in-progress-workout.store';
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import { TodayPage } from './today';
import {
  CurriculumPhase,
  WorkoutInstance,
  WorkoutTemplate,
} from '../../models/curriculum.model';
import { InProgressWorkout } from '../../models/training-session.model';
import { curriculumPhases } from '../../data/curriculum.data';

interface SetupStores {
  inProgressWorkout: InProgressWorkout | null;
  curriculumCompletionOverride?: number;
}

describe('TodayPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();

  const currentWorkoutTemplate: WorkoutTemplate = {
    id: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    focus: 'Stance, motion, level change, penetration step, shadow double leg, dummy finish.',
    estimatedMinutes: { min: 35, max: 45 },
    equipment: ['Mat', 'Wrestling dummy'],
    drills: [
      {
        id: 'warm-up',
        title: 'Warm-up',
        type: 'duration',
        cue: 'Move easy. Protect your neck.',
        estimatedDuration: { seconds: 300 },
        durationConfig: { durationSeconds: 300 },
      },
      {
        id: 'level-change-drill',
        title: 'Level change drill',
        type: 'reps',
        prescription: '3 sets x 10 reps',
        cue: 'Drop your hips. Stay tall.',
        estimatedDuration: { seconds: 300 },
        repsConfig: { sets: 3, reps: 10 },
      },
      {
        id: 'stance-and-motion',
        title: 'Stance and motion',
        type: 'duration',
        cue: 'Small steps. Do not cross your feet.',
        estimatedDuration: { seconds: 300 },
        durationConfig: { durationSeconds: 300 },
      },
      {
        id: 'penetration-step-drill',
        title: 'Penetration step drill',
        type: 'reps',
        prescription: '5 sets x 10 reps',
        cue: 'Step deep. Stay tall.',
        estimatedDuration: { seconds: 600 },
        repsConfig: { sets: 5, reps: 10 },
      },
      {
        id: 'shadow-double-leg',
        title: 'Shadow double leg',
        type: 'rounds',
        cue: 'Level change first. Head up.',
        estimatedDuration: { seconds: 420 },
        roundsConfig: {
          rounds: 5,
          roundSeconds: 60,
          restBetweenRoundsSeconds: 30,
        },
      },
      {
        id: 'dummy-finish',
        title: 'Dummy finish',
        type: 'duration',
        cue: 'Land safely on top.',
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
      },
    ],
  };

  const orderedWorkouts: WorkoutInstance[] = [];

  for (const phase of curriculumPhases) {
    for (const week of phase.weeks) {
      for (const workout of week.workouts) {
        orderedWorkouts.push(workout);
      }
    }
  }

  const currentWorkout: WorkoutInstance = orderedWorkouts[0] ?? {
    id: 'phase-1-week-1-workout-a',
    weekNumber: 1,
    workoutTemplateId: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    status: 'current',
  };

  const progressionFocus = 'Slow mechanics only. Make every rep clean.';

  const currentPhase: CurriculumPhase = {
    ...curriculumPhases[0]!,
    weeks: curriculumPhases[0]!.weeks.map((week) =>
      week.number === 1
        ? { ...week, progressionFocus }
        : { ...week, progressionFocus: week.progressionFocus },
    ),
  };

  const makeWorkoutSessionStore = (
    inProgressWorkout: InProgressWorkout | null,
  ) => {
    const currentWorkoutSignal = signal(currentWorkout);
    const inProgressWorkoutSignal = signal(inProgressWorkout);
    const currentWorkoutTemplateSignal = signal(currentWorkoutTemplate);

    return {
      currentWorkout: currentWorkoutSignal,
      currentWorkoutTemplate: currentWorkoutTemplateSignal,
      inProgressWorkout: inProgressWorkoutSignal,
      completedDrillCount: signal(
        inProgressWorkout?.completedDrillIds.length ?? 0,
      ),
      currentDrillTitle: signal(
        inProgressWorkout === null
          ? currentWorkoutTemplate.drills[0]?.title ?? 'None'
          : currentWorkoutTemplate.drills[inProgressWorkout.currentDrillIndex]
              ?.title ?? 'None',
      ),
      progressionFocus: signal(progressionFocus),
      phaseTitle: signal('Phase 1: Foundations'),
      estimatedMinutes: signal('35-45 min'),
      canFinishWorkout: signal(
        inProgressWorkout !== null &&
          inProgressWorkout.completedDrillIds.length ===
            currentWorkoutTemplate.drills.length,
      ),
    };
  };

  const makeCurriculumStore = (curriculumCompletionOverride?: number) => {
    const completedCount = curriculumCompletionOverride ?? 0;
    const completedIds = orderedWorkouts
      .slice(0, completedCount)
      .map((workout) => workout.id);

    return {
      currentWorkout: signal(
        curriculumCompletionOverride === orderedWorkouts.length
          ? null
          : orderedWorkouts[curriculumCompletionOverride ?? 0] ?? null,
      ),
      currentWorkoutTemplate: signal(currentWorkoutTemplate),
      totalWorkoutCount: signal(orderedWorkouts.length),
      currentWorkoutSequenceNumber: signal(
        (curriculumCompletionOverride ?? 0) + 1,
      ),
      getWorkoutSequenceNumber: (workoutId: string) => {
        const index = orderedWorkouts.findIndex(
          (workout) => workout.id === workoutId,
        );

        return index === -1 ? null : index + 1;
      },
      currentPhase: signal(
        curriculumCompletionOverride === orderedWorkouts.length
          ? currentPhase
          : currentPhase,
      ),
      completedWorkoutIds: signal(completedIds),
      phases: signal([currentPhase]),
    };
  };

  const setup = async (stores: SetupStores) => {
    const { inProgressWorkout, curriculumCompletionOverride } = stores;

    await TestBed.configureTestingModule({
      imports: [TodayPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: CurriculumStore,
          useValue: makeCurriculumStore(curriculumCompletionOverride),
        },
        {
          provide: InProgressWorkoutStore,
          useValue: {
            inProgressWorkout: signal(inProgressWorkout),
            hasInProgressWorkout: signal(inProgressWorkout !== null),
            completedDrillCount: signal(
              inProgressWorkout?.completedDrillIds.length ?? 0,
            ),
          },
        },
        {
          provide: WorkoutSessionStore,
          useValue: makeWorkoutSessionStore(inProgressWorkout),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodayPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  it('shows the available workout briefing with a start action', async () => {
    const fixture = await setup({ inProgressWorkout: null });
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Today');
    expect(text).toContain('Week 1 · Workout 1 of 12');
    expect(text).toContain('Workout A: Mechanics');
    expect(text).toContain('35-45 min');
    expect(text).toContain('6 drills');
    expect(text).toContain('Mat + Wrestling dummy');
    expect(text).toContain('This week');
    expect(text).toContain('Slow mechanics only. Make every rep clean.');
    expect(text).toContain('Start Workout');
    expect(text).not.toContain('Resume Workout');
    expect(text).not.toContain('Finish Workout');

    const drillTitles = [
      'Warm-up',
      'Level change drill',
      'Stance and motion',
      'Penetration step drill',
      'Shadow double leg',
      'Dummy finish',
    ];

    for (const title of drillTitles) {
      expect(text).toContain(title);
    }

    expect(text).toContain('3 sets x 10 reps');
    expect(text).toContain('5 min');
  });

  it('shows resume state with next drill highlighted', async () => {
    const fixture = await setup({
      inProgressWorkout: {
        workoutId: currentWorkout.id,
        workoutTemplateId: currentWorkout.workoutTemplateId,
        workoutLabel: currentWorkout.label,
        workoutTitle: currentWorkout.title,
        weekNumber: currentWorkout.weekNumber,
        drillIds: currentWorkoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: ['warm-up'],
        currentDrillIndex: 1,
        timer: {
          phase: 'idle',
          status: 'stopped',
          remainingSeconds: null,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      } as InProgressWorkout,
    });
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Today');
    expect(text).toContain('Week 1 · Workout 1 of 12');
    expect(text).toContain('Workout A: Mechanics');
    expect(text).toContain('1 of 6 completed · Up next: Level change drill');
    expect(text).not.toContain('35-45 min');
    expect(text).not.toContain('Mat + Wrestling dummy');
    expect(text).toContain('Resume Workout');
    expect(text).not.toContain('Start Workout');
    expect(text).not.toContain('This week');

    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('.today-drill'),
    ) as HTMLElement[];

    expect(rows.length).toBe(6);
    expect(rows[0].classList.contains('today-drill--completed')).toBe(true);
    expect(rows[1].classList.contains('today-drill--next')).toBe(true);
    expect(rows[2].classList.contains('today-drill--pending')).toBe(true);
  });

  it('shows finish action when all drills are complete but not saved', async () => {
    const fixture = await setup({
      inProgressWorkout: {
        workoutId: currentWorkout.id,
        workoutTemplateId: currentWorkout.workoutTemplateId,
        workoutLabel: currentWorkout.label,
        workoutTitle: currentWorkout.title,
        weekNumber: currentWorkout.weekNumber,
        drillIds: currentWorkoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: currentWorkoutTemplate.drills.map((drill) => drill.id),
        currentDrillIndex: currentWorkoutTemplate.drills.length - 1,
        timer: {
          phase: 'complete',
          status: 'finished',
          remainingSeconds: 0,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      } as InProgressWorkout,
    });
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Workout A: Mechanics');
    expect(text).toContain('6 of 6 drills completed');
    expect(text).toContain('Finish Workout');
    expect(text).not.toContain('Resume Workout');
    expect(text).not.toContain('Start Workout');

    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('.today-drill'),
    ) as HTMLElement[];

    expect(
      rows.every((row) => row.classList.contains('today-drill--completed')),
    ).toBe(true);
  });

  it('shows curriculum-complete state with progress and curriculum actions', async () => {
    const fixture = await setup({
      inProgressWorkout: null,
      curriculumCompletionOverride: orderedWorkouts.length,
    });
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Phase 1 complete');
    expect(text).toContain('You completed all 12 workouts.');
    expect(text).toContain('View Progress');
    expect(text).toContain('Review Curriculum');
    expect(text).not.toContain('Start Workout');
    expect(text).not.toContain('Resume Workout');
  });
});
