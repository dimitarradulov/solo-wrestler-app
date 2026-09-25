import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';

import { CompletedWorkoutLogEntry } from '../../models/training-session.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import { CompletedWorkoutDetailPage } from './completed-workout-detail';

describe('CompletedWorkoutDetailPage', () => {
  const setup = async (
    workoutId: string,
    entries: CompletedWorkoutLogEntry[],
    style = 'freestyle',
  ) => {
    const routeParams = new BehaviorSubject(
      convertToParamMap({ workoutId, style }),
    );
    await TestBed.configureTestingModule({
      imports: [CompletedWorkoutDetailPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ workoutId, style }),
            },
            paramMap: routeParams.asObservable(),
          },
        },
        {
          provide: CompletedWorkoutLogStore,
          useValue: {
            entries: signal(entries),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CompletedWorkoutDetailPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, routeParams };
  };

  it('renders the workout details, notes fallback, and drill list in template order', async () => {
    const completedAt = '2026-06-26T08:30:00.000Z';
    const { fixture } = await setup('phase-1-week-1-workout-a', [
      {
        workoutId: 'phase-1-week-1-workout-a',
        completedAt,
        difficulty: 'good',
        note: null,
        completedDrillIds: [
          'warm-up',
          'stance-footwork-and-defense',
          'double-leg-entry-mechanics',
          'movement-to-double-leg-entry',
          'cooldown',
        ],
      },
    ]);
    const drillTitles = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.completed-workout-detail__drill-copy h3',
      ),
      (element: Element) => element.textContent?.trim(),
    );
    const expectedDate = new Date(completedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    expect(fixture.nativeElement.textContent).toContain('Mechanics');
    expect(fixture.nativeElement.textContent).toContain(
      'Phase 1: Foundations · Week 1 · Workout A',
    );
    expect(fixture.nativeElement.textContent).toContain(expectedDate);
    expect(fixture.nativeElement.textContent).toContain('Good');
    expect(fixture.nativeElement.textContent).toContain('No notes added.');
    expect(drillTitles).toEqual([
      'Warm-up and movement preparation',
      'Stance, footwork, and defensive posture',
      'Double-leg entry mechanics',
      'Movement to separate double-leg entry',
      'Cooldown',
    ]);
  });

  it('shows not found for stale workout ids and keeps the back action', async () => {
    const { fixture } = await setup('missing-workout', []);
    const backButton = fixture.nativeElement.querySelector(
      '.completed-workout-detail__back',
    ) as HTMLAnchorElement | HTMLButtonElement | null;

    expect(fixture.nativeElement.textContent).toContain(
      'Completed workout not found',
    );
    expect(backButton?.textContent).toContain('Back to Progress');
  });

  it('does not resolve a completed workout id against a different style', async () => {
    const { fixture } = await setup(
      'phase-1-week-1-workout-a',
      [
        {
          style: 'freestyle',
          workoutId: 'phase-1-week-1-workout-a',
          completedAt: '2026-06-26T08:30:00.000Z',
          difficulty: 'good',
          note: null,
          completedDrillIds: [],
        },
      ],
      'greco-roman',
    );

    expect(fixture.nativeElement.textContent).toContain(
      'Completed workout not found',
    );
  });

  it('resolves a Greco completed workout using its style and id together', async () => {
    const { fixture } = await setup(
      'greco-phase-1-week-1-workout-a',
      [
        {
          style: 'greco-roman',
          workoutId: 'greco-phase-1-week-1-workout-a',
          completedAt: '2026-06-26T08:30:00.000Z',
          difficulty: 'good',
          note: null,
          completedDrillIds: [],
        },
      ],
      'greco-roman',
    );

    expect(fixture.nativeElement.textContent).toContain('Position and Movement');
    expect(fixture.nativeElement.textContent).toContain(
      'Supported dummy contact position',
    );
  });

  it('refreshes a cached detail view when style-qualified route parameters change', async () => {
    const { fixture, routeParams } = await setup('missing-workout', [
      {
        style: 'greco-roman',
        workoutId: 'greco-phase-1-week-1-workout-a',
        completedAt: '2026-06-26T08:30:00.000Z',
        difficulty: 'good',
        note: null,
        completedDrillIds: [],
      },
    ]);

    routeParams.next(
      convertToParamMap({
        style: 'greco-roman',
        workoutId: 'greco-phase-1-week-1-workout-a',
      }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Position and Movement');
  });
});
