import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { CurriculumNodeComponent } from './components/curriculum-node';
import { CurriculumPhaseComponent } from './components/curriculum-phase';
import { CurriculumStore } from './curriculum.store';
import { futureCurriculumPhases } from './data/curriculum.data';

@Component({
  selector: 'app-curriculum',
  templateUrl: 'curriculum.html',
  styleUrls: ['curriculum.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, CurriculumPhaseComponent, CurriculumNodeComponent],
})
export class CurriculumPage {
  private readonly curriculumStore = inject(CurriculumStore);

  readonly phases = this.curriculumStore.phases;
  readonly futurePhases = futureCurriculumPhases;
}
