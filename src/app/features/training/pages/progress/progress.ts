import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-progress',
  templateUrl: 'progress.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, RouterLink],
})
export class ProgressPage {}
