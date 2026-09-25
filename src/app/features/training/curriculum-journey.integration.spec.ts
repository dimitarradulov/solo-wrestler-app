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
    expect(harness.routeNativeElement?.textContent).toContain('1 of 18');
    expect(harness.routeNativeElement?.textContent).toContain('Weeks 1–2: Practice individual positions and slow mechanics');

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
    expect(harness.routeNativeElement?.textContent).toContain('18 total workouts');
    expect(harness.routeNativeElement?.textContent).toContain('Contact and Control');
    expect(harness.routeNativeElement?.textContent).toContain('Connected Entries');
    expect(harness.routeNativeElement?.textContent).toContain('Progression Focus');
    expect(harness.routeNativeElement?.textContent).toContain('Weeks 1–2: Practice individual positions and slow mechanics');
    expect(harness.routeNativeElement?.textContent).toContain('Phase 2: Standing Control and Entries');
    expect(harness.routeNativeElement?.textContent).toContain('Outlined · not available');

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

    const completeCurrentWorkout = async (note?: string): Promise<string> => {
      const workoutId = curriculumStore.currentWorkout()?.id;
      if (workoutId === undefined) {
        throw new Error('The current Greco workout was not available to complete.');
      }

      workoutSessionStore.startOrResumeCurrentWorkout();
      await harness.navigateByUrl('/active-workout');
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
      if (note !== undefined) {
        completionPage.updateNote(note);
      }
      completionPage.saveWorkout();
      await harness.fixture.whenStable();

      return workoutId;
    };

    await harness.navigateByUrl('/tabs/curriculum');
    const initialCurriculum = harness.routeNativeElement;
    expect(initialCurriculum?.querySelectorAll('.curriculum-grid .curriculum-node--current')).toHaveLength(1);
    expect(initialCurriculum?.querySelectorAll('.curriculum-grid .curriculum-node--locked')).toHaveLength(17);
    expect(initialCurriculum?.querySelectorAll('.curriculum-grid .curriculum-node--completed')).toHaveLength(0);

    const workoutLabels = ['Workout A', 'Workout B', 'Workout C'];
    for (let sequence = 1; sequence <= 18; sequence++) {
      const weekNumber = Math.ceil(sequence / 3);
      const workoutLetter = String.fromCharCode(97 + ((sequence - 1) % 3));
      const expectedWorkoutId =
        `greco-phase-1-week-${weekNumber}-workout-${workoutLetter}`;
      const currentWorkout = curriculumStore.currentWorkout();

      expect(currentWorkout?.id).toBe(expectedWorkoutId);
      expect(currentWorkout?.label).toBe(workoutLabels[(sequence - 1) % 3]);
      await harness.navigateByUrl('/tabs/today');
      expect(harness.routeNativeElement?.textContent).toContain(`${sequence} of 18`);
      expect(harness.routeNativeElement?.textContent).toContain(currentWorkout?.title);
      if (weekNumber <= 2) {
        expect(harness.routeNativeElement?.textContent).toContain('Weeks 1–2: Practice individual positions and slow mechanics');
      } else if (weekNumber <= 4) {
        expect(harness.routeNativeElement?.textContent).toContain('Weeks 3–4: Connect movements and entries');
      } else {
        expect(harness.routeNativeElement?.textContent).toContain('Weeks 5–6: Practice consistent sequences from movement');
      }

      const workoutId = await completeCurrentWorkout(
        sequence === 1
          ? 'Controlled contact felt right.'
          : sequence === 18
            ? 'Week 6 sequence stayed balanced.'
            : undefined,
      );
      expect(workoutId).toBe(expectedWorkoutId);
      expect(logStore.entries()).toHaveLength(sequence);
      expect(logStore.entries().every((entry) => entry.style === 'greco-roman')).toBe(true);

      if (sequence === 1) {
        await harness.navigateByUrl('/tabs/curriculum');
        const workoutGrid = harness.routeNativeElement;
        expect(workoutGrid?.querySelectorAll('.curriculum-grid .curriculum-node--completed')).toHaveLength(1);
        expect(workoutGrid?.querySelectorAll('.curriculum-grid .curriculum-node--current')).toHaveLength(1);
        expect(workoutGrid?.querySelectorAll('.curriculum-grid .curriculum-node--locked')).toHaveLength(16);
      }

      if (sequence === 3 || sequence === 6 || sequence === 9 || sequence === 12 || sequence === 15) {
        const nextWeek = Math.ceil((sequence + 1) / 3);
        const nextId = `greco-phase-1-week-${nextWeek}-workout-a`;
        expect(curriculumStore.currentWorkout()?.id).toBe(nextId);
      }
      if (sequence === 17) {
        expect(curriculumStore.currentWorkout()?.id).toBe('greco-phase-1-week-6-workout-c');
      }
    }

    expect(curriculumStore.currentWorkout()).toBeNull();
    const firstEntry = logStore.entries().find((entry) => entry.workoutId === 'greco-phase-1-week-1-workout-a');
    const finalEntry = logStore.entries().find((entry) => entry.workoutId === 'greco-phase-1-week-6-workout-c');
    expect(firstEntry).toMatchObject({
      style: 'greco-roman',
      difficulty: 'good',
      note: 'Controlled contact felt right.',
    });
    expect(finalEntry).toMatchObject({
      style: 'greco-roman',
      difficulty: 'good',
      note: 'Week 6 sequence stayed balanced.',
    });

    await harness.navigateByUrl('/tabs/today');
    expect(harness.routeNativeElement?.textContent).toContain('Greco-Roman Foundations complete');
    expect(harness.routeNativeElement?.textContent).toContain('You completed all 18 Greco Foundations workouts');
    expect(harness.routeNativeElement?.textContent).toContain('Later phases are outlined and unavailable');
    expect(harness.routeNativeElement?.textContent).not.toContain('Start Workout');
    await harness.navigateByUrl('/tabs/curriculum');
    expect(harness.routeNativeElement?.querySelectorAll('.curriculum-grid .curriculum-node--completed')).toHaveLength(18);
    expect(harness.routeNativeElement?.querySelectorAll('.curriculum-grid .curriculum-node--current')).toHaveLength(0);
    expect(harness.routeNativeElement?.querySelectorAll('.curriculum-grid .curriculum-node--locked')).toHaveLength(0);
    expect(workoutSessionStore.switchStyle('freestyle')).toBe(true);
    expect(curriculumStore.currentWorkout()?.id).toBe('phase-1-week-1-workout-a');

    await harness.navigateByUrl('/tabs/progress');
    expect(harness.routeNativeElement?.textContent).toContain('No completed workouts yet');
    expect(workoutSessionStore.switchStyle('greco-roman')).toBe(true);
    await harness.navigateByUrl('/tabs/progress');
    expect(harness.routeNativeElement?.textContent).toContain('Connected Entries');
    expect(harness.routeNativeElement?.textContent).toContain('Workout C');

    const grecoWorkoutId = 'greco-phase-1-week-6-workout-c';
    await harness.navigateByUrl(
      `/completed-workouts/greco-roman/${grecoWorkoutId}`,
      CompletedWorkoutDetailPage,
    );
    expect(harness.routeNativeElement?.textContent).toContain('Underhook to slide-by and rear-control rehearsal');
    expect(harness.routeNativeElement?.textContent).toContain('Week 6 sequence stayed balanced.');
  });
});
