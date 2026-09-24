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
    title: 'Movement and Entry Mechanics',
    focus:
      'Stance, footwork, level changes, double-leg entries, and returning to neutral defense.',
    estimatedMinutes: { min: 60, max: 60 },
    equipment: ['Mat', 'Wrestling dummy'],
    drills: [
      {
        id: 'warm-up',
        title: 'Warm-up and movement preparation',
        type: 'duration',
        prescription: '10 minutes at an easy pace',
        cue: 'Warm up gradually and keep your head up.',
        details: [
          'Move lightly around the mat.',
          'Circle your hips and shoulders.',
          'Add easy squats and stance changes.',
        ],
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
      },
      {
        id: 'stance-footwork-and-defense',
        title: 'Stance, footwork, and defensive posture',
        type: 'duration',
        prescription: '13 minutes: forward, backward, lateral, down-block, sprawl, re-square',
        cue: 'Keep a balanced base and return to stance after each defense.',
        videoUrl: 'https://www.youtube.com/watch?v=mM_WEslbOWE',
        videoNote:
          'USA Wrestling labels this demonstration “Freestyle Stance.” The video could not be independently viewed during content review; confirm that its footwork matches this drill.',
        details: [
          'Move forward, backward, and laterally without crossing your feet.',
          'Practice a controlled level change while staying balanced.',
          'Rehearse down-blocking and sprawling without an opponent.',
          'Re-square and return to a safe neutral stance after each defense.',
        ],
        estimatedDuration: { seconds: 780 },
        durationConfig: { durationSeconds: 780 },
      },
      {
        id: 'double-leg-entry-mechanics',
        title: 'Double-leg entry mechanics',
        type: 'duration',
        prescription: '18 minutes of slow, controlled entries with brief self-paced recovery',
        cue: 'Change levels before stepping in; keep your head and chest up.',
        videoUrl: 'https://www.youtube.com/watch?v=4A2OiHUSbsA',
        videoNote:
          'USA Wrestling labels this demonstration “Blast double leg.” The video could not be independently viewed during content review; use only the entry mechanics that match this drill.',
        details: [
          'Begin in stance and motion.',
          'Change levels before the penetration step.',
          'Step between the feet and bring the trail leg forward.',
          'Pause in a balanced position, then recover to stance.',
          'Take short recovery periods as needed within the timed practice.',
        ],
        estimatedDuration: { seconds: 1080 },
        durationConfig: { durationSeconds: 1080 },
      },
      {
        id: 'movement-to-double-leg-entry',
        title: 'Movement to separate double-leg entry',
        type: 'duration',
        prescription: '8 minutes of controlled movement-to-entry sequences',
        cue: 'Finish the defensive action in stance before starting a new entry.',
        details: [
          'Move in stance for several steps.',
          'Rehearse a down-block or sprawl and re-square to neutral.',
          'Pause in stance, then begin a separate double-leg entry.',
          'Recover safely without driving into or falling over the dummy.',
        ],
        estimatedDuration: { seconds: 480 },
        durationConfig: { durationSeconds: 480 },
      },
      {
        id: 'cooldown',
        title: 'Cooldown',
        type: 'duration',
        prescription: '3 minutes of easy walking and relaxed breathing',
        cue: 'Slow down gradually and leave your neck relaxed.',
        details: ['Walk easily around the mat.', 'Breathe slowly and comfortably.'],
        estimatedDuration: { seconds: 180 },
        durationConfig: { durationSeconds: 180 },
      },
    ],
  },
  {
    id: 'workout-template-b',
    label: 'Workout B',
    title: 'Defense and Recovery',
    focus:
      'Stance movement, down-block, sprawl, re-square to safe neutral position, then practice a separate double-leg entry.',
    estimatedMinutes: { min: 60, max: 60 },
    equipment: ['Mat', 'Wrestling dummy'],
    drills: [
      {
        id: 'warm-up',
        title: 'Warm-up and movement preparation',
        type: 'duration',
        prescription: '10 minutes at an easy pace',
        cue: 'Warm up gradually and keep your head up.',
        details: [
          'Move lightly around the mat.',
          'Circle your hips and shoulders.',
          'Add easy squats and stance changes.',
        ],
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
      },
      {
        id: 'neutral-defense-and-recovery',
        title: 'Down-block, sprawl, and re-square',
        type: 'duration',
        prescription: '13 minutes of slow defensive repetitions',
        cue: 'End each defense balanced in a safe neutral stance.',
        videoUrl: 'https://www.youtube.com/embed/_7XrXzfOCeQ',
        videoNote:
          'USA Wrestling labels this demonstration “Down block & sprawl.” The video could not be independently viewed during content review; this drill stops at re-squaring and excludes any go-behind.',
        details: [
          'Start in stance and practice a controlled down-block.',
          'Recover to stance before beginning the next repetition.',
          'Practice a low-impact sprawl with hips back and chest up.',
          'Re-square, regain stance, and pause in safe neutral position.',
        ],
        estimatedDuration: { seconds: 780 },
        durationConfig: { durationSeconds: 780 },
      },
      {
        id: 'defensive-position-mechanics',
        title: 'Defensive position mechanics',
        type: 'duration',
        prescription: '18 minutes alternating down-block, sprawl, and stance recovery',
        cue: 'Move your feet back, keep your chest lifted, and recover under control.',
        details: [
          'Alternate a down-block with a separate sprawl repetition.',
          'Keep each repetition smooth and controlled.',
          'Re-square and return fully to stance after every defense.',
          'Take short recovery periods as needed within the timed practice.',
        ],
        estimatedDuration: { seconds: 1080 },
        durationConfig: { durationSeconds: 1080 },
      },
      {
        id: 'recovery-to-separate-entry',
        title: 'Recovery followed by separate entry',
        type: 'duration',
        prescription: '8 minutes of deliberate defense-to-neutral-to-entry sequences',
        cue: 'Complete the defense, settle in stance, then start offense as a new action.',
        details: [
          'Practice one down-block or sprawl and recover to stance.',
          'Pause in a safe neutral position.',
          'Begin a separate double-leg entry after the pause.',
          'Do not turn the defensive action into a spin-behind or counterattack.',
        ],
        estimatedDuration: { seconds: 480 },
        durationConfig: { durationSeconds: 480 },
      },
      {
        id: 'cooldown',
        title: 'Cooldown',
        type: 'duration',
        prescription: '3 minutes of easy walking and relaxed breathing',
        cue: 'Slow down gradually and leave your neck relaxed.',
        details: ['Walk easily around the mat.', 'Breathe slowly and comfortably.'],
        estimatedDuration: { seconds: 180 },
        durationConfig: { durationSeconds: 180 },
      },
    ],
  },
  {
    id: 'workout-template-c',
    label: 'Workout C',
    title: 'Connected Attacks',
    focus:
      'Move in stance to connect a simple setup, double-leg entry, and controlled finish on a supported dummy.',
    estimatedMinutes: { min: 60, max: 60 },
    equipment: ['Mat', 'Wrestling dummy'],
    drills: [
      {
        id: 'warm-up',
        title: 'Warm-up and movement preparation',
        type: 'duration',
        prescription: '10 minutes at an easy pace',
        cue: 'Warm up gradually and keep your head up.',
        details: [
          'Move lightly around the mat.',
          'Circle your hips and shoulders.',
          'Add easy squats and stance changes.',
        ],
        estimatedDuration: { seconds: 600 },
        durationConfig: { durationSeconds: 600 },
      },
      {
        id: 'stance-defense-and-setup',
        title: 'Stance, defense, and setup',
        type: 'duration',
        prescription: '13 minutes of stance movement, defense, and hand-position feints',
        cue: 'Stay in wrestling stance; use a simple hand feint as the setup.',
        details: [
          'Move forward, backward, and laterally in stance.',
          'Rehearse a down-block or sprawl, then re-square to neutral.',
          'Practice a light hand feint without striking.',
          'Return to stance before beginning the next sequence.',
        ],
        estimatedDuration: { seconds: 780 },
        durationConfig: { durationSeconds: 780 },
      },
      {
        id: 'setup-and-double-leg-entry',
        title: 'Setup and double-leg entry',
        type: 'duration',
        prescription: '18 minutes of slow setup-to-entry practice',
        cue: 'Use a wrestling setup, change levels, and enter with control.',
        videoUrl: 'https://www.youtube.com/watch?v=4A2OiHUSbsA',
        videoNote:
          'USA Wrestling labels this demonstration “Blast double leg.” The video could not be independently viewed during content review; the setup in this drill is a separate solo adaptation.',
        details: [
          'Start in stance and use a light hand feint as a setup.',
          'Change levels before taking the penetration step.',
          'Enter toward a dummy that is already stable on the mat.',
          'Stop and reset if the dummy shifts or the position feels uncontrolled.',
          'Take short recovery periods as needed within the timed practice.',
        ],
        estimatedDuration: { seconds: 1080 },
        durationConfig: { durationSeconds: 1080 },
      },
      {
        id: 'connected-double-leg-finish',
        title: 'Connected entry and controlled dummy finish',
        type: 'duration',
        prescription: '8 minutes of controlled setup-entry-finish sequences',
        cue: 'Keep the dummy supported; turn the corner and finish without lifting or throwing.',
        details: [
          'Set the dummy securely on the mat before starting.',
          'Use a hand feint, level change, and double-leg entry in order.',
          'Guide the dummy through a small, controlled turn to the side.',
          'Finish balanced beside or on top of the dummy without a high-amplitude lift.',
          'Return to stance and reset the dummy before the next repetition.',
        ],
        estimatedDuration: { seconds: 480 },
        durationConfig: { durationSeconds: 480 },
      },
      {
        id: 'cooldown',
        title: 'Cooldown',
        type: 'duration',
        prescription: '3 minutes of easy walking and relaxed breathing',
        cue: 'Slow down gradually and leave your neck relaxed.',
        details: ['Walk easily around the mat.', 'Breathe slowly and comfortably.'],
        estimatedDuration: { seconds: 180 },
        durationConfig: { durationSeconds: 180 },
      },
    ],
  },
];

const progressionFocus = [
  'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.',
  'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.',
  'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.',
  'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.',
  'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.',
  'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.',
];

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    description:
      'Freestyle Foundations develops neutral movement, the double-leg Core Attack, and Neutral Defense across six weeks of three one-hour workouts per week. Three sessions per week is a suggested pace; missed sessions do not expire.',
    principle:
      'Move in stance, attack with clean mechanics, defend in layers, and return to position.',
    meta: '6 weeks · 3 workouts/week suggested · 18 total workouts · 60 min each',
    workoutTemplates: phaseOneWorkoutTemplates,
    weeks: Array.from({ length: 6 }, (_, index) => {
      const weekNumber = index + 1;

      return {
        number: weekNumber,
        progressionFocus: progressionFocus[index]!,
        workouts: phaseOneWorkoutTemplates.map((template, templateIndex) => {
          const suffix = String.fromCharCode(97 + templateIndex);

          return {
            id: `phase-1-week-${weekNumber}-workout-${suffix}`,
            weekNumber,
            workoutTemplateId: template.id,
            label: `Workout ${suffix.toUpperCase()}`,
            title: template.title,
            status: (weekNumber === 1 && templateIndex === 0
              ? 'current'
              : 'locked') as 'current' | 'locked',
          };
        }),
      };
    }),
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
