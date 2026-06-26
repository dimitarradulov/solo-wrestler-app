import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { InProgressWorkoutStore } from '../../in-progress-workout.store';
import { CurriculumStore } from '../curriculum/curriculum.store';
import { TodayPage } from './today';

describe('TodayPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();

  const currentWorkout = {
    id: 'phase-1-week-1-workout-a',
    weekNumber: 1,
    workoutTemplateId: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    status: 'current' as const,
  };

  const setup = async (
    inProgressWorkout: InProgressWorkoutStore['inProgressWorkout'],
    completedDrillCount = 0,
  ) => {
    await TestBed.configureTestingModule({
      imports: [TodayPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: CurriculumStore,
          useValue: {
            currentWorkout: signal(currentWorkout),
          },
        },
        {
          provide: InProgressWorkoutStore,
          useValue: {
            inProgressWorkout,
            hasInProgressWorkout: signal(inProgressWorkout() !== null),
            completedDrillCount: signal(completedDrillCount),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodayPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  it('shows the current workout with a start action when nothing is in progress', async () => {
    const fixture = await setup(signal(null));
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Workout A');
    expect(text).toContain('Mechanics');
    expect(text).toContain('Start Workout');
    expect(text).not.toContain('Resume Workout');
  });

  it('shows resume details when an in-progress workout exists', async () => {
    const fixture = await setup(
      signal({
        workoutId: currentWorkout.id,
        workoutTemplateId: currentWorkout.workoutTemplateId,
        workoutLabel: currentWorkout.label,
        workoutTitle: currentWorkout.title,
        weekNumber: currentWorkout.weekNumber,
        drillIds: ['warm-up', 'level-change-drill'],
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
      }),
      1,
    );
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Resume Workout');
    expect(text).toContain('Workout A');
    expect(text).toContain('1 drills complete');
    expect(text).not.toContain('Start Workout');
  });
});
