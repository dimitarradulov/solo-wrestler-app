import { Injectable } from '@angular/core';

export const ONBOARDING_COMPLETE_KEY = 'solo-wrestler.onboarding-complete';

@Injectable({ providedIn: 'root' })
export class OnboardingCompletionStore {
  isComplete(): boolean {
    return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
  }

  markComplete(): void {
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  }
}
