import {
  CurriculumPhase,
  FutureCurriculumPhase,
  WorkoutTemplate,
  Drill,
} from '../models/curriculum.model';

interface DrillContent {
  id: string;
  title: string;
  cue: string;
  details: string[];
  videoUrl?: string;
  videoNote?: string;
}

function timedDrill(
  content: DrillContent,
  prescription: string,
  seconds: number,
): Drill {
  return {
    ...content,
    type: 'duration',
    prescription,
    estimatedDuration: { seconds },
    durationConfig: { durationSeconds: seconds },
  };
}

function grecoTemplate(
  id: string,
  title: string,
  focus: string,
  movement: DrillContent,
  technique: DrillContent,
  connectedPractice: DrillContent,
): WorkoutTemplate {
  return {
    id,
    label: `Workout ${id.slice(-1).toUpperCase()}`,
    title,
    focus,
    estimatedMinutes: { min: 60, max: 60 },
    equipment: ['Mat', 'Suples Power dummy (30 kg with arms)'],
    drills: [
      timedDrill(
        {
          id: 'greco-warm-up',
          title: 'Warm-up and movement preparation',
          cue: 'Warm up gradually and keep your head up.',
          details: [
            'Move lightly around the mat.',
            'Circle your hips and shoulders.',
            'Add easy squats and relaxed stance changes.',
          ],
        },
        '10-minute warm-up block at an easy pace',
        600,
      ),
      timedDrill(
        movement,
        '15-minute block: 13 minutes of movement and defensive posture plus the 2-minute Rest after warm-up',
        780,
      ),
      timedDrill(
        technique,
        '20-minute block: 18 minutes of focused dummy practice plus the 2-minute Rest after movement practice',
        1080,
      ),
      timedDrill(
        connectedPractice,
        '10-minute block: 8 minutes of connected practice plus the 2-minute Rest after focused technique',
        480,
      ),
      timedDrill(
        {
          id: 'greco-cooldown',
          title: 'Cooldown',
          cue: 'Slow down gradually and keep your neck relaxed.',
          details: ['Walk easily around the mat.', 'Breathe slowly and comfortably.'],
        },
        '5-minute block: 3 minutes of cooldown plus the 2-minute Rest after connected practice',
        180,
      ),
    ],
  };
}

const positionAndMovement = grecoTemplate(
  'greco-workout-template-a',
  'Position and Movement',
  'Build Greco-Roman stance, balanced footwork, defensive posture, and calm contact with a supported dummy.',
  {
    id: 'greco-stance-and-motion',
    title: 'Greco-Roman stance, motion, and defensive posture',
    cue: 'Stay balanced, keep your elbows in, and recover to stance.',
    videoUrl: 'https://www.youtube.com/watch?v=YcC4_soKqbs',
    videoNote:
      'USA Wrestling lists “Greco-Roman Stance” in Olympic Styles Level 1. The video could not be independently viewed during review; the solo footwork and posture cues here are an app adaptation.',
    details: [
      'Move forward, backward, and laterally without crossing your feet.',
      'Circle while keeping your chest upright and elbows close.',
      'Rehearse a compact defensive posture, then return to neutral stance.',
      'Take short recovery periods within the timed practice.',
    ],
  },
  {
    id: 'greco-supported-contact-position',
    title: 'Supported dummy contact position',
    cue: 'Use the dummy for light placement practice; it cannot pummel or resist.',
    details: [
      'Lay the dummy flat on its back with its shoulders and hips supported by the mat.',
      'Approach in stance and place an open hand on the upper arm or shoulder.',
      'Keep your head beside the shoulder, your neck clear, and your elbows close.',
      'Release and return to stance; do not pull, lift, or try to make the dummy stand.',
    ],
  },
  {
    id: 'greco-movement-to-contact-reset',
    title: 'Movement to contact and stance reset',
    cue: 'Move into position under control, make light contact, then reset.',
    details: [
      'Move around the stationary dummy with balanced steps.',
      'Pause in a compact stance beside its shoulder.',
      'Touch the upper arm with a relaxed hand, then step away to neutral.',
      'Keep the dummy supported on the mat and do not imitate a live tie exchange.',
    ],
  },
);

const contactAndControl = grecoTemplate(
  'greco-workout-template-b',
  'Contact and Control',
  'Develop contact and control preparation through deliberate grip placement, upper-body positioning, and light contact with a grounded dummy.',
  {
    id: 'greco-contact-distance-and-motion',
    title: 'Stance movement to contact distance',
    cue: 'Close distance with balanced steps and stop before reaching.',
    details: [
      'Move forward, backward, and laterally in Greco-Roman stance.',
      'Circle toward the dummy while keeping your chest upright and elbows in.',
      'Stop at arm’s reach, recover to stance, and repeat from another angle.',
      'The dummy stays flat and supported on the mat throughout this drill.',
    ],
  },
  {
    id: 'greco-grip-and-underhook-placement',
    title: 'Grip placement and underhook positioning',
    cue: 'Place the arm gently; the dummy cannot pummel or resist.',
    videoUrl: 'https://www.youtube.com/watch?v=fIa9GQrjBBk',
    videoNote:
      'USA Wrestling lists “Single Underhook” in Greco-Roman Level 2. The video could not be independently viewed during review; only initial hand placement and shoulder alignment are relevant here. The grounded-dummy drill is an app adaptation, not pummeling or resistance practice.',
    details: [
      'Start with the dummy flat on its back and its shoulders and hips supported by the mat.',
      'If an arm can rest across the chest without propping up the torso, use it; otherwise trace the arm path beside the upper arm.',
      'From beside the shoulder, rehearse the underhook position gently without lifting the dummy or forcing its arm.',
      'Keep your head beside the shoulder without pressing on the neck; keep the dummy still.',
      'Release the position and reset without pulling, twisting, or lifting the dummy.',
    ],
  },
  {
    id: 'greco-inside-position-to-underhook-reset',
    title: 'Inside position to underhook and reset',
    cue: 'Find a relaxed inside-hand position before setting the underhook.',
    details: [
      'Approach the supported dummy from stance and place one relaxed hand inside its fixed arm.',
      'Rehearse the underhook arm path without moving the dummy or forcing its shoulder.',
      'Pause, release both hands, and return to neutral stance.',
      'This repeats hand placement only; it does not teach a live pummeling exchange.',
    ],
  },
);

const connectedEntries = grecoTemplate(
  'greco-workout-template-c',
  'Connected Entries',
  'Connect stance movement, underhook positioning, a controlled slide-by entry path, and a stop at rear-control alignment.',
  {
    id: 'greco-angle-steps-and-recovery',
    title: 'Angle steps and stance recovery',
    cue: 'Change angle with short steps and regain balance before contact.',
    details: [
      'Move in stance, then circle a few steps to either side.',
      'Rehearse compact defensive posture without an opponent, then recover to stance.',
      'Approach the grounded dummy only after you are balanced.',
      'Keep the dummy stationary on the mat.',
    ],
  },
  {
    id: 'greco-underhook-start-position',
    title: 'Underhook start position on a grounded dummy',
    cue: 'Set a light underhook position before practicing the entry path.',
    details: [
      'Start with the dummy flat on its back and its shoulders and hips supported by the mat.',
      'If an arm can rest across the chest without propping up the torso, use it; otherwise trace the arm path beside the upper arm.',
      'Beside the shoulder, rehearse the underhook position gently without lifting the dummy or forcing its arm.',
      'Keep your head clear of the neck and do not pull or shift the dummy.',
      'Release and reset if the dummy moves or the position feels unstable.',
    ],
  },
  {
    id: 'greco-underhook-slide-by-rear-control',
    title: 'Underhook to slide-by and rear-control rehearsal',
    cue: 'Rehearse the arm path and footwork, then stop at rear-control alignment.',
    videoUrl: 'https://www.youtube.com/watch?v=Ql3wXPoGkJA',
    videoNote:
      'USA Wrestling lists “Slide by” as Greco-Roman Level 2 partner instruction. The video could not be independently viewed during review; this drill adapts only the arm path and angle, using a grounded dummy and stopping at positional rear control.',
    details: [
      'Start beside the shoulder with the dummy flat on its back and fully supported by the mat.',
      'If an arm can rest across the chest without propping up the torso, use it; otherwise trace the arm path beside the upper arm.',
      'Set the underhook position, then trace the slide-by arm path gently without dragging the dummy.',
      'Circle around the shoulder end with small balanced steps; do not step across or climb onto the dummy.',
      'Stop behind the shoulder line in a balanced rear-control position, then release and reset.',
      'This is a positional rehearsal only: do not lift, throw, bridge, or attempt a finish.',
    ],
  },
);

const grecoWorkoutTemplates = [positionAndMovement, contactAndControl, connectedEntries];

export const grecoCurriculumPhases: CurriculumPhase[] = [
  {
    id: 'greco-phase-1',
    title: 'Phase 1: Foundations',
    description:
      'Greco-Roman Foundations adapts selected USA Wrestling stance, underhook, and slide-by material for beginner solo practice without assuming prior coached throwing experience. UWW rules distinguish Greco from freestyle by prohibiting holds below the belt, trips, and active use of the legs against an opponent. Dummy drills here are preparation and positional rehearsal, not live pummeling, partner defense, or a USA Wrestling-approved solo program.',
    principle:
      'Move in balance, prepare upper-body positions, and rehearse entries under control.',
    meta: '6 weeks · 3 workouts/week suggested · 18 total workouts · 60 min each',
    workoutTemplates: grecoWorkoutTemplates,
    weeks: Array.from({ length: 6 }, (_, index) => {
      const weekNumber = index + 1;
      const progressionFocus =
        weekNumber <= 2
          ? 'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.'
          : weekNumber <= 4
            ? 'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.'
            : 'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.';

      return {
        number: weekNumber,
        progressionFocus,
        workouts: grecoWorkoutTemplates.map(
          (template, templateIndex) => {
            const suffix = String.fromCharCode(97 + templateIndex);

            return {
              id: `greco-phase-1-week-${weekNumber}-workout-${suffix}`,
              weekNumber,
              workoutTemplateId: template.id,
              label: `Workout ${suffix.toUpperCase()}`,
              title: template.title,
              status: (weekNumber === 1 && templateIndex === 0
                ? 'current'
                : 'locked') as 'current' | 'locked',
            };
          },
        ),
      };
    }),
  },
];

export const grecoFutureCurriculumPhases: FutureCurriculumPhase[] = [
  {
    id: 'greco-phase-2',
    title: 'Phase 2: Standing Control and Entries',
    status: 'locked',
    statusText: 'Outlined · not available',
  },
  {
    id: 'greco-phase-3',
    title: 'Phase 3: Par Terre Foundations',
    status: 'locked',
    statusText: 'Outlined · not available',
  },
  {
    id: 'greco-phase-4',
    title: 'Phase 4: Connected Attacks and Control',
    status: 'locked',
    statusText: 'Outlined · not available',
  },
];
