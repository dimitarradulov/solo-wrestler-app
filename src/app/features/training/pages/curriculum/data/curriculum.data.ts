import {
  AppWorkoutConfig,
  CurriculumPhase,
  FutureCurriculumPhase,
  DEFAULT_REST_SECONDS,
  WorkoutTemplate,
} from '../model/curriculum.model';

export const appWorkoutConfig: AppWorkoutConfig = {
  defaultRestSeconds: DEFAULT_REST_SECONDS,
};

const phaseOneWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'workout-template-a',
    label: 'Workout A',
    title: 'Mechanics',
    focus:
      'Stance, motion, level change, penetration step, shadow double leg, dummy finish.',
    estimatedMinutes: {
      min: 35,
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
          'Low-impact sprawls.',
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
        id: 'level-change-drill',
        title: 'Level change drill',
        type: 'reps',
        prescription: '3 sets x 10 reps',
        cue: 'Drop your hips. Stay tall.',
        videoUrl: 'https://www.youtube.com/watch?v=3fAryvfNF8U',
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
      'Boxing-to-shot entry, double leg on dummy, safe finish, self-defense exit.',
    estimatedMinutes: {
      min: 35,
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
          'Low-impact sprawls.',
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
        id: 'boxing-to-shot-entry',
        title: 'Boxing-to-shot entry',
        type: 'duration',
        cue: 'Enter safely behind your hands.',
        optionInstruction:
          'Practice simple entries. Keep the strike as a distraction, not a combination.',
        options: [
          'Jab feint -> level change -> double leg',
          'Jab-cross cover -> step in -> double leg',
          'Hands high shell -> level change -> double leg',
        ],
        details: ['No fancy combinations.'],
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
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
        id: 'self-defense-exit-drill',
        title: 'Self-defense exit drill',
        type: 'duration',
        cue: 'Finish safe, then leave or control.',
        optionInstruction: 'Choose one exit and practice that.',
        options: [
          'Land on top -> hands posted -> stand up and back away.',
          'Land on top -> knee on belly or control for 2 seconds -> disengage.',
          'Land on top -> move to safe side control position for BJJ.',
        ],
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
      },
    ],
  },
];

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    description:
      'Phase 1 builds the base for a safe, controlled double-leg takedown: stance, motion, level change, penetration step, double-leg entry, finish, and safe disengagement.',
    principle:
      'Enter safely, change levels, keep posture, control both legs, turn the corner, finish on top.',
    meta: '6 weeks · 2 workouts/week · 12 total workouts',
    workoutTemplates: phaseOneWorkoutTemplates,
    weeks: [
      {
        number: 1,
        progressionFocus: 'Slow mechanics only. Make every rep clean.',
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
        progressionFocus: 'Slow mechanics only. Make every rep clean.',
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
          'Add boxing feints and faster entries. No wild blasting.',
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
          'Add boxing feints and faster entries. No wild blasting.',
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
          'Start from movement, finish quickly, then disengage.',
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
          'Start from movement, finish quickly, then disengage.',
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
