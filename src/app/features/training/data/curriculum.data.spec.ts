import { describe, expect, it } from 'vitest';

import { appWorkoutConfig, curriculumPhases } from './curriculum.data';
import { grecoCurriculumPhases } from './greco-curriculum.data';

describe('freestyle Foundations content contract', () => {
  const phase = curriculumPhases[0]!;

  it('contains six weeks of ordered A, B, and C Workout Instances', () => {
    expect(phase.weeks).toHaveLength(6);
    expect(phase.weeks.flatMap((week) => week.workouts)).toHaveLength(18);
    expect(phase.weeks.map((week) => week.workouts.map((workout) => workout.label))).toEqual(
      Array.from({ length: 6 }, () => ['Workout A', 'Workout B', 'Workout C']),
    );
    expect(phase.weeks[0]?.workouts.map((workout) => workout.status)).toEqual([
      'current',
      'locked',
      'locked',
    ]);
    expect(phase.meta).toContain('18 total workouts');
    expect(phase.meta).toContain('3 workouts/week');
  });

  it('assigns the three requested templates in the same order every week', () => {
    expect(phase.workoutTemplates.map((template) => template.title)).toEqual([
      'Movement and Entry Mechanics',
      'Defense and Recovery',
      'Connected Attacks',
    ]);
    for (const week of phase.weeks) {
      expect(week.workouts.map((workout) => workout.workoutTemplateId)).toEqual(
        phase.workoutTemplates.map((template) => template.id),
      );
    }
  });

  it('plans 60 minutes from timed drill prescriptions and automatic between-drill Rest', () => {
    for (const template of phase.workoutTemplates) {
      const timedWorkSeconds = template.drills.reduce(
        (total, drill) => total + (drill.estimatedDuration?.seconds ?? 0),
        0,
      );
      const automaticRestSeconds =
        (template.drills.length - 1) * appWorkoutConfig.defaultRestSeconds;

      expect(template.estimatedMinutes).toEqual({ min: 60, max: 60 });
      expect((timedWorkSeconds + automaticRestSeconds) / 60).toBe(60);
      expect(
        template.drills.map((drill) =>
          drill.prescription?.match(/^\d+(?=-minute)/)?.[0],
        ),
      ).toEqual(['10', '15', '20', '10', '5']);
      expect(template.drills[0]?.estimatedDuration?.seconds).toBe(10 * 60);
      expect(
        template.drills[template.drills.length - 1]?.estimatedDuration?.seconds,
      ).toBe(3 * 60);
      expect(
        template.drills.every(
          (drill) =>
            drill.type === 'duration' &&
            drill.durationConfig?.durationSeconds ===
              drill.estimatedDuration?.seconds,
        ),
      ).toBe(true);
    }
  });

  it('keeps Defense and Recovery in safe neutral before a separate entry', () => {
    const defense = phase.workoutTemplates[1]!;
    const defenseDrill = defense.drills[1]!;
    const separateEntry = defense.drills[3]!;

    expect(defense.title).toBe('Defense and Recovery');
    expect(defenseDrill.details?.join(' ')).toMatch(/re-square.*safe neutral position/i);
    expect(separateEntry.title).toMatch(/separate entry/i);
    expect(separateEntry.details?.join(' ')).toMatch(/pause in a safe neutral position/i);
    expect(separateEntry.details?.join(' ')).toMatch(
      /begin a separate double-leg entry after the pause/i,
    );
    expect(separateEntry.details?.join(' ')).toMatch(
      /do not turn the defensive action into a spin-behind or counterattack/i,
    );
  });

  it('keeps every template wrestling-specific and includes movement, attack, and defense', () => {
    for (const template of phase.workoutTemplates) {
      expect(template.focus).toMatch(/stance|movement/i);
      expect(template.drills.some((drill) => /double-leg|entry/i.test(drill.title))).toBe(true);
      expect(
        template.drills.some((drill) =>
          /down-block|sprawl|defense/i.test(`${drill.title} ${drill.details?.join(' ')}`),
        ),
      ).toBe(true);
    }

    expect(JSON.stringify(phase)).not.toMatch(/boxing|self-defense/i);
  });

  it('uses the agreed progression bands without increasing prescribed volume', () => {
    expect(phase.weeks.map((week) => week.progressionFocus)).toEqual([
      'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.',
      'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.',
      'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.',
      'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.',
      'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.',
      'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.',
    ]);
    expect(phase.weeks[0]?.progressionFocus).toMatch(/slow mechanics/i);
    expect(phase.weeks[2]?.progressionFocus).toMatch(/connect movements and entries/i);
    expect(phase.weeks[4]?.progressionFocus).toMatch(/without automatically increasing volume/i);
    expect(
      new Set(
        phase.workoutTemplates.map((template) =>
          template.drills
            .map((drill) => drill.estimatedDuration?.seconds)
            .join(','),
        ),
      ).size,
    ).toBe(1);
  });

  it('provides relevant USA Wrestling Technique Videos with explicit review limits', () => {
    const videoDrills = phase.workoutTemplates.flatMap((template) => template.drills)
      .filter((drill) => drill.videoUrl);

    expect(videoDrills.length).toBeGreaterThan(0);
    for (const drill of videoDrills) {
      expect(drill.videoUrl).toMatch(/^https:\/\/www\.youtube\.com\//);
      expect(drill.videoNote).toMatch(/USA Wrestling/i);
      expect(drill.videoNote).toMatch(/could not be independently viewed/i);
    }
  });
});

describe('Greco-Roman staged content contract', () => {
  const phase = grecoCurriculumPhases[0]!;
  const template = phase.workoutTemplates[0]!;

  it('contains only the authored Greco A instance and does not fabricate a next workout', () => {
    expect(phase.weeks).toHaveLength(1);
    expect(phase.weeks[0]?.workouts).toHaveLength(1);
    expect(phase.weeks[0]?.workouts[0]).toMatchObject({
      id: 'greco-phase-1-week-1-workout-a',
      label: 'Workout A',
      title: 'Position and Movement',
    });
    expect(template.title).toBe('Position and Movement');
  });

  it('plans the agreed 60-minute budget and includes position, grip, defense, and entry rehearsal', () => {
    const timedWorkSeconds = template.drills.reduce(
      (total, drill) => total + (drill.estimatedDuration?.seconds ?? 0),
      0,
    );
    const automaticRestSeconds =
      (template.drills.length - 1) * appWorkoutConfig.defaultRestSeconds;

    expect(template.estimatedMinutes).toEqual({ min: 60, max: 60 });
    expect((timedWorkSeconds + automaticRestSeconds) / 60).toBe(60);
    expect(template.drills.map((drill) => drill.prescription?.match(/^\d+(?=-minute)/)?.[0]))
      .toEqual(['10', '15', '20', '10', '5']);
    expect(JSON.stringify(template)).toMatch(/defensive posture/i);
    expect(JSON.stringify(template)).toMatch(/grip preparation/i);
    expect(JSON.stringify(template)).toMatch(/underhook/i);
    expect(JSON.stringify(template)).toMatch(/slide-by/i);
    expect(JSON.stringify(template)).toMatch(/rear-control/i);
    expect(JSON.stringify(template)).toMatch(/dummy cannot pummel or resist/i);
    expect(JSON.stringify(template)).not.toMatch(/freestyle|double-leg/i);
  });

  it('links to USA Wrestling Greco demonstrations and records playback limits', () => {
    const videoDrills = template.drills.filter((drill) => drill.videoUrl);

    expect(videoDrills.length).toBeGreaterThan(0);
    for (const drill of videoDrills) {
      expect(drill.videoUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      expect(drill.videoNote).toMatch(/USA Wrestling/i);
      expect(drill.videoNote).toMatch(/Playback was unavailable during review/i);
    }
  });
});
