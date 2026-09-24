import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';

import {
  isWrestlingStyle,
  WrestlingStyle,
} from '../models/wrestling-style.model';

const WRESTLING_STYLE_KEY = 'training.wrestling-style';

@Injectable({ providedIn: 'root' })
export class WrestlingStyleStore {
  private readonly localStorage = inject(LocalStorageService);
  private readonly selectedStyleState = signal<WrestlingStyle | null>(
    this.readSelectedStyle(),
  );

  readonly selectedStyle = computed(() => this.selectedStyleState());

  chooseStyle(style: WrestlingStyle): void {
    this.selectedStyleState.set(style);
    this.localStorage.set(WRESTLING_STYLE_KEY, style);
  }

  ensureSelectedStyle(): WrestlingStyle {
    const selectedStyle = this.selectedStyleState();

    if (selectedStyle !== null) {
      return selectedStyle;
    }

    this.chooseStyle('freestyle');
    return 'freestyle';
  }

  private readSelectedStyle(): WrestlingStyle | null {
    const storedStyle = this.localStorage.get<unknown>(WRESTLING_STYLE_KEY);

    return isWrestlingStyle(storedStyle) ? storedStyle : null;
  }
}
