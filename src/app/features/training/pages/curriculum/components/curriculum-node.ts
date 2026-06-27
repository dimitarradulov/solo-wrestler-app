import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

import { CurriculumNodeStatus } from '../../../models/curriculum.model';
import { addIcons } from 'ionicons';
import { checkmark, chevronForwardOutline, lockClosed } from 'ionicons/icons';

@Component({
  selector: 'app-curriculum-node',
  templateUrl: 'curriculum-node.html',
  styleUrls: ['curriculum-node.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, RouterLink],
})
export class CurriculumNodeComponent {
  title = input.required<string>();
  status = input.required<CurriculumNodeStatus>();
  label = input<string>();
  statusText = input<string>();
  link = input<string>('/active-workout');

  isCurrent = computed(() => this.status() === 'current');
  iconName = computed(() =>
    this.status() === 'completed' ? 'checkmark' : 'lock-closed',
  );
  displayStatusText = computed(() => {
    const override = this.statusText();
    if (override !== undefined) {
      return override;
    }
    if (this.status() === 'current') {
      return 'Start';
    }
    return this.status() === 'completed' ? 'Done' : 'Locked';
  });
  ariaLabel = computed(() => {
    const label = this.label();
    if (!label) {
      return null;
    }
    return this.isCurrent()
      ? `Start ${label}, ${this.title()}`
      : `${label}, ${this.status()}`;
  });

  constructor() {
    addIcons({
      checkmark,
      lockClosed,
      chevronForwardOutline,
    });
  }
}
