import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from '../../../../app.routes';
import { IntroPage } from './intro';

describe('IntroPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [IntroPage],
      providers: [provideIonicAngular({}), provideRouter(routes)],
    }).compileComponents();

    const fixture = TestBed.createComponent(IntroPage);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, router };
  };

  it('renders the exact title, tagline, description and Continue label', async () => {
    const { fixture } = await setup();
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Solo Wrestler');
    expect(text).toContain(
      'Follow a real wrestling curriculum, adapted for solo training.',
    );
    expect(text).toContain(
      'Build wrestling fundamentals step by step using a curriculum based on USA Wrestling and adapted for solo practice, self-defense, and BJJ preparation.',
    );

    const continueButton = fixture.nativeElement.querySelector('ion-button');
    expect(normalizeText(continueButton?.textContent)).toBe('Continue');
  });

  it('uses a single h1 for the accessible product name', async () => {
    const { fixture } = await setup();
    const headings = fixture.nativeElement.querySelectorAll('h1');

    expect(headings).toHaveLength(1);
    expect(normalizeText(headings[0].textContent)).toBe('Solo Wrestler');
  });

  it('treats the wrestler illustration as decorative', async () => {
    const { fixture } = await setup();
    const image = fixture.nativeElement.querySelector('img');

    expect(image).not.toBeNull();
    expect(image.getAttribute('alt')).toBe('');
  });

  it('has no toolbar, back button, skip action, or page indicator', async () => {
    const { fixture } = await setup();

    expect(fixture.nativeElement.querySelector('ion-header')).toBeNull();
    expect(fixture.nativeElement.querySelector('ion-toolbar')).toBeNull();
    expect(fixture.nativeElement.querySelector('ion-back-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.intro-indicator')).toBeNull();
    expect(normalizeText(fixture.nativeElement.textContent)).not.toContain(
      'Skip',
    );
  });

  it('navigates to /safety-disclaimer when Continue is pressed', async () => {
    const { fixture, router } = await setup();

    await router.navigateByUrl('/intro');
    fixture.detectChanges();
    await fixture.whenStable();

    const continueButton = fixture.nativeElement.querySelector('ion-button');

    expect(continueButton).toBeTruthy();
    continueButton.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );

    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/safety-disclaimer');
  });
});
