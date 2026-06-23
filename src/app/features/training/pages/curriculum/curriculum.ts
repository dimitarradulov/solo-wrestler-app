import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { CurriculumNodeComponent } from './components/curriculum-node';
import { CurriculumPhaseComponent } from './components/curriculum-phase';
import { CurriculumWeek } from './curriculum.model';

@Component({
  selector: 'app-curriculum',
  templateUrl: 'curriculum.html',
  styleUrls: ['curriculum.scss'],
  standalone: true,
  imports: [IonContent, CurriculumPhaseComponent, CurriculumNodeComponent],
})
export class CurriculumPage {
  weeks: CurriculumWeek[] = [
    {
      number: 1,
      workouts: [
        { label: 'Workout A', title: 'Mechanics', status: 'completed' },
        { label: 'Workout B', title: 'Application', status: 'completed' },
      ],
    },
    {
      number: 2,
      workouts: [
        { label: 'Workout A', title: 'Mechanics', status: 'current' },
        { label: 'Workout B', title: 'Application', status: 'locked' },
      ],
    },
    {
      number: 3,
      workouts: [
        { label: 'Workout A', title: 'Mechanics', status: 'locked' },
        { label: 'Workout B', title: 'Application', status: 'locked' },
      ],
    },
    {
      number: 4,
      workouts: [
        { label: 'Workout A', title: 'Mechanics', status: 'locked' },
        { label: 'Workout B', title: 'Application', status: 'locked' },
      ],
    },
    {
      number: 5,
      workouts: [
        { label: 'Workout A', title: 'Mechanics', status: 'locked' },
        { label: 'Workout B', title: 'Application', status: 'locked' },
      ],
    },
    {
      number: 6,
      workouts: [
        { label: 'Workout A', title: 'Mechanics', status: 'locked' },
        { label: 'Workout B', title: 'Application', status: 'locked' },
      ],
    },
  ];
}
