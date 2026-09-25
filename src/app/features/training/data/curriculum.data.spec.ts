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

describe('Greco-Roman Foundations content contract', () => {
  const phase = grecoCurriculumPhases[0]!;

  it('contains six Weeks of ordered A, B, and C Workout Instances with resolvable identities', () => {
    expect(phase.weeks).toHaveLength(6);
    expect(phase.workoutTemplates.map((template) => template.title)).toEqual([
      'Position and Movement',
      'Contact and Control',
      'Connected Entries',
    ]);
    expect(new Set(phase.workoutTemplates.map((template) => template.id)).size).toBe(3);
    expect(phase.weeks.map((week) => week.workouts.map((workout) => workout.label))).toEqual(
      Array.from({ length: 6 }, () => ['Workout A', 'Workout B', 'Workout C']),
    );
    expect(phase.weeks.flatMap((week) => week.workouts)).toHaveLength(18);
    expect(new Set(phase.weeks.flatMap((week) => week.workouts.map((workout) => workout.id))).size)
      .toBe(18);
    expect(phase.meta).toContain('18 total workouts');
    expect(phase.weeks[0]?.workouts.map((workout) => workout.status)).toEqual([
      'current',
      'locked',
      'locked',
    ]);

    for (const [weekIndex, week] of phase.weeks.entries()) {
      expect(week.number).toBe(weekIndex + 1);
      for (const [templateIndex, workout] of week.workouts.entries()) {
        const template = phase.workoutTemplates.find(
          (candidate) => candidate.id === workout.workoutTemplateId,
        );

        expect(template).toBeDefined();
        expect(workout.id).toBe(
          `greco-phase-1-week-${week.number}-workout-${String.fromCharCode(97 + templateIndex)}`,
        );
        expect(workout.weekNumber).toBe(week.number);
        expect(workout.workoutTemplateId).toBe(phase.workoutTemplates[templateIndex]?.id);
        expect(workout.label).toBe(`Workout ${String.fromCharCode(65 + templateIndex)}`);
        expect(workout.title).toBe(template?.title);
      }
    }
  });

  it('plans each template for 60 minutes including Rest once and gives each a distinct emphasis', () => {
    for (const template of phase.workoutTemplates) {
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
      expect(template.drills.every((drill) =>
        drill.cue.trim() !== '' &&
        (drill.details?.length ?? 0) > 0 &&
        drill.prescription !== undefined &&
        !/placeholder|tbd/i.test(`${drill.title} ${drill.cue} ${drill.details?.join(' ')}`) &&
        drill.type === 'duration' &&
        drill.durationConfig?.durationSeconds === drill.estimatedDuration?.seconds,
      )).toBe(true);
      expect(template.drills[0]?.estimatedDuration?.seconds).toBe(10 * 60);
      expect(template.drills[template.drills.length - 1]?.estimatedDuration?.seconds).toBe(3 * 60);
      expect(template.equipment).toContain('Mat');
      expect(template.equipment.join(' ')).toMatch(/Suples Power dummy.*30 kg with arms/);
      expect(JSON.stringify(template.drills)).toMatch(/dummy/i);
      expect(JSON.stringify(template.drills)).toMatch(/movement|footwork|stance/i);
      expect(JSON.stringify(template)).not.toMatch(/loaded neck bridge|reverse lift|back-arch throw|high-amplitude finish/i);
    }

    expect(new Set(phase.workoutTemplates.map((template) => template.title)).size).toBe(3);
    expect(new Set(phase.workoutTemplates.map((template) => template.focus)).size).toBe(3);
    expect(phase.workoutTemplates.map((template) => template.title)).toEqual([
      'Position and Movement',
      'Contact and Control',
      'Connected Entries',
    ]);
  });

  it('keeps contact drills as supported dummy preparation without implying resistance', () => {
    const contact = phase.workoutTemplates[1]!;
    const text = JSON.stringify(contact).toLowerCase();

    expect(text).toMatch(/grip placement|grip-position/);
    expect(text).toMatch(/upper-body positioning|upper body positioning/);
    expect(text).toMatch(/supported|grounded/);
    expect(text).toMatch(/cannot .*resist|does not .*resist|no .*resistance/);
  });

  it('connects underhook positioning to slide-by entry and rear control as positional rehearsal', () => {
    const connected = phase.workoutTemplates[2]!;
    const text = connected.drills.map((drill) => `${drill.title} ${drill.cue} ${drill.details?.join(' ')}`)
      .join(' ')
      .toLowerCase();
    const underhookIndex = text.indexOf('underhook');
    const slideByIndex = text.indexOf('slide-by');
    const rearControlIndex = text.indexOf('rear-control');

    expect(underhookIndex).toBeGreaterThanOrEqual(0);
    expect(slideByIndex).toBeGreaterThan(underhookIndex);
    expect(rearControlIndex).toBeGreaterThan(slideByIndex);
    expect(text).toMatch(/positional rehearsal|rehearsal/);
    expect(text).toMatch(/supported|grounded/);
    expect(text).toMatch(/do not lift|without lifting|stop before .*finish/);
  });

  it('does not copy freestyle-only takedowns or defense into Greco Foundations', () => {
    expect(JSON.stringify(phase.workoutTemplates)).not.toMatch(
      /double[- ]leg|single[- ]leg|down[- ]block|sprawl/i,
    );
  });

  it('uses the agreed six-week progression without increasing practice volume', () => {
    expect(phase.weeks.map((week) => week.progressionFocus)).toEqual([
      'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.',
      'Weeks 1–2: Practice individual positions and slow mechanics. Keep the templates recognizable and make every repetition controlled.',
      'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.',
      'Weeks 3–4: Connect movements and entries smoothly while keeping the same controlled practice volume.',
      'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.',
      'Weeks 5–6: Practice consistent sequences from movement without automatically increasing volume.',
    ]);
  });

  it('attaches USA Wrestling demonstrations to matching drill portions and records review limits', () => {
    const videoDrills = phase.workoutTemplates.flatMap((template) => template.drills)
      .filter((drill) => drill.videoUrl);

    expect(phase.workoutTemplates.map((template) =>
      template.drills.find((drill) => drill.videoUrl)?.title,
    )).toEqual([
      'Greco-Roman stance, motion, and defensive posture',
      'Grip placement and underhook positioning',
      'Underhook to slide-by and rear-control rehearsal',
    ]);
    expect(videoDrills).toHaveLength(3);
    for (const drill of videoDrills) {
      expect(drill.videoUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      expect(drill.videoNote).toMatch(/USA Wrestling/i);
      expect(drill.videoNote).toMatch(/could not be independently viewed|playback was unavailable/i);
      expect(drill.videoNote).toMatch(/solo|dummy|portion|rehearsal/i);
    }
  });
});
