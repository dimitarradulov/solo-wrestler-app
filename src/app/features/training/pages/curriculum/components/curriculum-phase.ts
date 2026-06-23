import { Component, input } from '@angular/core';

import { CurriculumNodeComponent } from './curriculum-node';
import { CurriculumWeek } from '../curriculum.model';

@Component({
  selector: 'app-curriculum-phase',
  templateUrl: 'curriculum-phase.html',
  styleUrls: ['curriculum-phase.scss'],
  standalone: true,
  imports: [CurriculumNodeComponent],
})
export class CurriculumPhaseComponent {
  title = input.required<string>();
  meta = input.required<string>();
  weeks = input.required<CurriculumWeek[]>();
  headingId = input.required<string>();
}
