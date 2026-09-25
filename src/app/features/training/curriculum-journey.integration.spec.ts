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
import { WrestlingStyleStore } from './stores/wrestling-style.store';

describe('wrestling curricula routed journeys', () => {
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
      } else if (session.timer.status === 'running') {
        workoutSessionStore.tick();
      } else if (session.action !== null) {
        workoutSessionStore.performCurrentDrillAction();
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
      `/completed-workouts/freestyle/${workoutId}`,
      CompletedWorkoutDetailPage,
    );
    expect(harness.routeNativeElement?.textContent).toContain(
      'Controlled pace felt right.',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Cooldown');
  });

  it('onboards Greco, blocks switching for every unfinished state, and restores style-owned progress and history', async () => {
    let harness = await RouterTestingHarness.create('/intro');
    const continueButton = harness.routeNativeElement?.querySelector('ion-button');
    continueButton?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.textContent).toContain('Choose your curriculum');
    expect(harness.routeNativeElement?.textContent).toContain('Freestyle');
    expect(harness.routeNativeElement?.textContent).toContain('Greco-Roman');
    await harness.navigateByUrl('/safety-disclaimer?style=freestyle');
    expect(TestBed.inject(WrestlingStyleStore).selectedStyle()).toBe('freestyle');
    await harness.navigateByUrl('/choose-style');
    await harness.navigateByUrl('/safety-disclaimer?style=greco-roman');
    expect(harness.routeNativeElement?.textContent).toContain('Safety');

    const acknowledgeButton = harness.routeNativeElement?.querySelector('ion-button');
    acknowledgeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await harness.fixture.whenStable();
    await harness.navigateByUrl('/tabs/today');
    expect(harness.routeNativeElement?.textContent).toContain('Position and Movement');
    expect(harness.routeNativeElement?.textContent).toContain('1 of 1');

    let workoutSessionStore = TestBed.inject(WorkoutSessionStore);
    let curriculumStore = TestBed.inject(CurriculumStore);
    let logStore = TestBed.inject(CompletedWorkoutLogStore);
    workoutSessionStore.startOrResumeCurrentWorkout();
    workoutSessionStore.performCurrentDrillAction();
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(false);
    workoutSessionStore.pauseTimer();
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(false);
    expect(workoutSessionStore.hasInProgressWorkout()).toBe(true);

    await harness.navigateByUrl('/tabs/curriculum');
    const styleButtons = harness.routeNativeElement?.querySelectorAll('.curriculum-style ion-button');
    expect(Array.from(styleButtons ?? []).every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
    expect(harness.routeNativeElement?.textContent).toContain('Complete or cancel');
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular({}),
        provideRouter(routes),
        provideNgxLocalstorage({ prefix: 'solo-wrestler', delimiter: '.' }),
        { provide: TimerEndAlertService, useValue: { playTimerEndAlert: async () => undefined } },
      ],
    });
    harness = await RouterTestingHarness.create('/tabs/today');
    workoutSessionStore = TestBed.inject(WorkoutSessionStore);
    curriculumStore = TestBed.inject(CurriculumStore);
    logStore = TestBed.inject(CompletedWorkoutLogStore);
    expect(harness.routeNativeElement?.textContent).toContain('Position and Movement');
    expect(workoutSessionStore.hasInProgressWorkout()).toBe(true);
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(false);

    workoutSessionStore.cancelWorkout();
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(true);
    expect(curriculumStore.currentWorkout()?.id).toBe('phase-1-week-1-workout-a');
    expect(logStore.entries()).toHaveLength(0);
    await harness.navigateByUrl('/tabs/curriculum');
    expect(harness.routeNativeElement?.textContent).toContain('Movement and Entry Mechanics');
    await harness.navigateByUrl('/tabs/curriculum?style=greco-roman');
    expect(curriculumStore.currentWorkout()?.id).toBe('greco-phase-1-week-1-workout-a');
    await harness.navigateByUrl('/tabs/today');
    expect(harness.routeNativeElement?.textContent).toContain('Position and Movement');

    workoutSessionStore.startOrResumeCurrentWorkout();
    let iterations = 0;
    while (!workoutSessionStore.canFinishWorkout()) {
      if (iterations++ > 10000) {
        throw new Error('Greco workout did not reach completion.');
      }

      const session = workoutSessionStore.session();
      if (session === null) {
        throw new Error('Greco workout session disappeared during training.');
      }

      if (session.timer.phase === 'drill-rest') {
        workoutSessionStore.skipRest();
      } else if (session.timer.status === 'running') {
        workoutSessionStore.tick();
      } else if (session.action !== null) {
        workoutSessionStore.performCurrentDrillAction();
      } else {
        throw new Error(`Unexpected Greco timer state: ${session.timer.phase}`);
      }
    }

    const completionPage = await harness.navigateByUrl(
      '/workout-completion',
      WorkoutCompletionPage,
    );
    completionPage.selectDifficulty('good');
    completionPage.saveWorkout();
    expect(logStore.entries()[0]).toMatchObject({
      style: 'greco-roman',
      workoutId: 'greco-phase-1-week-1-workout-a',
    });
    expect(curriculumStore.currentWorkout()).toBeNull();
    await harness.navigateByUrl('/tabs/today');
    expect(harness.routeNativeElement?.textContent).toContain('Position and Movement complete');
    expect(harness.routeNativeElement?.textContent).toContain('Weeks 2–6 and workouts B/C are not available yet');
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(true);
    expect(curriculumStore.currentWorkout()?.id).toBe('phase-1-week-1-workout-a');

    await harness.navigateByUrl('/tabs/progress');
    expect(harness.routeNativeElement?.textContent).toContain('No completed workouts yet');
    expect(workoutSessionStore.switchStyle('greco-roman')).toBe(true);
    await harness.navigateByUrl('/tabs/progress');
    expect(harness.routeNativeElement?.textContent).toContain('Position and Movement');

    const grecoWorkoutId = 'greco-phase-1-week-1-workout-a';
    await harness.navigateByUrl(
      `/completed-workouts/greco-roman/${grecoWorkoutId}`,
      CompletedWorkoutDetailPage,
    );
    expect(harness.routeNativeElement?.textContent).toContain('Contact and grip preparation');
  });
});
