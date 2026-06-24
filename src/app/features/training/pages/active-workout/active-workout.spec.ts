import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { CurriculumStore } from '../curriculum/curriculum.store';
import {
  CurriculumPhase,
  WorkoutInstance,
  WorkoutTemplate,
} from '../curriculum/model/curriculum.model';
import { ActiveWorkoutPage } from './active-workout';

describe('ActiveWorkoutPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();

  const workout: WorkoutInstance = {
    id: 'phase-1-week-2-workout-b',
    weekNumber: 2,
    workoutTemplateId: 'template-active-workout',
    label: 'Workout B',
    title: 'Shot Entries',
    status: 'current',
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
    drills: [
      {
        id: 'level-change',
        title: 'Level change drill',
        type: 'reps',
        prescription: '3 sets x 10 reps',
        cue: 'Drop your hips and stay tall.',
        videoUrl: 'https://example.test/level-change',
        repsConfig: {
          sets: 3,
          reps: 10,
        },
      },
      {
        id: 'stance-motion',
        title: 'Stance motion',
        type: 'duration',
        cue: 'Small steps without crossing your feet.',
        coreTechnique: 'Stance and motion',
        details: ['Move forward and back.', 'Circle both directions.'],
        videoUrl: 'https://example.test/stance-motion',
        durationConfig: {
          durationSeconds: 180,
        },
      },
      {
        id: 'shadow-shot-rounds',
        title: 'Shadow shot rounds',
        type: 'rounds',
        cue: 'Level change before every entry.',
        optionInstruction: 'Choose one entry and keep it clean.',
        options: ['Jab feint to double leg', 'Hands high to level change'],
        videoUrl: 'https://example.test/shadow-shot',
        roundsConfig: {
          rounds: 3,
          roundSeconds: 60,
          restBetweenRoundsSeconds: 30,
        },
      },
    ],
  };

  const phase: CurriculumPhase = {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    description: 'Build the base.',
    principle: 'Enter safely and finish on top.',
    meta: '6 weeks',
    workoutTemplates: [workoutTemplate],
    weeks: [
      {
        number: 2,
        progressionFocus: 'Add speed without losing clean mechanics.',
        workouts: [workout],
      },
    ],
  };

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWorkoutPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: CurriculumStore,
          useValue: {
            currentWorkout: signal(workout),
            currentWorkoutTemplate: signal(workoutTemplate),
            currentPhase: signal(phase),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ActiveWorkoutPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture };
  };

  it('renders workout header metadata', async () => {
    const { fixture } = await setup();
    const text = normalizeText(fixture.nativeElement.textContent);
    const metaItems = Array.from(
      fixture.nativeElement.querySelectorAll('.meta div'),
    ) as HTMLElement[];

    expect(text).toContain('Phase 1: Foundations');
    expect(text).toContain('Week 2 · Workout B');
    expect(text).toContain('Shot Entries');
    expect(text).toContain('Add speed without losing clean mechanics.');
    expect(
      metaItems.map((item) => [
        normalizeText(item.querySelector('dt')?.textContent),
        normalizeText(item.querySelector('dd')?.textContent),
      ]),
    ).toEqual([
      ['Duration', '25-30 min'],
      ['Equipment', 'Mat + Dummy'],
      ['Default rest', '2 min'],
    ]);
  });

  it('renders drill cards in workout order', async () => {
    const { fixture } = await setup();
    const cards = fixture.nativeElement.querySelectorAll('.card');

    expect(cards).toHaveLength(3);
    expect(normalizeText(cards[0].querySelector('h2')?.textContent)).toBe(
      'Level change drill',
    );
    expect(normalizeText(cards[1].querySelector('h2')?.textContent)).toBe(
      'Stance motion',
    );
    expect(normalizeText(cards[2].querySelector('h2')?.textContent)).toBe(
      'Shadow shot rounds',
    );
  });

  it('shows cue, core technique fallback, and watch labels', async () => {
    const { fixture } = await setup();
    const cards = fixture.nativeElement.querySelectorAll('.card');

    expect(
      normalizeText(
        cards[0].querySelector('.tech span')?.textContent,
      ),
    ).toBe('Core technique');
    expect(
      normalizeText(
        cards[0].querySelector('.tech strong')?.textContent,
      ),
    ).toBe('Level change drill');
    expect(
      normalizeText(
        cards[1].querySelector('.tech strong')?.textContent,
      ),
    ).toBe('Stance and motion');
    expect(
      normalizeText(
        cards[0].querySelector('.cue span')?.textContent,
      ),
    ).toBe('Cue');
    expect(
      normalizeText(cards[0].querySelector('.cue p')?.textContent),
    ).toBe('Drop your hips and stay tall.');
    expect(
      fixture.nativeElement.querySelectorAll('.video'),
    ).toHaveLength(3);
  });

  it('uses type-specific action labels and timer previews', async () => {
    const { fixture } = await setup();
    const cards = fixture.nativeElement.querySelectorAll('.card');

    expect(normalizeText(cards[0].textContent)).toContain('Mark Complete');
    expect(normalizeText(cards[1].textContent)).toContain('Start');
    expect(
      normalizeText(cards[1].querySelector('.timer span')?.textContent),
    ).toBe('Work timer');
    expect(
      normalizeText(
        cards[1].querySelector('.timer strong')?.textContent,
      ),
    ).toBe('3:00');
    expect(normalizeText(cards[2].textContent)).toContain('Start');
    expect(
      normalizeText(cards[2].querySelector('.timer span')?.textContent),
    ).toBe('Round 1 of 3');
    expect(
      normalizeText(
        cards[2].querySelector('.timer strong')?.textContent,
      ),
    ).toBe('1:00');
    expect(normalizeText(cards[2].textContent)).toContain('Rest 0:30');
  });

  it('renders mocked progress and drill states', async () => {
    const { fixture } = await setup();
    const cards = fixture.nativeElement.querySelectorAll('.card');
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('1 of 3 drills complete');
    expect(text).toContain('Current: Stance motion');
    expect(cards[0].classList).toContain('done');
    expect(cards[1].classList).toContain('cur');
    expect(cards[2].classList).toContain('queue');
    expect(normalizeText(cards[0].textContent)).toContain('Complete');
    expect(normalizeText(cards[1].textContent)).toContain('Current');
    expect(normalizeText(cards[2].textContent)).toContain('Queued');
  });
});
