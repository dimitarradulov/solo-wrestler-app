import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideNgxLocalstorage } from 'ngx-localstorage';

import { routes } from '../../app.routes';
import { TimerEndAlertService } from '../../core/timers/timer-end-alert.service';
import { CompletedWorkoutDetailPage } from './pages/completed-workout-detail/completed-workout-detail';
import { WorkoutCompletionPage } from './pages/workout-completion/workout-completion';
import { CompletedWorkoutLogStore } from './stores/completed-workout-log.store';
import { CurriculumStore } from './stores/curriculum.store';
import { WorkoutSessionStore } from './stores/workout-session.store';

describe('freestyle Foundations routed journey', () => {
  const createStorage = (): Storage => {
    const values = new Map<string, string>();

    return {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => Array.from(values.keys())[index] ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    };
  };

  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorage(),
    });
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        provideRouter(routes),
        provideNgxLocalstorage({ prefix: 'solo-wrestler', delimiter: '.' }),
        {
          provide: TimerEndAlertService,
          useValue: { playTimerEndAlert: async () => undefined },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it('shows 18 sequential workouts, completes one through training, and resolves its Progress details', async () => {
    const harness = await RouterTestingHarness.create('/tabs/today');
    expect(harness.routeNativeElement?.textContent).toContain('1 of 18');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Movement and Entry Mechanics',
    );

    await harness.navigateByUrl('/tabs/curriculum');
    expect(harness.routeNativeElement?.textContent).toContain('Workout C');
    expect(harness.routeNativeElement?.textContent).toContain('Connected Attacks');

    const curriculumStore = TestBed.inject(CurriculumStore);
    const workoutSessionStore = TestBed.inject(WorkoutSessionStore);
    const completedWorkoutLogStore = TestBed.inject(CompletedWorkoutLogStore);

    await harness.navigateByUrl('/tabs/today');
    workoutSessionStore.startOrResumeCurrentWorkout();
    await harness.navigateByUrl('/active-workout');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Movement and Entry Mechanics',
    );

    let iterations = 0;
    while (!workoutSessionStore.canFinishWorkout()) {
      if (iterations++ > 10000) {
        throw new Error('Workout did not reach completion.');
      }

      const session = workoutSessionStore.session();
      if (session === null) {
        throw new Error('Workout session disappeared during training.');
      }

      if (session.timer.phase === 'drill-rest') {
        workoutSessionStore.skipRest();
      } else if (session.action !== null) {
        workoutSessionStore.performCurrentDrillAction();
      } else if (session.timer.phase === 'work') {
        workoutSessionStore.tick();
      } else {
        throw new Error(`Unexpected workout timer state: ${session.timer.phase}`);
      }
    }

    const workoutId = curriculumStore.currentWorkout()?.id;
    if (workoutId === undefined) {
      throw new Error('The current workout was not available to save.');
    }

    const completionPage = await harness.navigateByUrl(
      '/workout-completion',
      WorkoutCompletionPage,
    );
    completionPage.selectDifficulty('good');
    completionPage.updateNote('Controlled pace felt right.');
    completionPage.saveWorkout();

    expect(completedWorkoutLogStore.entries()[0]).toMatchObject({
      workoutId,
      difficulty: 'good',
      note: 'Controlled pace felt right.',
    });
    expect(curriculumStore.currentWorkout()?.label).toBe('Workout B');

    await harness.navigateByUrl('/tabs/progress');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Movement and Entry Mechanics',
    );
    await harness.navigateByUrl(
      `/completed-workouts/${workoutId}`,
      CompletedWorkoutDetailPage,
    );
    expect(harness.routeNativeElement?.textContent).toContain(
      'Controlled pace felt right.',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Cooldown');
  });
});
