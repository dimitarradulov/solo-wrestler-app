import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-active-workout',
  templateUrl: 'active-workout.html',
  standalone: true,
  imports: [IonButton, IonContent, RouterLink],
})
export class ActiveWorkoutPage {}
