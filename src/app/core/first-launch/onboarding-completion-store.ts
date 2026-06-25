import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

export const ONBOARDING_COMPLETE_KEY = 'onboarding-complete';

@Injectable({ providedIn: 'root' })
export class OnboardingCompletionStore {
  private readonly localStorage = inject(LocalStorageService);

  isComplete(): boolean {
    return this.localStorage.get<boolean>(ONBOARDING_COMPLETE_KEY) === true;
  }

  markComplete(): void {
    this.localStorage.set(ONBOARDING_COMPLETE_KEY, true);
  }
}
