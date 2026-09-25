import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import { CurriculumNodeComponent } from './components/curriculum-node';
import { CurriculumPhaseComponent } from './components/curriculum-phase';
import { futureCurriculumPhases } from '../../data/curriculum.data';
import { grecoFutureCurriculumPhases } from '../../data/greco-curriculum.data';
import { CurriculumStore } from '../../stores/curriculum.store';
import { WorkoutSessionStore } from '../../stores/workout-session.store';
import { isWrestlingStyle } from '../../models/wrestling-style.model';

@Component({
  selector: 'app-curriculum',
  templateUrl: 'curriculum.html',
  styleUrls: ['curriculum.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, RouterLink, CurriculumPhaseComponent, CurriculumNodeComponent],
})
export class CurriculumPage {
  private readonly curriculumStore = inject(CurriculumStore);
  private readonly workoutSessionStore = inject(WorkoutSessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly phases = this.curriculumStore.phases;
  readonly selectedStyle = this.curriculumStore.style;
  readonly futurePhases = computed(() =>
    this.selectedStyle() === 'greco-roman'
      ? grecoFutureCurriculumPhases
      : futureCurriculumPhases,
  );
  readonly hasInProgressWorkout = this.workoutSessionStore.hasInProgressWorkout;

  readonly freestyleChoice = { style: 'freestyle' };
  readonly grecoRomanChoice = { style: 'greco-roman' };

  constructor() {
    effect(() => {
      const style = this.routeParams().get('style');

      if (isWrestlingStyle(style) && style !== this.selectedStyle()) {
        this.workoutSessionStore.switchStyle(style);
      }
    });
  }
}
