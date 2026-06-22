import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';

type CurriculumNodeStatus = 'completed' | 'current' | 'locked';

interface DummyWorkout {
  label: string;
  title: string;
  status: CurriculumNodeStatus;
}

interface DummyWeek {
  number: number;
  workouts: DummyWorkout[];
}

@Component({
  selector: 'app-curriculum',
  templateUrl: 'curriculum.html',
  styleUrls: ['curriculum.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, RouterLink],
})
export class CurriculumPage {
  weeks: DummyWeek[] = [
    {
      number: 1,
      workouts: [
        { label: 'Workout A', title: 'Lorem Workout A', status: 'completed' },
        { label: 'Workout B', title: 'Lorem Workout B', status: 'completed' },
      ],
    },
    {
      number: 2,
      workouts: [
        { label: 'Workout A', title: 'Lorem Workout A', status: 'current' },
        { label: 'Workout B', title: 'Lorem Workout B', status: 'locked' },
      ],
    },
    {
      number: 3,
      workouts: [
        { label: 'Workout A', title: 'Lorem Workout A', status: 'locked' },
        { label: 'Workout B', title: 'Lorem Workout B', status: 'locked' },
      ],
    },
    {
      number: 4,
      workouts: [
        { label: 'Workout A', title: 'Lorem Workout A', status: 'locked' },
        { label: 'Workout B', title: 'Lorem Workout B', status: 'locked' },
      ],
    },
    {
      number: 5,
      workouts: [
        { label: 'Workout A', title: 'Lorem Workout A', status: 'locked' },
        { label: 'Workout B', title: 'Lorem Workout B', status: 'locked' },
      ],
    },
    {
      number: 6,
      workouts: [
        { label: 'Workout A', title: 'Lorem Workout A', status: 'locked' },
        { label: 'Workout B', title: 'Lorem Workout B', status: 'locked' },
      ],
    },
  ];
}
