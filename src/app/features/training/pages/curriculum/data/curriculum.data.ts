import {
  CurriculumPhase,
  FutureCurriculumPhase,
} from '../model/curriculum.model';

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    meta: '6 weeks · 2 workouts/week · 12 total workouts',
    weeks: [
      {
        number: 1,
        workouts: [
          {
            id: 'phase-1-week-1-workout-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'current',
          },
          {
            id: 'phase-1-week-1-workout-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 2,
        workouts: [
          {
            id: 'phase-1-week-2-workout-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-2-workout-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 3,
        workouts: [
          {
            id: 'phase-1-week-3-workout-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-3-workout-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 4,
        workouts: [
          {
            id: 'phase-1-week-4-workout-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-4-workout-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 5,
        workouts: [
          {
            id: 'phase-1-week-5-workout-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-5-workout-b',
            label: 'Workout B',
            title: 'Application',
            status: 'locked',
          },
        ],
      },
      {
        number: 6,
        workouts: [
          {
            id: 'phase-1-week-6-workout-a',
            label: 'Workout A',
            title: 'Mechanics',
            status: 'locked',
          },
          {
            id: 'phase-1-week-6-workout-b',
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
