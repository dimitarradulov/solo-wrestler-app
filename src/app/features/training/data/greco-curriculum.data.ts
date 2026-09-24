import { CurriculumPhase, WorkoutTemplate } from '../models/curriculum.model';

const grecoPositionAndMovement: WorkoutTemplate = {
  id: 'greco-workout-template-a',
  label: 'Workout A',
  title: 'Position and Movement',
  focus:
    'Build a balanced Greco-Roman stance, move with controlled posture, and rehearse contact positions without live pummeling.',
  estimatedMinutes: { min: 60, max: 60 },
  equipment: ['Mat', 'Suples Power dummy (30 kg with arms)'],
  drills: [
    {
      id: 'greco-warm-up',
      title: 'Warm-up and movement preparation',
      type: 'duration',
      prescription: '10-minute warm-up block at an easy pace',
      cue: 'Warm up gradually and keep your head up.',
      details: [
        'Move lightly around the mat.',
        'Circle your hips and shoulders.',
        'Add easy squats and relaxed stance changes.',
      ],
      estimatedDuration: { seconds: 600 },
      durationConfig: { durationSeconds: 600 },
    },
    {
      id: 'greco-stance-and-motion',
      title: 'Greco-Roman stance, motion, and defensive posture',
      type: 'duration',
      prescription: '15-minute block: 13 minutes of posture and footwork plus the 2-minute Rest after warm-up',
      cue: 'Stay balanced, keep your elbows in, and recover to stance.',
      videoUrl: 'https://www.youtube.com/watch?v=YcC4_soKqbs',
      videoNote:
        'USA Wrestling labels this “Greco-Roman Stance.” Playback was unavailable during review; use it only for stance reference. The solo footwork and posture cues here are an adaptation.',
      details: [
        'Move forward, backward, and laterally without crossing your feet.',
        'Circle while keeping your chest upright and elbows close.',
        'Rehearse a compact defensive posture, then return to neutral stance.',
        'Take short recovery periods within the timed practice.',
      ],
      estimatedDuration: { seconds: 780 },
      durationConfig: { durationSeconds: 780 },
    },
    {
      id: 'greco-contact-and-grip-preparation',
      title: 'Contact and grip preparation',
      type: 'duration',
      prescription: '20-minute block: 18 minutes of slow grip-position rehearsal plus the 2-minute Rest after movement practice',
      cue: 'Place your hands deliberately; a dummy cannot pummel or resist.',
      videoUrl: 'https://www.youtube.com/watch?v=fIa9GQrjBBk',
      videoNote:
        'USA Wrestling labels this demonstration “Single Underhook.” Playback was unavailable during review. Rehearse hand placement on the supported dummy only; this does not teach live hand-fighting or establish control against resistance.',
      details: [
        'Keep the dummy supported on the mat before making contact.',
        'Rehearse reaching for an underhook position without wrenching the arm or shoulder.',
        'Practice a relaxed inside-hand position and safe head placement beside the dummy.',
        'Reset to stance between repetitions; do not lift or throw the dummy.',
      ],
      estimatedDuration: { seconds: 1080 },
      durationConfig: { durationSeconds: 1080 },
    },
    {
      id: 'greco-controlled-slide-by-entry',
      title: 'Controlled slide-by entry rehearsal',
      type: 'duration',
      prescription: '10-minute block: 8 minutes of connected position rehearsal plus the 2-minute Rest after focused technique',
      cue: 'Rehearse the arm path and angle, then stop in rear control without a finish.',
      videoUrl: 'https://www.youtube.com/watch?v=Ql3wXPoGkJA',
      videoNote:
        'USA Wrestling labels this demonstration “Slide by.” Playback was unavailable during review. The solo drill rehearses an entry path around a grounded, supported dummy and stops at rear control; it is not live hand-fighting or a throw.',
      details: [
        'Set the dummy securely on the mat; do not assume it can stand unsupported.',
        'Begin from a rehearsed underhook position and guide the near arm across without force.',
        'Step to the outside angle and circle to a balanced rear-control position.',
        'Stop, release safely, and reset the dummy before the next repetition.',
        'Do not lift, throw, or fall over the dummy.',
      ],
      estimatedDuration: { seconds: 480 },
      durationConfig: { durationSeconds: 480 },
    },
    {
      id: 'greco-cooldown',
      title: 'Cooldown',
      type: 'duration',
      prescription: '5-minute block: 3 minutes of cooldown plus the 2-minute Rest after connected practice',
      cue: 'Slow down gradually and keep your neck relaxed.',
      details: ['Walk easily around the mat.', 'Breathe slowly and comfortably.'],
      estimatedDuration: { seconds: 180 },
      durationConfig: { durationSeconds: 180 },
    },
  ],
};

export const grecoCurriculumPhases: CurriculumPhase[] = [
  {
    id: 'greco-phase-1',
    title: 'Phase 1: Foundations',
    description:
      'Greco-Roman Foundations begins with Position and Movement. Solo dummy drills are preparation and positional rehearsal; they do not replace live hand-fighting or partner defense.',
    principle:
      'Move in balance, prepare upper-body positions, and rehearse entries under control.',
    meta: 'Greco-Roman · Position and Movement · 60 min',
    workoutTemplates: [grecoPositionAndMovement],
    weeks: [
      {
        number: 1,
        progressionFocus:
          'Week 1: Learn individual positions and slow movement mechanics. Keep every dummy contact controlled.',
        workouts: [
          {
            id: 'greco-phase-1-week-1-workout-a',
            weekNumber: 1,
            workoutTemplateId: grecoPositionAndMovement.id,
            label: 'Workout A',
            title: grecoPositionAndMovement.title,
            status: 'current',
          },
        ],
      },
    ],
  },
];
