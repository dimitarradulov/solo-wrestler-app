// @vitest-environment jsdom

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideNgxLocalstorage } from 'ngx-localstorage';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { routes } from './app.routes';
import { AppComponent } from './app';
import { InstallPromptService } from './core/install-prompt/install-prompt.service';
import { CurriculumRevisionService } from './core/curriculum-revision/curriculum-revision.service';
import { TimerEndAlertService } from './core/timers/timer-end-alert.service';
import { CompletedWorkoutLogStore } from './features/training/stores/completed-workout-log.store';
import { CurriculumStore } from './features/training/stores/curriculum.store';

describe('app curriculum revision notice', () => {
  const originalLocalStorage = window.localStorage;
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

  const configureApp = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideIonicAngular({}),
        provideRouter(routes),
        provideNgxLocalstorage({ prefix: 'solo-wrestler', delimiter: '.' }),
        {
          provide: InstallPromptService,
          useValue: {
            shouldShow: signal(false),
            platform: signal('other'),
            nativePromptAvailable: signal(false),
            install: vi.fn(),
          },
        },
        {
          provide: TimerEndAlertService,
          useValue: { playTimerEndAlert: async () => undefined },
        },
      ],
    }).compileComponents();
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorage(),
    });
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it('explains an unselected style reset while Today stays on the selected style', async () => {
    await configureApp();
    new CurriculumRevisionService().initialize();

    const curriculumStore = TestBed.inject(CurriculumStore);
    const logStore = TestBed.inject(CompletedWorkoutLogStore);
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
    logStore.appendEntry({
      style: 'freestyle',
      workoutId: 'phase-1-week-1-workout-a',
      completedAt: '2026-09-25T10:00:00.000Z',
      difficulty: 'good',
      note: null,
      completedDrillIds: [],
    });
    logStore.appendEntry({
      style: 'greco-roman',
      workoutId: 'greco-phase-1-week-1-workout-a',
      completedAt: '2026-09-25T11:00:00.000Z',
      difficulty: 'good',
      note: null,
      completedDrillIds: [],
    });
    localStorage.setItem(
      'solo-wrestler.curriculum.greco-roman.revision',
      'previous-greco-revision',
    );

    TestBed.resetTestingModule();
    await configureApp();
    TestBed.inject(CurriculumRevisionService).initialize();
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/tabs/today');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('ion-alert') as
      | (HTMLElement & { message: string; isOpen: boolean })
      | null;
    expect(alert?.message).toContain('Greco-Roman');
    expect(alert?.message).toContain('Freestyle training');
    expect(alert?.isOpen).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Defense and Recovery');
    expect(TestBed.inject(CurriculumStore).style()).toBe('freestyle');
  });
});
