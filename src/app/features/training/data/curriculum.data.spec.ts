import { describe, expect, it } from 'vitest';

import { curriculumPhases } from './curriculum.data';

describe('Phase 1 neutral defense curriculum', () => {
  const phase = curriculumPhases[0]!;
  const workoutA = phase.workoutTemplates[0]!;
  const workoutB = phase.workoutTemplates[1]!;

  it('preserves template and workout instance IDs', () => {
    expect(phase.workoutTemplates.map((workout) => workout.id)).toEqual([
      'workout-template-a',
      'workout-template-b',
    ]);
    expect(
      phase.weeks.flatMap((week) => week.workouts.map((workout) => workout.id)),
    ).toEqual(
      Array.from({ length: 6 }, (_, index) => index + 1).flatMap((week) => [
        `phase-1-week-${week}-workout-a`,
        `phase-1-week-${week}-workout-b`,
      ]),
    );
  });

  it('keeps Workout A drills and adds down-block after stance and motion', () => {
    expect(workoutA.drills.map((drill) => drill.id)).toEqual([
      'warm-up',
      'stance-and-motion',
      'down-block',
      'level-change-drill',
      'penetration-step-drill',
      'shadow-double-leg',
      'dummy-finish',
    ]);
    expect(workoutA.estimatedMinutes).toEqual({ min: 45, max: 45 });
    expect(workoutA.drills[2]).toMatchObject({
      type: 'reps',
      prescription: '3 sets × 10 reps',
      estimatedDuration: { seconds: 180 },
      cue: 'Hands first. Hips back. Return to stance.',
      videoUrl: 'https://www.youtube.com/watch?v=1gk5t5Kqc8w',
      details: [
        'Start in stance.',
        'Block down as you pull your lead leg away.',
        'Keep your head and chest up.',
        'Re-square and return to stance.',
      ],
      repsConfig: { sets: 3, reps: 10 },
    });
  });

  it('defines the approved five-drill Workout B', () => {
    expect(workoutB.drills.map((drill) => drill.id)).toEqual([
      'warm-up',
      'stance-and-entry',
      'shadow-double-leg',
      'double-leg-on-dummy',
      'sprawl-and-return-to-stance',
    ]);
    expect(workoutB.estimatedMinutes).toEqual({ min: 37, max: 37 });
    expect(workoutB.drills[2]?.roundsConfig).toEqual(
      workoutA.drills[5]?.roundsConfig,
    );
    expect(workoutB.drills[4]).toMatchObject({
      type: 'reps',
      prescription: '3 sets × 5 reps',
      estimatedDuration: { seconds: 300 },
      cue: 'Legs back. Hips down. Chest up.',
      videoUrl: 'https://www.youtube.com/watch?v=pfNtYzw97Ew',
      details: [
        'Start in stance.',
        'Block down and kick both legs back.',
        'Drive your hips down without landing on your knees.',
        'Re-square and return to stance.',
      ],
      repsConfig: { sets: 3, reps: 5 },
    });
  });

  it('uses the approved warm-ups, progression copy, and sprawl video note', () => {
    for (const workout of [workoutA, workoutB]) {
      expect(workout.drills[0]?.details).toContain('Bodyweight squats.');
      expect(workout.drills[0]?.details?.join(' ')).not.toContain(
        'Low-impact sprawls',
      );
    }

    expect(phase.weeks.map((week) => week.progressionFocus)).toEqual([
      'Slow mechanics only. Make every offensive and defensive rep clean.',
      'Slow mechanics only. Make every offensive and defensive rep clean.',
      'Start every rep from stance and motion. Connect each movement without rushing.',
      'Start every rep from stance and motion. Connect each movement without rushing.',
      'Increase pace with control. Finish each rep in a strong position.',
      'Increase pace with control. Finish each rep in a strong position.',
    ]);
    expect(workoutB.drills[4]?.videoNote).toBe(
      'Focus on the sprawl mechanics. The video continues into a go-behind, which is outside this phase.',
    );
  });

  it('contains no boxing or self-defense curriculum language', () => {
    expect(JSON.stringify(phase)).not.toMatch(/boxing|self-defense/i);
  });
});
