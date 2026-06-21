import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app';
import { routes } from './app.routes';

describe('AppComponent', () => {
  it('navigates from intro through the primary tab shell', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideIonicAngular({}), provideRouter(routes)],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    const normalizeText = (value: string | null | undefined) =>
      (value ?? '').replace(/\s+/g, ' ').trim();

    const stabilize = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };

    const renderedText = () => normalizeText(fixture.nativeElement.textContent);

    const findButton = (label: string) =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'ion-button',
        ) as NodeListOf<HTMLElement>,
      ).find((element) => normalizeText(element.textContent).includes(label));

    const hasButtonWithText = (label: string) => findButton(label) !== undefined;

    const clickElement = async (element: HTMLElement | null | undefined) => {
      expect(element).toBeTruthy();

      if (!element) {
        return;
      }

      element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }),
      );

      await stabilize();
    };

    const clickButton = async (label: string) => clickElement(findButton(label));

    const clickTab = async (tab: string) => {
      await clickElement(
        fixture.nativeElement.querySelector(
          `ion-tab-button[tab="${tab}"]`,
        ) as HTMLElement | null,
      );
    };

    await router.navigateByUrl('/');
    await stabilize();

    expect(router.url).toBe('/intro');
    expect(renderedText()).toContain('Intro screen');
    expect(fixture.nativeElement.querySelector('ion-tab-bar')).toBeNull();

    await clickButton('Continue');
    expect(router.url).toBe('/safety-disclaimer');
    expect(renderedText()).toContain('Safety Disclaimer screen');
    expect(fixture.nativeElement.querySelector('ion-tab-bar')).toBeNull();

    await clickButton('I Understand');
    expect(router.url).toBe('/tabs/today');
    expect(renderedText()).toContain('Today screen');
    expect(fixture.nativeElement.querySelector('ion-tab-bar')).not.toBeNull();

    await clickButton('Start Workout');
    expect(router.url).toBe('/active-workout');
    expect(renderedText()).toContain('Active Workout screen');

    await clickButton('Complete Workout');
    expect(router.url).toBe('/workout-completion');
    expect(renderedText()).toContain('Workout Completion screen');

    await clickButton('Back to Today');
    expect(router.url).toBe('/tabs/today');
    expect(renderedText()).toContain('Today screen');
    expect(fixture.nativeElement.querySelector('ion-tab-bar')).not.toBeNull();

    await clickTab('curriculum');
    expect(router.url).toBe('/tabs/curriculum');
    expect(renderedText()).toContain('Curriculum screen');
    expect(renderedText()).toContain('Current');
    expect(renderedText()).toContain('Completed');
    expect(renderedText()).toContain('Locked');

    expect(hasButtonWithText('Current workout')).toBe(true);
    expect(hasButtonWithText('Completed workout')).toBe(false);
    expect(hasButtonWithText('Locked workout')).toBe(false);

    await clickTab('progress');
    expect(router.url).toBe('/tabs/progress');
    expect(renderedText()).toContain('Progress screen');
    expect(renderedText()).toContain('Completed workout');
    expect(hasButtonWithText('Completed workout')).toBe(true);

    await clickButton('Completed workout');
    expect(router.url).toBe('/completed-workout-detail');
    expect(renderedText()).toContain('Completed Workout Detail screen');

    await clickButton('Back to Progress');
    expect(router.url).toBe('/tabs/progress');
    expect(renderedText()).toContain('Progress screen');

    await clickTab('about');
    expect(router.url).toBe('/tabs/about');
    expect(renderedText()).toContain('About screen');
  });
});
