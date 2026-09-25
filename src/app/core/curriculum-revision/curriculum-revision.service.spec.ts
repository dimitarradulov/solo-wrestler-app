// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TimerEndAlertService } from '../timers/timer-end-alert.service';
import { provideNgxLocalstorage } from 'ngx-localstorage';

import { OnboardingCompletionStore } from '../first-launch/onboarding-completion-store';
import { CurriculumRevisionService } from './curriculum-revision.service';
import { CompletedWorkoutLogStore } from '../../features/training/stores/completed-workout-log.store';
import { CurriculumStore } from '../../features/training/stores/curriculum.store';
import { WrestlingStyleStore } from '../../features/training/stores/wrestling-style.store';
import { WorkoutSessionStore } from '../../features/training/stores/workout-session.store';

const configureTrainingStores = (): void => {
  TestBed.configureTestingModule({
    providers: [
      provideNgxLocalstorage({ prefix: 'solo-wrestler', delimiter: '.' }),
      {
        provide: TimerEndAlertService,
        useValue: { playTimerEndAlert: async () => undefined },
      },
    ],
  });
};

describe('CurriculumRevisionService', () => {
  beforeEach(() => {
    localStorage.clear();
    configureTrainingStores();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('resets all legacy training state once while preserving onboarding', () => {
    localStorage.setItem(
      'solo-wrestler.curriculum.completed-workout-ids',
      JSON.stringify(['phase-1-week-1-workout-a']),
    );
    localStorage.setItem(
      'solo-wrestler.training.completed-workout-log',
      JSON.stringify([
        {
          workoutId: 'phase-1-week-1-workout-a',
          completedAt: '2026-09-25T10:00:00.000Z',
          difficulty: 'good',
          note: 'Legacy note',
          completedDrillIds: [],
        },
      ]),
    );
    localStorage.setItem('solo-wrestler.training.in-progress-workout', 'session');
    TestBed.inject(OnboardingCompletionStore).markComplete();
    localStorage.setItem('solo-wrestler.preferences.sound-enabled', 'false');

    const service = new CurriculumRevisionService();
    service.initialize();

    expect(service.shouldShowResetNotice()).toBe(true);
    expect(TestBed.inject(OnboardingCompletionStore).isComplete()).toBe(true);
    expect(TestBed.inject(CurriculumStore).currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-a',
    );
    expect(TestBed.inject(CompletedWorkoutLogStore).entries()).toHaveLength(0);
    expect(TestBed.inject(WorkoutSessionStore).hasInProgressWorkout()).toBe(
      false,
    );
    expect(localStorage.getItem('solo-wrestler.preferences.sound-enabled')).toBe(
      'false',
    );

    const curriculumStore = TestBed.inject(CurriculumStore);
    curriculumStore.setStyle('freestyle');
    curriculumStore.setWorkoutCompleted(
      'phase-1-week-1-workout-a',
      true,
    );
    service.initialize();
    expect(TestBed.inject(CurriculumStore).currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-b',
    );

    TestBed.resetTestingModule();
    configureTrainingStores();
    const restartedService = new CurriculumRevisionService();
    restartedService.initialize();
    expect(TestBed.inject(CurriculumStore).currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-b',
    );
    expect(restartedService.shouldShowResetNotice()).toBe(true);
  });

  it('does not show a reset notice on a fresh installation', () => {
    const service = new CurriculumRevisionService();
    service.initialize();

    expect(service.shouldShowResetNotice()).toBe(false);
    expect(TestBed.inject(CurriculumStore).currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-a',
    );
  });

  it('adds a missing style revision without resetting the other style', () => {
    const service = new CurriculumRevisionService();
    service.initialize();

    const curriculumStore = TestBed.inject(CurriculumStore);
    const logStore = TestBed.inject(CompletedWorkoutLogStore);
    curriculumStore.setStyle('freestyle');
    curriculumStore.setWorkoutCompleted(
      'phase-1-week-1-workout-a',
      true,
      'freestyle',
    );
    logStore.appendEntry({
      style: 'freestyle',
      workoutId: 'phase-1-week-1-workout-a',
      completedAt: '2026-09-25T10:00:00.000Z',
      difficulty: 'good',
      note: 'Kept note',
      completedDrillIds: [],
    });
    localStorage.removeItem(
      'solo-wrestler.curriculum.greco-roman.revision',
    );

    service.initialize();

    expect(service.shouldShowResetNotice()).toBe(false);
    expect(curriculumStore.currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-b',
    );
    expect(logStore.entries()).toEqual([
      expect.objectContaining({ style: 'freestyle', note: 'Kept note' }),
    ]);
  });

  it('announces a changed revision even when that style has no saved training', () => {
    new CurriculumRevisionService().initialize();
    localStorage.setItem(
      'solo-wrestler.curriculum.greco-roman.revision',
      'previous-greco-revision',
    );

    TestBed.resetTestingModule();
    configureTrainingStores();
    const service = new CurriculumRevisionService();
    service.initialize();

    expect(service.resetNoticeStyles()).toEqual(['greco-roman']);
    expect(service.resetNoticeMessage()).toContain('Greco-Roman');
    expect(TestBed.inject(CurriculumStore).currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-a',
    );
  });

  it('shows the notice until it is dismissed', () => {
    localStorage.setItem('solo-wrestler.training.completed-workout-log', '[]');
    const service = new CurriculumRevisionService();
    service.initialize();

    service.dismissResetNotice();

    expect(service.shouldShowResetNotice()).toBe(false);
    service.initialize();
    expect(service.shouldShowResetNotice()).toBe(false);

    const curriculumStore = TestBed.inject(CurriculumStore);
    curriculumStore.setStyle('freestyle');
    curriculumStore.setWorkoutCompleted(
      'phase-1-week-1-workout-a',
      true,
    );
    TestBed.resetTestingModule();
    configureTrainingStores();
    const restartedService = new CurriculumRevisionService();
    restartedService.initialize();

    expect(restartedService.shouldShowResetNotice()).toBe(false);
    expect(TestBed.inject(CurriculumStore).currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-b',
    );
  });

  it('resets only the changed style and preserves the selected style history', () => {
    const initialService = new CurriculumRevisionService();
    initialService.initialize();

    const curriculumStore = TestBed.inject(CurriculumStore);
    const logStore = TestBed.inject(CompletedWorkoutLogStore);
    const workoutSessionStore = TestBed.inject(WorkoutSessionStore);
    const styleStore = TestBed.inject(WrestlingStyleStore);
    styleStore.chooseStyle('freestyle');
    curriculumStore.setWorkoutCompleted(
      'phase-1-week-1-workout-a',
      true,
      'freestyle',
    );
    workoutSessionStore.startOrResumeCurrentWorkout();
    curriculumStore.setWorkoutCompleted(
      'greco-phase-1-week-1-workout-a',
      true,
      'greco-roman',
    );
    logStore.appendEntry({
      style: 'freestyle',
      workoutId: 'phase-1-week-1-workout-a',
      completedAt: '2026-09-25T10:00:00.000Z',
      difficulty: 'good',
      note: 'Freestyle note',
      completedDrillIds: [],
    });
    logStore.appendEntry({
      style: 'greco-roman',
      workoutId: 'greco-phase-1-week-1-workout-a',
      completedAt: '2026-09-25T11:00:00.000Z',
      difficulty: 'good',
      note: 'Greco note',
      completedDrillIds: [],
    });
    localStorage.setItem(
      'solo-wrestler.curriculum.greco-roman.revision',
      'previous-greco-revision',
    );

    TestBed.resetTestingModule();
    configureTrainingStores();
    const service = new CurriculumRevisionService();
    service.initialize();

    const restartedCurriculumStore = TestBed.inject(CurriculumStore);
    const restartedLogStore = TestBed.inject(CompletedWorkoutLogStore);
    const restartedStyleStore = TestBed.inject(WrestlingStyleStore);
    const restartedWorkoutSessionStore = TestBed.inject(WorkoutSessionStore);

    expect(restartedStyleStore.selectedStyle()).toBe('freestyle');
    expect(restartedCurriculumStore.currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-b',
    );
    expect(restartedLogStore.entries()).toEqual([
      expect.objectContaining({
        style: 'freestyle',
        note: 'Freestyle note',
      }),
    ]);
    expect(service.shouldShowResetNotice()).toBe(true);
    expect(service.resetNoticeStyles()).toEqual(['greco-roman']);
    expect(service.resetNoticeMessage()).toContain('Greco-Roman');
    expect(restartedWorkoutSessionStore.session()?.style).toBe('freestyle');
    expect(restartedWorkoutSessionStore.switchStyle('greco-roman')).toBe(false);

    restartedWorkoutSessionStore.cancelWorkout();
    expect(restartedWorkoutSessionStore.switchStyle('greco-roman')).toBe(true);
    expect(restartedCurriculumStore.currentWorkout()?.id).toBe(
      'greco-phase-1-week-1-workout-a',
    );
  });

  it('removes an unfinished workout when its owning style revision changes', () => {
    new CurriculumRevisionService().initialize();

    const curriculumStore = TestBed.inject(CurriculumStore);
    const workoutSessionStore = TestBed.inject(WorkoutSessionStore);
    curriculumStore.setStyle('greco-roman');
    curriculumStore.setWorkoutCompleted(
      'greco-phase-1-week-1-workout-a',
      true,
      'greco-roman',
    );
    workoutSessionStore.startOrResumeCurrentWorkout();
    localStorage.setItem(
      'solo-wrestler.curriculum.greco-roman.revision',
      'previous-greco-revision',
    );

    TestBed.resetTestingModule();
    configureTrainingStores();
    const service = new CurriculumRevisionService();
    service.initialize();

    const restartedCurriculumStore = TestBed.inject(CurriculumStore);
    const restartedWorkoutSessionStore = TestBed.inject(WorkoutSessionStore);
    expect(restartedCurriculumStore.style()).toBe('greco-roman');
    expect(restartedCurriculumStore.currentWorkout()?.id).toBe(
      'greco-phase-1-week-1-workout-a',
    );
    expect(restartedWorkoutSessionStore.hasInProgressWorkout()).toBe(false);
    expect(restartedWorkoutSessionStore.switchStyle('freestyle')).toBe(true);
    expect(service.resetNoticeStyles()).toEqual(['greco-roman']);
  });

  it('resets both changed styles once and preserves progress recorded afterward', () => {
    new CurriculumRevisionService().initialize();

    const curriculumStore = TestBed.inject(CurriculumStore);
    const logStore = TestBed.inject(CompletedWorkoutLogStore);
    const workoutSessionStore = TestBed.inject(WorkoutSessionStore);
    curriculumStore.setStyle('freestyle');
    curriculumStore.setWorkoutCompleted(
      'phase-1-week-1-workout-a',
      true,
      'freestyle',
    );
    curriculumStore.setWorkoutCompleted(
      'greco-phase-1-week-1-workout-a',
      true,
      'greco-roman',
    );
    workoutSessionStore.startOrResumeCurrentWorkout();
    logStore.appendEntry({
      style: 'freestyle',
      workoutId: 'phase-1-week-1-workout-a',
      completedAt: '2026-09-25T10:00:00.000Z',
      difficulty: 'good',
      note: 'Old Freestyle note',
      completedDrillIds: [],
    });
    logStore.appendEntry({
      style: 'greco-roman',
      workoutId: 'greco-phase-1-week-1-workout-a',
      completedAt: '2026-09-25T11:00:00.000Z',
      difficulty: 'good',
      note: 'Old Greco note',
      completedDrillIds: [],
    });
    localStorage.setItem(
      'solo-wrestler.curriculum.freestyle.revision',
      'previous-freestyle-revision',
    );
    localStorage.setItem(
      'solo-wrestler.curriculum.greco-roman.revision',
      'previous-greco-revision',
    );

    TestBed.resetTestingModule();
    configureTrainingStores();
    const service = new CurriculumRevisionService();
    service.initialize();

    const restartedCurriculumStore = TestBed.inject(CurriculumStore);
    const restartedLogStore = TestBed.inject(CompletedWorkoutLogStore);
    const restartedWorkoutSessionStore = TestBed.inject(WorkoutSessionStore);
    expect(service.resetNoticeStyles()).toEqual(['freestyle', 'greco-roman']);
    expect(service.resetNoticeMessage()).toContain('Freestyle and Greco-Roman');
    expect(restartedLogStore.entries()).toHaveLength(0);
    expect(restartedCurriculumStore.currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-a',
    );
    expect(restartedWorkoutSessionStore.hasInProgressWorkout()).toBe(false);

    service.dismissResetNotice();
    restartedCurriculumStore.setWorkoutCompleted(
      'phase-1-week-1-workout-a',
      true,
    );
    service.initialize();

    expect(service.shouldShowResetNotice()).toBe(false);
    expect(restartedCurriculumStore.currentWorkout()?.id).toBe(
      'phase-1-week-1-workout-b',
    );
  });
});
