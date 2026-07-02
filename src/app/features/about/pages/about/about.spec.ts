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
      'Solo Wrestler is a personal wrestling curriculum app based on the USA Wrestling Core Curriculum and adapted for solo training with minimal equipment.',
    );
    expect(text).toContain(
      'The goal is to build wrestling fundamentals step by step, with a focus on self-defense.',
    );
    expect(text).toContain(
      'Technique videos and curriculum inspiration come from USA Wrestling’s public curriculum resources.',
    );
    expect(text).toContain('Required');
    expect(text).toContain('Wrestling/grappling mat');
    expect(text).toContain('Wrestling dummy');
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
