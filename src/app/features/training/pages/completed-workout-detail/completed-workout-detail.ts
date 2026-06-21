import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-completed-workout-detail',
  templateUrl: 'completed-workout-detail.html',
  standalone: true,
  imports: [IonButton, IonContent, RouterLink],
})
export class CompletedWorkoutDetailPage {}
