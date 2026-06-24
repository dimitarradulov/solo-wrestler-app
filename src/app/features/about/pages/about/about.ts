import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-about',
  templateUrl: 'about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent],
})
export class AboutPage {}
