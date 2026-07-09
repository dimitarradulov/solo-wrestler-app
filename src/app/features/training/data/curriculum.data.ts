import {
  AppWorkoutConfig,
  CurriculumPhase,
  FutureCurriculumPhase,
  DEFAULT_REST_SECONDS,
  WorkoutTemplate,
} from '../models/curriculum.model';

export const appWorkoutConfig: AppWorkoutConfig = {
  defaultRestSeconds: DEFAULT_REST_SECONDS,
};

const phaseOneWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    focus:
      'Stance, motion, level change, penetration step, down-block, shadow double leg, dummy finish.',
    estimatedMinutes: {
      min: 45,
      max: 45,
    },
    equipment: ['Mat', 'Wrestling dummy'],
    drills: [
      {
        id: 'warm-up',
        title: 'Warm-up',
        type: 'duration',
        cue: 'Move easy. Protect your neck.',
        details: [
          'Light bouncing.',
          'Hip circles.',
          'Bodyweight squats.',
          'Shoulder rolls.',
        ],
        estimatedDuration: { seconds: 300 },
        durationConfig: { durationSeconds: 300 },
      },
      {
        id: 'stance-and-motion',
        title: 'Stance and motion',
        type: 'duration',
        cue: 'Small steps. Do not cross your feet.',
        videoUrl: 'https://www.youtube.com/watch?v=crvfcKsaN0g',
        details: [
          'Move forward, backward, left, and right in stance.',
          'Take small steps.',
          'Do not cross your feet.',
        ],
        estimatedDuration: { seconds: 300 },
        durationConfig: { durationSeconds: 300 },
      },
      {
        id: 'down-block',
        title: 'Down-block',
        type: 'reps',
        prescription: '3 sets × 10 reps',
        cue: 'Hands first. Hips back. Return to stance.',
        videoUrl: 'https://www.youtube.com/watch?v=1gk5t5Kqc8w',
        details: [
          'Start in stance.',
          'Block down as you pull your lead leg away.',
          'Keep your head and chest up.',
          'Re-square and return to stance.',
        ],
        estimatedDuration: { seconds: 180 },
        repsConfig: { sets: 3, reps: 10 },
      },
      {
        id: 'level-change-drill',
        title: 'Level change drill',
        type: 'reps',
        prescription: '3 sets x 10 reps',
        cue: 'Drop your hips. Stay tall.',
        videoUrl: 'https://www.youtube.com/shorts/OSwgMe_1glk',
        estimatedDuration: { seconds: 300 },
        repsConfig: {
          sets: 3,
          reps: 10,
        },
      },
      {
        id: 'penetration-step-drill',
        title: 'Penetration step drill',
        type: 'reps',
        prescription: '5 sets x 10 reps',
        cue: 'Step deep. Stay tall.',
        videoUrl: 'https://www.youtube.com/watch?v=3fAryvfNF8U',
        details: ['Step.', 'Knee touch.', 'Trail leg up.', 'Posture tall.'],
        estimatedDuration: { seconds: 600 },
        repsConfig: {
          sets: 5,
          reps: 10,
        },
      },
      {
        id: 'shadow-double-leg',
        title: 'Shadow double leg',
        type: 'rounds',
        cue: 'Level change first. Head up.',
        videoUrl: 'https://www.youtube.com/watch?v=8FyeXO4rviw',
        details: [
          'Move around the mat.',
          'Feint with your hands.',
          'Level change.',
          'Penetration step.',
          'Finish by turning the corner.',
        ],
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
        videoUrl: 'https://www.youtube.com/watch?v=8FyeXO4rviw',
        details: [
          'Start with the dummy already low or leaning.',
          'Connect your shoulder to the dummy.',
          'Wrap both legs or the body.',
          'Turn the corner.',
          'Land safely on top.',
        ],
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
      },
    ],
  },
  {
    id: 'workout-template-b',
    label: 'Workout B',
    title: 'Application',
    focus:
      'Entry from motion, shadow double leg, double leg on dummy, sprawl, return to stance.',
    estimatedMinutes: {
      min: 37,
      max: 37,
    },
    equipment: ['Mat', 'Wrestling dummy'],
    drills: [
      {
        id: 'warm-up',
        title: 'Warm-up',
        type: 'duration',
        cue: 'Move easy. Protect your neck.',
        details: [
          'Light bouncing.',
          'Hip circles.',
          'Bodyweight squats.',
          'Shoulder rolls.',
        ],
        estimatedDuration: { seconds: 300 },
        durationConfig: { durationSeconds: 300 },
      },
      {
        id: 'stance-and-entry',
        title: 'Stance and entry',
        type: 'duration',
        cue: 'Level change suddenly.',
        videoUrl: 'https://www.youtube.com/watch?v=6Ao2yUZolSA',
        details: ['Move in stance.', 'Then suddenly level change.'],
        estimatedDuration: { seconds: 300 },
        durationConfig: { durationSeconds: 300 },
      },
      {
        id: 'shadow-double-leg',
        title: 'Shadow double leg',
        type: 'rounds',
        cue: 'Level change first. Head up.',
        videoUrl: 'https://www.youtube.com/watch?v=8FyeXO4rviw',
        details: [
          'Move around the mat.',
          'Feint with your hands.',
          'Level change.',
          'Penetration step.',
          'Finish by turning the corner.',
        ],
        estimatedDuration: { seconds: 420 },
        roundsConfig: {
          rounds: 5,
          roundSeconds: 60,
          restBetweenRoundsSeconds: 30,
        },
      },
      {
        id: 'double-leg-on-dummy',
        title: 'Double leg on dummy',
        type: 'reps',
        prescription: '20 clean reps',
        cue: 'Quality over speed.',
        videoUrl: 'https://www.youtube.com/watch?v=8FyeXO4rviw',
        details: [
          'Head up.',
          'Hips under you.',
          'Control both legs or the body.',
          'Turn the corner.',
          'Finish on top.',
        ],
        estimatedDuration: { seconds: 900 },
        repsConfig: {
          reps: 20,
        },
      },
      {
        id: 'sprawl-and-return-to-stance',
        title: 'Sprawl and return to stance',
        type: 'reps',
        prescription: '3 sets × 5 reps',
        cue: 'Legs back. Hips down. Chest up.',
        videoUrl: 'https://www.youtube.com/watch?v=pfNtYzw97Ew',
        videoNote:
          'Focus on the sprawl mechanics. The video continues into a go-behind, which is outside this phase.',
        details: [
          'Start in stance.',
          'Block down and kick both legs back.',
          'Drive your hips down without landing on your knees.',
          'Re-square and return to stance.',
        ],
        estimatedDuration: { seconds: 300 },
        repsConfig: { sets: 3, reps: 5 },
      },
    ],
  },
];

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    description:
      'Phase 1 builds balanced neutral foundations for folkstyle and freestyle wrestling: stance and motion, the double-leg attack, down-blocking, sprawling, and returning to stance.',
    principle:
      'Move in stance, attack with clean mechanics, defend in layers, and return to position.',
    meta: '6 weeks · 2 workouts/week · 12 total workouts',
    workoutTemplates: phaseOneWorkoutTemplates,
    weeks: [
      {
        number: 1,
        progressionFocus:
          'Slow mechanics only. Make every offensive and defensive rep clean.',
        workouts: [
          {
            id: 'phase-1-week-1-workout-a',
            weekNumber: 1,
            workoutTemplateId: 'workout-template-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'current',
          },
          {
            id: 'phase-1-week-1-workout-b',
            weekNumber: 1,
            workoutTemplateId: 'workout-template-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 2,
        progressionFocus:
          'Slow mechanics only. Make every offensive and defensive rep clean.',
        workouts: [
          {
            id: 'phase-1-week-2-workout-a',
            weekNumber: 2,
            workoutTemplateId: 'workout-template-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-2-workout-b',
            weekNumber: 2,
            workoutTemplateId: 'workout-template-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 3,
        progressionFocus:
          'Start every rep from stance and motion. Connect each movement without rushing.',
        workouts: [
          {
            id: 'phase-1-week-3-workout-a',
            weekNumber: 3,
            workoutTemplateId: 'workout-template-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-3-workout-b',
            weekNumber: 3,
            workoutTemplateId: 'workout-template-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 4,
        progressionFocus:
          'Start every rep from stance and motion. Connect each movement without rushing.',
        workouts: [
          {
            id: 'phase-1-week-4-workout-a',
            weekNumber: 4,
            workoutTemplateId: 'workout-template-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-4-workout-b',
            weekNumber: 4,
            workoutTemplateId: 'workout-template-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 5,
        progressionFocus:
          'Increase pace with control. Finish each rep in a strong position.',
        workouts: [
          {
            id: 'phase-1-week-5-workout-a',
            weekNumber: 5,
            workoutTemplateId: 'workout-template-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-5-workout-b',
            weekNumber: 5,
            workoutTemplateId: 'workout-template-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 6,
        progressionFocus:
          'Increase pace with control. Finish each rep in a strong position.',
        workouts: [
          {
            id: 'phase-1-week-6-workout-a',
            weekNumber: 6,
            workoutTemplateId: 'workout-template-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-6-workout-b',
            weekNumber: 6,
            workoutTemplateId: 'workout-template-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
    ],
  },
];

export const futureCurriculumPhases: FutureCurriculumPhase[] = [
  {
    id: 'phase-2',
    title: 'Phase 2',
    status: 'locked',
    statusText: 'Coming Soon',
  },
];
