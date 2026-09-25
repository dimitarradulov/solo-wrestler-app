import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { AboutPage } from './about';

describe('AboutPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideIonicAngular({})],
    }).compileComponents();

    const fixture = TestBed.createComponent(AboutPage);

    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  it('renders the About, equipment, and safety content', async () => {
    const fixture = await setup();
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('About');
    expect(text).toContain(
      'Solo Wrestler offers separate Freestyle and Greco-Roman curricula, based on USA Wrestling resources and adapted for solo practice.',
    );
    expect(text).toContain(
      'Each Foundations path has 18 ordered workouts. Three sessions per week is a suggested pace, and each workout is planned for 60 minutes including warm-up, practice, Rest, and cooldown.',
    );
    expect(text).toContain(
      'Solo drills are preparation and positional rehearsal. They do not replace coached partner practice or teach live resistance.',
    );
    expect(text).toContain(
      'USA Wrestling coaching materials and UWW rules inform the curricula; the solo adaptations are not federation-approved programs.',
    );
    expect(text).toContain('Required');
    expect(text).toContain('Wrestling/grappling mat');
    expect(text).toContain('Wrestling dummy');
    expect(text).toContain('Suples Power dummy, 30 kg with arms');
    expect(text).toContain('Lay it flat on the mat so its shoulders and hips are supported');
    expect(text).toContain('The exact legs or stump variant is not specified');
    expect(text).toContain('Optional');
    expect(text).toContain('Knee pads');
    expect(text).toContain(
      'Train only on a safe mat surface. Do not dive head-first. Keep your head up and protect your neck. This app is for general training guidance, not professional coaching or medical advice.',
    );
  });

  it('opens the USA Wrestling curriculum in an external browser context', async () => {
    const fixture = await setup();
    const link = fixture.nativeElement.querySelector(
      'ion-button[href]',
    ) as HTMLElement;

    expect(link.getAttribute('href')).toBe(
      'https://www.usawmembership.com/usa_wrestling_core_curriculum',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
