import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';

import { InProgressWorkout } from '../../models/training-session.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import { CurriculumStore } from '../../stores/curriculum.store';
import { InProgressWorkoutStore } from '../../stores/in-progress-workout.store';
import { WorkoutCompletionPage } from './workout-completion';

describe('WorkoutCompletionPage', () => {
  const completedWorkout: InProgressWorkout = {
    workoutId: 'phase-1-week-1-workout-a',
    workoutTemplateId: 'workout-template-a',
    workoutLabel: 'Workout A',
    workoutTitle: 'Mechanics',
    weekNumber: 1,
    drillIds: ['warm-up', 'level-change-drill'],
    completedDrillIds: ['warm-up', 'level-change-drill'],
    currentDrillIndex: 1,
    timer: {
      phase: 'complete',
      status: 'finished',
      remainingSeconds: 0,
      roundNumber: null,
      totalRounds: null,
    },
    restSeconds: 120,
  };

  const setup = async (
    inProgressWorkout = signal<InProgressWorkout | null>(completedWorkout),
  ) => {
    const appendEntry = vi.fn();
    const clear = vi.fn();
    const setWorkoutCompleted = vi.fn();
    const navigateByUrl = vi.fn();

    await TestBed.configureTestingModule({
      imports: [WorkoutCompletionPage],
      providers: [
        provideIonicAngular({}),
        {
          provide: InProgressWorkoutStore,
          useValue: {
            inProgressWorkout,
            clear,
          },
        },
        {
          provide: CompletedWorkoutLogStore,
          useValue: {
            appendEntry,
          },
        },
        {
          provide: CurriculumStore,
          useValue: {
            setWorkoutCompleted,
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WorkoutCompletionPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      appendEntry,
      clear,
      navigateByUrl,
      setWorkoutCompleted,
    };
  };

  it('requires a difficulty selection before enabling save workout', async () => {
    const { fixture } = await setup();
    const saveButton = fixture.nativeElement.querySelector(
      '[data-testid="save-workout"]',
    ) as HTMLButtonElement | null;

    expect(saveButton).not.toBeNull();
    expect(saveButton?.disabled).toBe(true);
  });

  it('routes back to active workout when the workout is not fully completed', async () => {
    const { navigateByUrl } = await setup(
      signal<InProgressWorkout | null>({
        ...completedWorkout,
        completedDrillIds: ['warm-up'],
      }),
    );

    expect(navigateByUrl).toHaveBeenCalledWith('/active-workout');
  });

  it('saves the completed workout, clears in-progress state, and returns to today', async () => {
    const { appendEntry, clear, fixture, navigateByUrl, setWorkoutCompleted } =
      await setup();
    const difficultyButton = fixture.nativeElement.querySelector(
      '[data-testid="difficulty-good"]',
    ) as HTMLButtonElement;
    const noteField = fixture.nativeElement.querySelector(
      '#completion-note',
    ) as HTMLTextAreaElement;
    const saveButton = fixture.nativeElement.querySelector(
      '[data-testid="save-workout"]',
    ) as HTMLButtonElement;

    difficultyButton.click();
    noteField.value = 'Stayed consistent through the rounds.';
    noteField.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    saveButton.click();

    expect(appendEntry).toHaveBeenCalledTimes(1);
    expect(appendEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        workoutId: 'phase-1-week-1-workout-a',
        difficulty: 'good',
        note: 'Stayed consistent through the rounds.',
        completedDrillIds: ['warm-up', 'level-change-drill'],
      }),
    );
    expect(setWorkoutCompleted).toHaveBeenCalledWith(
      'phase-1-week-1-workout-a',
      true,
    );
    expect(clear).toHaveBeenCalledTimes(1);
    expect(navigateByUrl).toHaveBeenCalledWith('/tabs/today');
  });
});
