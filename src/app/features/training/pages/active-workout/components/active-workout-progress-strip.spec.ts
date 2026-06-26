import { TestBed } from '@angular/core/testing';

import { WorkoutTemplate } from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutProgressStripComponent } from './active-workout-progress-strip';

describe('ActiveWorkoutProgressStripComponent', () => {
  const workoutTemplate: WorkoutTemplate = {
    id: 'template-active-workout',
    label: 'Workout B',
    title: 'Shot Entries',
    focus: 'Level change, clean entries, round pacing.',
    estimatedMinutes: {
      min: 25,
      max: 30,
    },
    equipment: ['Mat'],
    drills: [
      {
        id: 'level-change',
        title: 'Level change drill',
        type: 'reps',
        cue: 'Drop your hips and stay tall.',
        repsConfig: {
          sets: 3,
          reps: 10,
        },
      },
      {
        id: 'stance-motion',
        title: 'Stance motion',
        type: 'duration',
        cue: 'Small steps without crossing your feet.',
        durationConfig: {
          durationSeconds: 180,
        },
      },
      {
        id: 'shadow-shot-rounds',
        title: 'Shadow shot rounds',
        type: 'rounds',
        cue: 'Level change before every entry.',
        roundsConfig: {
          rounds: 3,
          roundSeconds: 60,
          restBetweenRoundsSeconds: 30,
        },
      },
    ],
  };

  const setup = async (completedDrillCount: number) => {
    await TestBed.configureTestingModule({
      imports: [ActiveWorkoutProgressStripComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ActiveWorkoutProgressStripComponent);

    fixture.componentRef.setInput('workoutTemplate', workoutTemplate);
    fixture.componentRef.setInput('completedDrillCount', completedDrillCount);
    fixture.componentRef.setInput('currentDrillTitle', 'Warm-up');
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders no progress fill when no drills are complete', async () => {
    const fixture = await setup(0);
    const progressFill = fixture.nativeElement.querySelector(
      '.track span',
    ) as HTMLSpanElement;

    expect(progressFill.style.width).toBe('0%');
  });

  it('renders progress fill based on completed drills', async () => {
    const fixture = await setup(1);
    const progressFill = fixture.nativeElement.querySelector(
      '.track span',
    ) as HTMLSpanElement;

    expect(Number.parseFloat(progressFill.style.width)).toBeCloseTo(
      33.3333,
      4,
    );
  });
});
