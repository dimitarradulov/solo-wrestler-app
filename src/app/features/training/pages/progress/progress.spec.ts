import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { CompletedWorkoutLogEntry } from '../../models/training-session.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import { CurriculumStore } from '../../stores/curriculum.store';
import { ProgressPage } from './progress';

describe('ProgressPage', () => {
  const createStore = (entries: CompletedWorkoutLogEntry[]) => ({
    entries: signal(entries),
  });

  const setup = async (
    entries: CompletedWorkoutLogEntry[] = [],
    style: 'freestyle' | 'greco-roman' = 'freestyle',
  ) => {
    await TestBed.configureTestingModule({
      imports: [ProgressPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: CompletedWorkoutLogStore,
          useValue: createStore(entries),
        },
        {
          provide: CurriculumStore,
          useValue: { style: signal(style) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProgressPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  it('lists completed workouts newest first with metadata, date, difficulty, and detail links', async () => {
    const olderEntry: CompletedWorkoutLogEntry = {
      workoutId: 'phase-1-week-1-workout-a',
      completedAt: '2026-06-25T16:00:00.000Z',
      difficulty: 'hard',
      note: 'Felt sharp.',
      completedDrillIds: ['warm-up'],
    };
    const newerEntry: CompletedWorkoutLogEntry = {
      workoutId: 'phase-1-week-1-workout-b',
      completedAt: '2026-06-26T08:30:00.000Z',
      difficulty: 'good',
      note: null,
      completedDrillIds: ['warm-up'],
    };

    const fixture = await setup([olderEntry, newerEntry]);
    const entries = fixture.nativeElement.querySelectorAll('.progress-entry');
    const expectedDate = new Date(newerEntry.completedAt).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    );

    expect(entries.length).toBe(2);
    expect(entries[0].textContent).toContain('Defense and Recovery');
    expect(entries[0].textContent).toContain(
      'Phase 1: Foundations · Week 1 · Workout B',
    );
    expect(entries[0].textContent).toContain('Good');
    expect(entries[0].textContent).toContain(expectedDate);
    expect(entries[0].getAttribute('href')).toContain(
      '/completed-workouts/freestyle/phase-1-week-1-workout-b',
    );
    expect(entries[1].textContent).toContain('Mechanics');
    expect(entries[1].textContent).toContain('Hard');
    expect(entries[1].textContent).toContain(
      'Phase 1: Foundations · Week 1 · Workout A',
    );
    expect(
      fixture.nativeElement.querySelector('.progress-entry__chevron'),
    ).not.toBeNull();
  });

  it('shows the empty state with a Go to Today action', async () => {
    const fixture = await setup([]);
    const emptyMessage = fixture.nativeElement.querySelector(
      '.progress-empty__message',
    ) as HTMLElement | null;
    const action = fixture.nativeElement.querySelector(
      '.progress-empty__action',
    ) as HTMLAnchorElement | HTMLButtonElement | null;

    expect(emptyMessage?.textContent).toContain('No completed workouts yet');
    expect(action?.textContent).toContain('Go to Today');
  });

  it('shows only the selected style and gives its detail link a style-qualified identity', async () => {
    const fixture = await setup(
      [
        {
          style: 'freestyle',
          workoutId: 'phase-1-week-1-workout-a',
          completedAt: '2026-06-26T08:30:00.000Z',
          difficulty: 'good',
          note: null,
          completedDrillIds: [],
        },
        {
          style: 'greco-roman',
          workoutId: 'greco-phase-1-week-1-workout-a',
          completedAt: '2026-06-27T08:30:00.000Z',
          difficulty: 'good',
          note: null,
          completedDrillIds: [],
        },
      ],
      'greco-roman',
    );
    const entries = fixture.nativeElement.querySelectorAll('.progress-entry');

    expect(entries).toHaveLength(1);
    expect(entries[0].textContent).toContain('Position and Movement');
    expect(entries[0].getAttribute('href')).toContain(
      '/completed-workouts/greco-roman/greco-phase-1-week-1-workout-a',
    );
  });
});
