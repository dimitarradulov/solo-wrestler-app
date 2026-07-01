import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { CompletedWorkoutLogEntry } from '../../models/training-session.model';
import { CompletedWorkoutLogStore } from '../../stores/completed-workout-log.store';
import { CompletedWorkoutDetailPage } from './completed-workout-detail';

describe('CompletedWorkoutDetailPage', () => {
  const setup = async (
    workoutId: string,
    entries: CompletedWorkoutLogEntry[],
  ) => {
    await TestBed.configureTestingModule({
      imports: [CompletedWorkoutDetailPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ workoutId }),
            },
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

    return fixture;
  };

  it('renders the workout details, notes fallback, and drill list in template order', async () => {
    const completedAt = '2026-06-26T08:30:00.000Z';
    const fixture = await setup('phase-1-week-1-workout-a', [
      {
        workoutId: 'phase-1-week-1-workout-a',
        completedAt,
        difficulty: 'good',
        note: null,
        completedDrillIds: [
          'warm-up',
          'stance-and-motion',
          'level-change-drill',
          'penetration-step-drill',
          'shadow-double-leg',
          'dummy-finish',
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
      'Warm-up',
      'Stance and motion',
      'Level change drill',
      'Penetration step drill',
      'Shadow double leg',
      'Dummy finish',
    ]);
  });

  it('shows not found for stale workout ids and keeps the back action', async () => {
    const fixture = await setup('missing-workout', []);
    const backButton = fixture.nativeElement.querySelector(
      '.completed-workout-detail__back',
    ) as HTMLAnchorElement | HTMLButtonElement | null;

    expect(fixture.nativeElement.textContent).toContain(
      'Completed workout not found',
    );
    expect(backButton?.textContent).toContain('Back to Progress');
  });
});
