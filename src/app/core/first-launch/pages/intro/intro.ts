import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-intro',
  templateUrl: 'intro.html',
  styleUrl: 'intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, RouterLink],
})
export class IntroPage {}
