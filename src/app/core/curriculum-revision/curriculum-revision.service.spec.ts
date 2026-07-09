// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import { CurriculumRevisionService } from './curriculum-revision.service';

describe('CurriculumRevisionService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resets all legacy training state once while preserving onboarding', () => {
    localStorage.setItem(
      'solo-wrestler.curriculum.completed-workout-ids',
      '[]',
    );
    localStorage.setItem(
      'solo-wrestler.training.completed-workout-log',
      'notes',
    );
    localStorage.setItem(
      'solo-wrestler.training.in-progress-workout',
      'session',
    );
    localStorage.setItem('solo-wrestler.onboarding.complete', 'true');
    localStorage.setItem('solo-wrestler.preferences.sound-enabled', 'false');

    const service = new CurriculumRevisionService();
    service.initialize();

    expect(
      localStorage.getItem('solo-wrestler.curriculum.completed-workout-ids'),
    ).toBeNull();
    expect(
      localStorage.getItem('solo-wrestler.training.completed-workout-log'),
    ).toBeNull();
    expect(
      localStorage.getItem('solo-wrestler.training.in-progress-workout'),
    ).toBeNull();
    expect(localStorage.getItem('solo-wrestler.onboarding.complete')).toBe(
      'true',
    );
    expect(
      localStorage.getItem('solo-wrestler.preferences.sound-enabled'),
    ).toBe('false');
    expect(service.shouldShowResetNotice()).toBe(true);

    localStorage.setItem(
      'solo-wrestler.training.in-progress-workout',
      'new-session',
    );
    service.initialize();
    expect(
      localStorage.getItem('solo-wrestler.training.in-progress-workout'),
    ).toBe('new-session');
  });

  it('does not show a reset notice on a fresh installation', () => {
    const service = new CurriculumRevisionService();
    service.initialize();

    expect(service.shouldShowResetNotice()).toBe(false);
    expect(localStorage.getItem('solo-wrestler.curriculum.revision')).toBe(
      'phase-1-neutral-defense',
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
  });
});
