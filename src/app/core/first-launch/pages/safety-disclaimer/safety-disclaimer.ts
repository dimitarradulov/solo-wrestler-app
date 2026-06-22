import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-safety-disclaimer',
  templateUrl: 'safety-disclaimer.html',
  styleUrl: 'safety-disclaimer.scss',
  standalone: true,
  imports: [IonButton, IonContent, RouterLink],
})
export class SafetyDisclaimerPage {}
