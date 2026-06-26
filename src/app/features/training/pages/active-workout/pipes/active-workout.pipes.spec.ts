import {
  Drill,
  WorkoutTemplate,
} from '../../../models/curriculum.model';
import { ActiveWorkoutClockPipe } from './active-workout-clock.pipe';
import { ActiveWorkoutDrillProgressPipe } from './active-workout-drill-progress.pipe';

describe('active workout pipes', () => {
  const repsDrill: Drill = {
    id: 'level-change',
    title: 'Level change drill',
    type: 'reps',
    prescription: '3 sets x 10 reps',
    cue: 'Drop your hips and stay tall.',
    repsConfig: {
      sets: 3,
      reps: 10,
    },
  };

  const durationDrill: Drill = {
    id: 'stance-motion',
    title: 'Stance motion',
    type: 'duration',
    cue: 'Small steps without crossing your feet.',
    coreTechnique: 'Stance and motion',
    durationConfig: {
      durationSeconds: 180,
    },
  };

  const roundsDrill: Drill = {
    id: 'shadow-shot-rounds',
    title: 'Shadow shot rounds',
    type: 'rounds',
    cue: 'Level change before every entry.',
    roundsConfig: {
      rounds: 3,
      roundSeconds: 60,
      restBetweenRoundsSeconds: 30,
    },
  };

  const workoutTemplate: WorkoutTemplate = {
    id: 'template-active-workout',
    label: 'Workout B',
    title: 'Shot Entries',
    focus: 'Level change, clean entries, round pacing.',
    estimatedMinutes: {
      min: 25,
      max: 30,
    },
    equipment: ['Mat', 'Dummy'],
    drills: [repsDrill, durationDrill, roundsDrill],
  };

  it('formats drill progress text', () => {
    expect(
      new ActiveWorkoutDrillProgressPipe().transform(workoutTemplate, 1),
    ).toBe('1 of 3 drills complete');
  });

  it('formats clock values', () => {
    expect(new ActiveWorkoutClockPipe().transform(30)).toBe('0:30');
    expect(new ActiveWorkoutClockPipe().transform(125)).toBe('2:05');
  });
});
