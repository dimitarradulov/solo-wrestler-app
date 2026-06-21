import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-workout-completion',
  templateUrl: 'workout-completion.html',
  standalone: true,
  imports: [IonButton, IonContent, RouterLink],
})
export class WorkoutCompletionPage {}
