import {
  Drill,
  WorkoutTemplate,
} from '../../curriculum/model/curriculum.model';
import { ActiveWorkoutClockPipe } from './active-workout-clock.pipe';
import { ActiveWorkoutCoreTechniquePipe } from './active-workout-core-technique.pipe';
import { ActiveWorkoutCurrentDrillTitlePipe } from './active-workout-current-drill-title.pipe';
import { ActiveWorkoutDrillActionIconPipe } from './active-workout-drill-action-icon.pipe';
import { ActiveWorkoutDrillActionLabelPipe } from './active-workout-drill-action-label.pipe';
import { ActiveWorkoutDrillMetaPipe } from './active-workout-drill-meta.pipe';
import { ActiveWorkoutDrillProgressPipe } from './active-workout-drill-progress.pipe';
import { ActiveWorkoutDrillStateLabelPipe } from './active-workout-drill-state-label.pipe';
import { ActiveWorkoutDrillStatePipe } from './active-workout-drill-state.pipe';
import { ActiveWorkoutDrillTypeLabelPipe } from './active-workout-drill-type-label.pipe';
import { ActiveWorkoutEquipmentPipe } from './active-workout-equipment.pipe';
import { ActiveWorkoutHasTimerPreviewPipe } from './active-workout-has-timer-preview.pipe';
import { ActiveWorkoutRestTextPipe } from './active-workout-rest-text.pipe';
import { ActiveWorkoutRestPipe } from './active-workout-rest.pipe';
import { ActiveWorkoutTimerClockPipe } from './active-workout-timer-clock.pipe';
import { ActiveWorkoutTimerLabelPipe } from './active-workout-timer-label.pipe';

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

  it('formats workout-level display values', () => {
    expect(new ActiveWorkoutEquipmentPipe().transform(workoutTemplate)).toBe(
      'Mat + Dummy',
    );
    expect(new ActiveWorkoutEquipmentPipe().transform(null)).toBe('');
    expect(new ActiveWorkoutRestPipe().transform(120)).toBe('2 min');
    expect(new ActiveWorkoutRestPipe().transform(45)).toBe('45 sec');
    expect(
      new ActiveWorkoutDrillProgressPipe().transform(workoutTemplate, 1),
    ).toBe('1 of 3 drills complete');
    expect(
      new ActiveWorkoutCurrentDrillTitlePipe().transform(workoutTemplate),
    ).toBe('Stance motion');
    expect(
      new ActiveWorkoutCurrentDrillTitlePipe().transform({
        ...workoutTemplate,
        drills: [],
      }),
    ).toBe('None');
  });

  it('formats drill state and type labels', () => {
    expect(new ActiveWorkoutDrillStatePipe().transform(0)).toBe('completed');
    expect(new ActiveWorkoutDrillStatePipe().transform(1)).toBe('current');
    expect(new ActiveWorkoutDrillStatePipe().transform(2)).toBe('queued');
    expect(new ActiveWorkoutDrillStateLabelPipe().transform(0)).toBe(
      'Complete',
    );
    expect(new ActiveWorkoutDrillStateLabelPipe().transform(1)).toBe('Current');
    expect(new ActiveWorkoutDrillStateLabelPipe().transform(2)).toBe('Queued');
    expect(new ActiveWorkoutDrillTypeLabelPipe().transform('reps')).toBe(
      'Reps',
    );
    expect(new ActiveWorkoutDrillTypeLabelPipe().transform('duration')).toBe(
      'Timed',
    );
    expect(new ActiveWorkoutDrillTypeLabelPipe().transform('rounds')).toBe(
      'Rounds',
    );
  });

  it('formats drill meta and core technique values', () => {
    expect(new ActiveWorkoutDrillMetaPipe().transform(repsDrill)).toBe(
      '3 sets x 10 reps',
    );
    expect(new ActiveWorkoutDrillMetaPipe().transform(durationDrill)).toBe(
      '3 min',
    );
    expect(new ActiveWorkoutDrillMetaPipe().transform(roundsDrill)).toBe(
      '3 rounds x 1 min with 30 sec rest',
    );
    expect(
      new ActiveWorkoutDrillMetaPipe().transform({
        id: 'cue-only',
        title: 'Cue only',
        type: 'reps',
        cue: 'Keep position.',
      }),
    ).toBeNull();
    expect(new ActiveWorkoutCoreTechniquePipe().transform(repsDrill)).toBe(
      'Level change drill',
    );
    expect(new ActiveWorkoutCoreTechniquePipe().transform(durationDrill)).toBe(
      'Stance and motion',
    );
  });

  it('formats timer and rest values', () => {
    expect(new ActiveWorkoutHasTimerPreviewPipe().transform(repsDrill)).toBe(
      false,
    );
    expect(
      new ActiveWorkoutHasTimerPreviewPipe().transform(durationDrill),
    ).toBe(true);
    expect(new ActiveWorkoutHasTimerPreviewPipe().transform(roundsDrill)).toBe(
      true,
    );
    expect(new ActiveWorkoutTimerLabelPipe().transform(durationDrill)).toBe(
      'Work timer',
    );
    expect(new ActiveWorkoutTimerLabelPipe().transform(roundsDrill)).toBe(
      'Round 1 of 3',
    );
    expect(new ActiveWorkoutTimerClockPipe().transform(durationDrill)).toBe(
      '3:00',
    );
    expect(new ActiveWorkoutTimerClockPipe().transform(roundsDrill)).toBe(
      '1:00',
    );
    expect(new ActiveWorkoutClockPipe().transform(30)).toBe('0:30');
    expect(new ActiveWorkoutClockPipe().transform(125)).toBe('2:05');
    expect(new ActiveWorkoutRestTextPipe().transform(repsDrill, 120)).toBe(
      '2 min default rest',
    );
    expect(new ActiveWorkoutRestTextPipe().transform(roundsDrill, 120)).toBe(
      '30 sec between rounds',
    );
  });

  it('formats drill action display values', () => {
    expect(new ActiveWorkoutDrillActionIconPipe().transform(repsDrill)).toBe(
      'checkmark-circle-outline',
    );
    expect(
      new ActiveWorkoutDrillActionIconPipe().transform(durationDrill),
    ).toBe('play-outline');
    expect(new ActiveWorkoutDrillActionLabelPipe().transform(repsDrill)).toBe(
      'Mark Complete',
    );
    expect(
      new ActiveWorkoutDrillActionLabelPipe().transform(durationDrill),
    ).toBe('Start');
  });
});
