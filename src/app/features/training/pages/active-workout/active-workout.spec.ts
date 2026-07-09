import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';

import { InProgressWorkout } from '../../models/training-session.model';
import {
  CurriculumPhase,
  WorkoutInstance,
  WorkoutTemplate,
} from '../../models/curriculum.model';
import { ActiveWorkoutPage } from './active-workout';
import { WorkoutCancellationService } from '../../services/workout-cancellation.service';
import { TechniqueVideoPlayerService } from '../../../../core/video/technique-video-player.service';
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import {
  buildTechniqueVideoEmbedUrl,
  extractYouTubeVideoId,
} from '../../../../core/video/technique-video-url';

describe('ActiveWorkoutPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value:
        originalMatchMedia ??
        vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });

    TestBed.resetTestingModule();
  });

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
        videoUrl: 'https://www.youtube.com/watch?v=levelChange123',
        videoNote: 'Only use the level-change section.',
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

  const createInProgressWorkout = (): InProgressWorkout => ({
    workoutId: workout.id,
    workoutTemplateId: workoutTemplate.id,
    workoutLabel: workout.label,
    workoutTitle: workout.title,
    weekNumber: workout.weekNumber,
    drillIds: workoutTemplate.drills.map((drill) => drill.id),
    completedDrillIds: [],
    currentDrillIndex: 0,
    timer: {
      phase: 'idle',
      status: 'stopped',
      remainingSeconds: null,
      roundNumber: null,
      totalRounds: null,
    },
    restSeconds: 120,
  });

  const setup = async (
    inProgressWorkout = signal<InProgressWorkout | null>(
      createInProgressWorkout(),
    ),
    options: { waitForStable?: boolean } = {},
  ) => {
    const startOrResumeWorkout = vi.fn(() => inProgressWorkout());
    const markCurrentDrillComplete = vi.fn();
    const skipRest = vi.fn();
    const addRestSeconds = vi.fn();
    const startCurrentTimer = vi.fn();
    const tickCurrentTimer = vi.fn();
    const pauseCurrentTimer = vi.fn();
    const resumeCurrentTimer = vi.fn();
    const resetCurrentTimer = vi.fn();
    const clear = vi.fn(() => inProgressWorkout.set(null));
    const cancelWorkoutConfirmationOpen = signal(false);
    const requestCancelWorkout = vi.fn().mockResolvedValue(undefined);
    const confirmWorkoutCancellation = vi.fn().mockResolvedValue(false);
    const cancelWorkout = vi.fn();
    const keepTraining = vi.fn();
    const confirmCancelWorkout = vi.fn();
    const dismissCancelWorkoutConfirmation = vi.fn();
    const webEmbedUrl = signal<string | null>(null);
    const webVideoNote = signal<string | null>(null);
    const isWebModalOpen = computed(() => webEmbedUrl() !== null);
    const openTechniqueVideo = vi.fn(
      async (videoUrl: string, videoNote?: string) => {
        const videoId = extractYouTubeVideoId(videoUrl);

        if (videoId !== null) {
          webEmbedUrl.set(buildTechniqueVideoEmbedUrl(videoId));
          webVideoNote.set(videoNote ?? null);
        }
      },
    );
    const closeWebModal = vi.fn(() => {
      webEmbedUrl.set(null);
      webVideoNote.set(null);
    });
    const session = computed(() => {
      const current = inProgressWorkout();

      if (current === null) {
        return null;
      }

      const currentDrill =
        workoutTemplate.drills[current.currentDrillIndex] ?? null;
      const completedIds = new Set(current.completedDrillIds);
      const drills = workoutTemplate.drills.map((drill, drillIndex) => ({
        drill,
        drillIndex,
        state: completedIds.has(drill.id)
          ? 'completed'
          : current.timer.phase === 'drill-rest'
            ? 'queued'
            : drillIndex === current.currentDrillIndex
              ? 'current'
              : 'queued',
      }));

      return {
        workout,
        workoutTemplate,
        phaseTitle: phase.title,
        progressionFocus: phase.weeks[0]?.progressionFocus ?? null,
        completedDrillCount: current.completedDrillIds.length,
        currentDrillIndex: current.currentDrillIndex,
        currentDrill,
        drills,
        timer: current.timer,
        action: null,
        canFinish:
          current.completedDrillIds.length === workoutTemplate.drills.length,
      };
    });
    const drillCards = computed(() => {
      const current = inProgressWorkout();

      return workoutTemplate.drills.map((drill, drillIndex) => ({
        drill,
        drillIndex,
        state: current?.completedDrillIds.includes(drill.id)
          ? 'completed'
          : current?.timer.phase === 'drill-rest'
            ? 'queued'
            : drillIndex === (current?.currentDrillIndex ?? 0)
              ? 'current'
              : 'queued',
        stateLabel: current?.completedDrillIds.includes(drill.id)
          ? 'Complete'
          : current?.timer.phase === 'drill-rest'
            ? 'Queued'
            : drillIndex === (current?.currentDrillIndex ?? 0)
              ? 'Current'
              : 'Queued',
        typeLabel:
          drill.type === 'reps'
            ? 'Reps'
            : drill.type === 'duration'
              ? 'Duration'
              : 'Rounds',
        meta:
          drill.prescription ??
          (drill.type === 'duration'
            ? `${Math.floor((drill.durationConfig?.durationSeconds ?? 0) / 60)} min`
            : drill.type === 'rounds'
              ? `${drill.roundsConfig?.rounds ?? 0} rounds`
              : null),
        coreTechnique: drill.coreTechnique ?? drill.title,
        actionEnabled:
          drillIndex === current?.currentDrillIndex &&
          current.timer.phase !== 'drill-rest' &&
          current.timer.phase !== 'round-rest',
        actionLabel:
          drill.type === 'reps' ||
          (drillIndex === current?.currentDrillIndex &&
            current.timer.status === 'finished')
            ? 'Mark Complete'
            : 'Start',
        actionIcon:
          drill.type !== 'reps' &&
          drillIndex === current?.currentDrillIndex &&
          current.timer.status === 'finished'
            ? 'checkmark-circle-outline'
            : drill.type === 'reps'
              ? 'checkmark-circle-outline'
              : 'play-outline',
        timerLabel:
          drill.type === 'rounds'
            ? `Round ${current?.timer.roundNumber ?? 1} of ${current?.timer.totalRounds ?? 3}`
            : 'Work timer',
        timerClock:
          drillIndex === current?.currentDrillIndex &&
          current.timer.phase !== 'drill-rest' &&
          current.timer.remainingSeconds !== null
            ? `${Math.floor(current.timer.remainingSeconds / 60)}:${String(current.timer.remainingSeconds % 60).padStart(2, '0')}`
            : drill.type === 'duration'
              ? '3:00'
              : drill.type === 'rounds'
                ? '1:00'
                : '0:00',
        showTimerPreview: drill.type === 'duration' || drill.type === 'rounds',
        showTimerControls:
          drillIndex === current?.currentDrillIndex &&
          (drill.type === 'duration' || drill.type === 'rounds') &&
          current.timer.phase !== 'drill-rest',
        restText: drill.type === 'rounds' ? 'Rest 0:30' : '2 min default rest',
      }));
    });
    const restPanel = computed(() => {
      const current = inProgressWorkout();

      if (current?.timer.phase !== 'drill-rest') {
        return null;
      }

      return {
        afterDrillIndex: current.currentDrillIndex - 1,
        clock: `${Math.floor((current.timer.remainingSeconds ?? 0) / 60)}:${String((current.timer.remainingSeconds ?? 0) % 60).padStart(2, '0')}`,
      };
    });

    await TestBed.configureTestingModule({
      imports: [ActiveWorkoutPage],
      providers: [
        provideIonicAngular({}),
        provideRouter([]),
        {
          provide: WorkoutSessionStore,
          useValue: {
            session,
            currentWorkout: computed(() => session()?.workout ?? null),
            currentWorkoutTemplate: computed(
              () => session()?.workoutTemplate ?? null,
            ),
            completedDrillCount: computed(
              () => session()?.completedDrillCount ?? 0,
            ),
            currentDrillTitle: computed(
              () => session()?.currentDrill?.title ?? 'None',
            ),
            drillCards,
            restPanel,
            canFinishWorkout: computed(() => session()?.canFinish ?? false),
            estimatedMinutes: computed(() => '25-30 min'),
            progressionFocus: computed(
              () => phase.weeks[0]?.progressionFocus ?? null,
            ),
            phaseTitle: computed(() => phase.title),
            startOrResumeCurrentWorkout: startOrResumeWorkout,
            performCurrentDrillAction: vi.fn(() => {
              const current = inProgressWorkout();
              const currentDrill =
                current === null
                  ? null
                  : (workoutTemplate.drills[current.currentDrillIndex] ?? null);

              if (
                currentDrill?.type === 'reps' ||
                current?.timer.status === 'finished'
              ) {
                markCurrentDrillComplete();
                return;
              }

              startCurrentTimer();
            }),
            skipRest,
            addRest: addRestSeconds,
            tick: tickCurrentTimer,
            pauseTimer: pauseCurrentTimer,
            resumeTimer: resumeCurrentTimer,
            resetTimer: resetCurrentTimer,
            cancelWorkout: clear,
          },
        },
        {
          provide: WorkoutCancellationService,
          useValue: {
            isCancelWorkoutConfirmationOpen: cancelWorkoutConfirmationOpen,
            requestCancelWorkout,
            confirmWorkoutCancellation,
            cancelWorkout,
            keepTraining,
            confirmCancelWorkout,
            dismissCancelWorkoutConfirmation,
          },
        },
        {
          provide: TechniqueVideoPlayerService,
          useValue: {
            webEmbedUrl,
            webVideoNote,
            isWebModalOpen,
            open: openTechniqueVideo,
            closeWebModal,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ActiveWorkoutPage);
    const shouldWaitForStable =
      (options.waitForStable ?? true) &&
      inProgressWorkout()?.timer.status !== 'running';

    fixture.detectChanges();
    if (shouldWaitForStable) {
      await fixture.whenStable();
    }

    return {
      fixture,
      inProgressWorkout,
      startOrResumeWorkout,
      markCurrentDrillComplete,
      skipRest,
      addRestSeconds,
      startCurrentTimer,
      tickCurrentTimer,
      pauseCurrentTimer,
      resumeCurrentTimer,
      resetCurrentTimer,
      clear,
      cancelWorkoutConfirmationOpen,
      requestCancelWorkout,
      keepTraining,
      confirmCancelWorkout,
      dismissCancelWorkoutConfirmation,
      openTechniqueVideo,
      closeWebModal,
    };
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
    ).toEqual([['Duration', '25-30 min']]);
  });

  it('focuses the workout main on entry without adding it to the tab order', async () => {
    const { fixture } = await setup();
    const workoutMain = fixture.nativeElement.querySelector(
      'main',
    ) as HTMLElement;
    const focus = vi.spyOn(workoutMain, 'focus');

    fixture.componentInstance.ionViewDidEnter();

    expect(focus).toHaveBeenCalledTimes(1);
    expect(workoutMain.tabIndex).toBe(-1);
  });

  it('shows a cancel workout control on the workout screen', async () => {
    const { fixture, requestCancelWorkout } = await setup();
    const cancelButton = fixture.nativeElement.querySelector(
      '.cancel-workout-trigger',
    ) as HTMLElement | null;

    expect(cancelButton).not.toBeNull();
    expect(cancelButton?.getAttribute('aria-label')).toBe('Cancel workout');

    cancelButton?.click();

    expect(requestCancelWorkout).toHaveBeenCalledTimes(1);
  });

  it('delegates cancellation modal actions to the facade', async () => {
    const {
      cancelWorkoutConfirmationOpen,
      confirmCancelWorkout,
      dismissCancelWorkoutConfirmation,
      fixture,
      keepTraining,
    } = await setup();

    cancelWorkoutConfirmationOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.isCancelWorkoutConfirmationOpen()).toBe(
      true,
    );
    fixture.componentInstance.keepTraining();
    fixture.componentInstance.confirmCancelWorkout();
    fixture.componentInstance.dismissCancelWorkoutConfirmation();

    expect(keepTraining).toHaveBeenCalledTimes(1);
    expect(confirmCancelWorkout).toHaveBeenCalledTimes(1);
    expect(dismissCancelWorkoutConfirmation).toHaveBeenCalledTimes(1);
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
      normalizeText(cards[0].querySelector('.tech span')?.textContent),
    ).toBe('Core technique');
    expect(
      normalizeText(cards[0].querySelector('.tech strong')?.textContent),
    ).toBe('Level change drill');
    expect(
      normalizeText(cards[1].querySelector('.tech strong')?.textContent),
    ).toBe('Stance and motion');
    expect(
      normalizeText(cards[0].querySelector('.cue span')?.textContent),
    ).toBe('Cue');
    expect(normalizeText(cards[0].querySelector('.cue p')?.textContent)).toBe(
      'Drop your hips and stay tall.',
    );
    expect(fixture.nativeElement.querySelectorAll('.video')).toHaveLength(3);
  });

  it('opens an in-app technique video target from Watch', async () => {
    const { fixture, openTechniqueVideo } = await setup();
    const watchButton = fixture.nativeElement.querySelector(
      '.video',
    ) as HTMLButtonElement;

    watchButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(openTechniqueVideo).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=levelChange123',
      'Only use the level-change section.',
    );
  });

  it('pauses a running timer before opening a technique video and resumes it after close', async () => {
    const inProgressWorkout = signal<InProgressWorkout | null>({
      workoutId: workout.id,
      workoutTemplateId: workoutTemplate.id,
      workoutLabel: workout.label,
      workoutTitle: workout.title,
      weekNumber: workout.weekNumber,
      drillIds: workoutTemplate.drills.map((drill) => drill.id),
      completedDrillIds: [],
      currentDrillIndex: 1,
      timer: {
        phase: 'work',
        status: 'running',
        remainingSeconds: 180,
        roundNumber: null,
        totalRounds: null,
      },
      restSeconds: 120,
    });
    const { fixture, pauseCurrentTimer, resumeCurrentTimer } =
      await setup(inProgressWorkout);

    await fixture.componentInstance.openTechniqueVideo(
      workoutTemplate.drills[0]!,
    );

    expect(pauseCurrentTimer).toHaveBeenCalledTimes(1);
    expect(resumeCurrentTimer).toHaveBeenCalledTimes(1);
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
      normalizeText(cards[1].querySelector('.timer strong')?.textContent),
    ).toBe('3:00');
    expect(normalizeText(cards[2].textContent)).toContain('Start');
    expect(
      normalizeText(cards[2].querySelector('.timer span')?.textContent),
    ).toBe('Round 1 of 3');
    expect(
      normalizeText(cards[2].querySelector('.timer strong')?.textContent),
    ).toBe('1:00');
    expect(normalizeText(cards[2].textContent)).toContain('Rest 0:30');
  });

  it('starts the current workout and renders progress from stored state', async () => {
    const inProgressWorkout = signal<InProgressWorkout | null>({
      workoutId: workout.id,
      workoutTemplateId: workoutTemplate.id,
      workoutLabel: workout.label,
      workoutTitle: workout.title,
      weekNumber: workout.weekNumber,
      drillIds: workoutTemplate.drills.map((drill) => drill.id),
      completedDrillIds: [],
      currentDrillIndex: 0,
      timer: {
        phase: 'idle' as const,
        status: 'stopped' as const,
        remainingSeconds: null,
        roundNumber: null,
        totalRounds: null,
      },
      restSeconds: 120,
    });
    const { fixture, startOrResumeWorkout } = await setup(inProgressWorkout);
    const cards = fixture.nativeElement.querySelectorAll('.card');
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(startOrResumeWorkout).toHaveBeenCalledTimes(1);
    expect(text).toContain('0 of 3 drills complete');
    expect(text).toContain('Current: Level change drill');
    expect(cards[0].classList).toContain('cur');
    expect(cards[1].classList).toContain('queue');
    expect(cards[2].classList).toContain('queue');
    expect(normalizeText(cards[0].textContent)).toContain('Current');
    expect(normalizeText(cards[1].textContent)).toContain('Queued');
    expect(normalizeText(cards[2].textContent)).toContain('Queued');
    expect(
      cards[0].querySelector('.action-button:not([disabled])'),
    ).not.toBeNull();
    expect(cards[1].querySelector('.action-button:not([disabled])')).toBeNull();
    expect(cards[2].querySelector('.action-button:not([disabled])')).toBeNull();
  });

  it('does not allow queued drills to be completed', async () => {
    const { fixture, markCurrentDrillComplete } = await setup(
      signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [],
        currentDrillIndex: 0,
        timer: {
          phase: 'idle',
          status: 'stopped',
          remainingSeconds: null,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      }),
    );
    const cards = fixture.nativeElement.querySelectorAll('.card');

    expect(cards[1].querySelector('.action-button:not([disabled])')).toBeNull();
    expect(cards[2].querySelector('.action-button:not([disabled])')).toBeNull();
    expect(markCurrentDrillComplete).not.toHaveBeenCalled();
  });

  it('resumes an existing workout and shows the current stored drill title', async () => {
    const { fixture } = await setup(
      signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [workoutTemplate.drills[0].id],
        currentDrillIndex: 1,
        timer: {
          phase: 'idle',
          status: 'stopped',
          remainingSeconds: 180,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      }),
    );
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('1 of 3 drills complete');
    expect(text).toContain('Current: Stance motion');
  });

  it('marks the current reps drill complete and shows between-drill rest', async () => {
    const inProgressWorkout = signal<InProgressWorkout | null>({
      workoutId: workout.id,
      workoutTemplateId: workoutTemplate.id,
      workoutLabel: workout.label,
      workoutTitle: workout.title,
      weekNumber: workout.weekNumber,
      drillIds: workoutTemplate.drills.map((drill) => drill.id),
      completedDrillIds: [],
      currentDrillIndex: 0,
      timer: {
        phase: 'idle',
        status: 'stopped',
        remainingSeconds: null,
        roundNumber: null,
        totalRounds: null,
      },
      restSeconds: 120,
    });
    const { fixture, markCurrentDrillComplete } =
      await setup(inProgressWorkout);

    markCurrentDrillComplete.mockImplementation(() => {
      inProgressWorkout.set({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [workoutTemplate.drills[0].id],
        currentDrillIndex: 1,
        timer: {
          phase: 'drill-rest',
          status: 'paused',
          remainingSeconds: 120,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      });
    });

    (
      fixture.nativeElement.querySelector('.action-button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const cards = fixture.nativeElement.querySelectorAll('.card');
    const drillItems = fixture.nativeElement.querySelectorAll('.drill-item');
    const restPanel = fixture.nativeElement.querySelector('.rest-panel');
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(markCurrentDrillComplete).toHaveBeenCalled();
    expect(text).toContain('1 of 3 drills complete');
    expect(text).toContain('Rest');
    expect(text).toContain('2:00');
    expect(text).toContain('Skip Rest');
    expect(text).toContain('+30 sec');
    expect(cards[0].classList).toContain('done');
    expect(cards[1].classList).toContain('queue');
    expect(cards[2].classList).toContain('queue');
    expect(normalizeText(cards[0].textContent)).toContain('Complete');
    expect(normalizeText(cards[1].textContent)).toContain('Queued');
    expect(normalizeText(cards[2].textContent)).toContain('Queued');
    expect(
      normalizeText(cards[1].querySelector('.timer strong')?.textContent),
    ).toBe('3:00');
    expect(restPanel).not.toBeNull();
    expect(drillItems[0].querySelector('.card.done + .rest-panel')).toBe(
      restPanel,
    );
    expect(drillItems[1].querySelector('.rest-panel')).toBeNull();
  });

  it('wires the between-drill rest controls to the store', async () => {
    const inProgressWorkout = signal<InProgressWorkout | null>({
      workoutId: workout.id,
      workoutTemplateId: workoutTemplate.id,
      workoutLabel: workout.label,
      workoutTitle: workout.title,
      weekNumber: workout.weekNumber,
      drillIds: workoutTemplate.drills.map((drill) => drill.id),
      completedDrillIds: [workoutTemplate.drills[0].id],
      currentDrillIndex: 1,
      timer: {
        phase: 'drill-rest',
        status: 'paused',
        remainingSeconds: 120,
        roundNumber: null,
        totalRounds: null,
      },
      restSeconds: 120,
    });
    const { fixture, addRestSeconds, skipRest } =
      await setup(inProgressWorkout);
    const buttons = fixture.nativeElement.querySelectorAll(
      '.rest-panel ion-button',
    ) as NodeListOf<HTMLElement>;

    buttons[1].click();
    buttons[0].click();

    expect(addRestSeconds).toHaveBeenCalledWith(30);
    expect(skipRest).toHaveBeenCalled();
  });

  it('uses the stored duration timer state and timer controls for the current drill', async () => {
    const { fixture, pauseCurrentTimer, resetCurrentTimer, startCurrentTimer } =
      await setup(
        signal<InProgressWorkout | null>({
          workoutId: workout.id,
          workoutTemplateId: workoutTemplate.id,
          workoutLabel: workout.label,
          workoutTitle: workout.title,
          weekNumber: workout.weekNumber,
          drillIds: workoutTemplate.drills.map((drill) => drill.id),
          completedDrillIds: [workoutTemplate.drills[0].id],
          currentDrillIndex: 1,
          timer: {
            phase: 'work',
            status: 'paused',
            remainingSeconds: 125,
            roundNumber: null,
            totalRounds: null,
          },
          restSeconds: 120,
        }),
      );
    const cards = fixture.nativeElement.querySelectorAll('.card');
    const durationCard = cards[1] as HTMLElement;
    const timerButtons = durationCard.querySelectorAll(
      '.timer .controls ion-button',
    ) as NodeListOf<HTMLElement>;
    const actionButton = durationCard.querySelector(
      '.action-button',
    ) as HTMLButtonElement;

    expect(
      normalizeText(durationCard.querySelector('.timer strong')?.textContent),
    ).toBe('2:05');
    expect(
      normalizeText(durationCard.querySelector('.timer span')?.textContent),
    ).toBe('Work timer');
    expect(normalizeText(actionButton.textContent)).toContain('Start');

    actionButton.click();
    timerButtons[0].click();
    timerButtons[1].click();

    expect(startCurrentTimer).toHaveBeenCalled();
    expect(pauseCurrentTimer).toHaveBeenCalled();
    expect(resetCurrentTimer).toHaveBeenCalled();
  });

  it('uses the stored rounds timer state and timer controls for the current drill', async () => {
    const { fixture, pauseCurrentTimer, resetCurrentTimer, startCurrentTimer } =
      await setup(
        signal<InProgressWorkout | null>({
          workoutId: workout.id,
          workoutTemplateId: workoutTemplate.id,
          workoutLabel: workout.label,
          workoutTitle: workout.title,
          weekNumber: workout.weekNumber,
          drillIds: workoutTemplate.drills.map((drill) => drill.id),
          completedDrillIds: [
            workoutTemplate.drills[0].id,
            workoutTemplate.drills[1].id,
          ],
          currentDrillIndex: 2,
          timer: {
            phase: 'work',
            status: 'paused',
            remainingSeconds: 45,
            roundNumber: 2,
            totalRounds: 3,
          },
          restSeconds: 120,
        }),
      );
    const cards = fixture.nativeElement.querySelectorAll('.card');
    const roundsCard = cards[2] as HTMLElement;
    const timerButtons = roundsCard.querySelectorAll(
      '.timer .controls ion-button',
    ) as NodeListOf<HTMLElement>;
    const actionButton = roundsCard.querySelector(
      '.action-button',
    ) as HTMLButtonElement;

    expect(
      normalizeText(roundsCard.querySelector('.timer strong')?.textContent),
    ).toBe('0:45');
    expect(
      normalizeText(roundsCard.querySelector('.timer span')?.textContent),
    ).toBe('Round 2 of 3');
    expect(normalizeText(actionButton.textContent)).toContain('Start');

    actionButton.click();
    timerButtons[0].click();
    timerButtons[1].click();

    expect(startCurrentTimer).toHaveBeenCalled();
    expect(pauseCurrentTimer).toHaveBeenCalled();
    expect(resetCurrentTimer).toHaveBeenCalled();
  });

  it('disables the rounds action button during between-round rest', async () => {
    const { fixture } = await setup(
      signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [
          workoutTemplate.drills[0].id,
          workoutTemplate.drills[1].id,
        ],
        currentDrillIndex: 2,
        timer: {
          phase: 'round-rest',
          status: 'paused',
          remainingSeconds: 20,
          roundNumber: 1,
          totalRounds: 3,
        },
        restSeconds: 120,
      }),
    );
    const cards = fixture.nativeElement.querySelectorAll('.card');
    const roundsCard = cards[2] as HTMLElement;

    expect(
      normalizeText(roundsCard.querySelector('.timer strong')?.textContent),
    ).toBe('0:20');
    expect(
      normalizeText(roundsCard.querySelector('.timer span')?.textContent),
    ).toBe('Round 1 of 3');
    expect(
      roundsCard.querySelector('.action-button:not([disabled])'),
    ).toBeNull();
  });

  it('ticks a running duration timer every second while the page is active', async () => {
    vi.useFakeTimers();

    try {
      const inProgressWorkout = signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [workoutTemplate.drills[0].id],
        currentDrillIndex: 1,
        timer: {
          phase: 'idle',
          status: 'stopped',
          remainingSeconds: 125,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      });
      const { fixture, startCurrentTimer, tickCurrentTimer } =
        await setup(inProgressWorkout);
      const durationCard = fixture.nativeElement.querySelectorAll('.card')[1];
      const actionButton = durationCard.querySelector(
        '.action-button',
      ) as HTMLButtonElement;

      startCurrentTimer.mockImplementation(() => {
        const currentWorkout = inProgressWorkout();

        if (currentWorkout === null) {
          return;
        }

        inProgressWorkout.set({
          ...currentWorkout,
          timer: {
            ...currentWorkout.timer,
            phase: 'work',
            status: 'running',
          },
        });
      });
      tickCurrentTimer.mockImplementation(() => {
        const currentWorkout = inProgressWorkout();

        if (
          currentWorkout === null ||
          currentWorkout.timer.remainingSeconds === null
        ) {
          return;
        }

        inProgressWorkout.set({
          ...currentWorkout,
          timer: {
            ...currentWorkout.timer,
            phase: 'work',
            status: 'running',
            remainingSeconds: currentWorkout.timer.remainingSeconds - 1,
          },
        });
      });

      actionButton.click();
      fixture.detectChanges();

      await vi.advanceTimersByTimeAsync(2000);
      fixture.detectChanges();

      expect(startCurrentTimer).toHaveBeenCalled();
      expect(tickCurrentTimer).toHaveBeenCalledTimes(2);
      expect(
        normalizeText(durationCard.querySelector('.timer strong')?.textContent),
      ).toBe('2:03');
    } finally {
      TestBed.resetTestingModule();
      vi.useRealTimers();
    }
  });

  it('ticks a running round-rest timer every second while the page is active', async () => {
    vi.useFakeTimers();

    try {
      const inProgressWorkout = signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [
          workoutTemplate.drills[0].id,
          workoutTemplate.drills[1].id,
        ],
        currentDrillIndex: 2,
        timer: {
          phase: 'round-rest',
          status: 'running',
          remainingSeconds: 20,
          roundNumber: 1,
          totalRounds: 3,
        },
        restSeconds: 120,
      });
      const { tickCurrentTimer } = await setup(inProgressWorkout);

      await vi.advanceTimersByTimeAsync(3000);

      expect(tickCurrentTimer).toHaveBeenCalledTimes(3);
    } finally {
      TestBed.resetTestingModule();
      vi.useRealTimers();
    }
  });

  it('pauses the current timer when pauseRunningTimer is invoked', async () => {
    const { fixture, pauseCurrentTimer } = await setup();

    (
      fixture.componentInstance as unknown as {
        pauseRunningTimer: () => void;
      }
    ).pauseRunningTimer();

    expect(pauseCurrentTimer).toHaveBeenCalledTimes(1);
  });

  it('pauses a running timer when the page is leaving', async () => {
    vi.useFakeTimers();

    try {
      const inProgressWorkout = signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [workoutTemplate.drills[0].id],
        currentDrillIndex: 1,
        timer: {
          phase: 'work',
          status: 'running',
          remainingSeconds: 125,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      });
      const { fixture, pauseCurrentTimer } = await setup(inProgressWorkout);

      pauseCurrentTimer.mockImplementation(() => {
        const currentWorkout = inProgressWorkout();

        if (currentWorkout === null) {
          return;
        }

        inProgressWorkout.set({
          ...currentWorkout,
          timer: {
            ...currentWorkout.timer,
            status: 'paused',
          },
        });
      });

      fixture.componentInstance.ionViewWillLeave();
      fixture.detectChanges();

      expect(pauseCurrentTimer).toHaveBeenCalledTimes(1);
    } finally {
      TestBed.resetTestingModule();
      vi.useRealTimers();
    }
  });

  it('pauses a running timer when the page is destroyed', async () => {
    vi.useFakeTimers();

    try {
      const inProgressWorkout = signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [workoutTemplate.drills[0].id],
        currentDrillIndex: 1,
        timer: {
          phase: 'work',
          status: 'running',
          remainingSeconds: 125,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      });
      const { fixture, pauseCurrentTimer } = await setup(inProgressWorkout);

      pauseCurrentTimer.mockImplementation(() => {
        const currentWorkout = inProgressWorkout();

        if (currentWorkout === null) {
          return;
        }

        inProgressWorkout.set({
          ...currentWorkout,
          timer: {
            ...currentWorkout.timer,
            status: 'paused',
          },
        });
      });

      fixture.destroy();

      expect(pauseCurrentTimer).toHaveBeenCalledTimes(1);
    } finally {
      TestBed.resetTestingModule();
      vi.useRealTimers();
    }
  });

  it('ticks between-drill rest every second and returns to the next drill idle state', async () => {
    vi.useFakeTimers();

    try {
      const inProgressWorkout = signal<InProgressWorkout | null>({
        workoutId: workout.id,
        workoutTemplateId: workoutTemplate.id,
        workoutLabel: workout.label,
        workoutTitle: workout.title,
        weekNumber: workout.weekNumber,
        drillIds: workoutTemplate.drills.map((drill) => drill.id),
        completedDrillIds: [workoutTemplate.drills[0].id],
        currentDrillIndex: 1,
        timer: {
          phase: 'drill-rest',
          status: 'running',
          remainingSeconds: 2,
          roundNumber: null,
          totalRounds: null,
        },
        restSeconds: 120,
      });
      const { fixture, tickCurrentTimer } = await setup(inProgressWorkout);

      tickCurrentTimer.mockImplementation(() => {
        const currentWorkout = inProgressWorkout();

        if (
          currentWorkout === null ||
          currentWorkout.timer.remainingSeconds === null
        ) {
          return;
        }

        const nextRemainingSeconds = currentWorkout.timer.remainingSeconds - 1;

        inProgressWorkout.set({
          ...currentWorkout,
          timer:
            nextRemainingSeconds === 0
              ? {
                  phase: 'idle',
                  status: 'stopped',
                  remainingSeconds: 180,
                  roundNumber: null,
                  totalRounds: null,
                }
              : {
                  ...currentWorkout.timer,
                  remainingSeconds: nextRemainingSeconds,
                },
        });
      });

      expect(normalizeText(fixture.nativeElement.textContent)).toContain(
        '0:02',
      );

      await vi.advanceTimersByTimeAsync(2000);
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('.card');
      const text = normalizeText(fixture.nativeElement.textContent);

      expect(tickCurrentTimer).toHaveBeenCalledTimes(2);
      expect(text).not.toContain('Skip Rest');
      expect(text).not.toContain('+30 sec');
      expect(text).toContain('Current');
      expect(cards[1].classList).toContain('cur');
      expect(
        normalizeText(cards[1].querySelector('.timer strong')?.textContent),
      ).toBe('3:00');
    } finally {
      TestBed.resetTestingModule();
      vi.useRealTimers();
    }
  });
});
