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

    fixture.detectChanges();

    const renderedText = () =>
      (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ').trim();

    const clickButton = async (label: string) => {
      const button = Array.from(
        fixture.nativeElement.querySelectorAll('ion-button') as NodeListOf<HTMLElement>,
      ).find((element) =>
        (element.textContent ?? '').replace(/\s+/g, ' ').includes(label),
      ) as HTMLElement | undefined;

      expect(button).not.toBeUndefined();

      button!.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }),
      );

      fixture.detectChanges();
      await fixture.whenStable();
    };

    const clickTab = async (tab: string) => {
      const tabButton = fixture.nativeElement.querySelector(
        `ion-tab-button[tab="${tab}"]`,
      ) as HTMLElement | null;

      expect(tabButton).not.toBeNull();

      tabButton!.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }),
      );

      fixture.detectChanges();
      await fixture.whenStable();
    };

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

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

    const hasButtonWithText = (label: string) =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'ion-button',
        ) as NodeListOf<HTMLElement>,
      ).some((button) =>
        (button.textContent ?? '').replace(/\s+/g, ' ').includes(label),
      );

    expect(hasButtonWithText('Current workout')).toBe(true);
    expect(hasButtonWithText('Completed workout')).toBe(false);
    expect(hasButtonWithText('Locked workout')).toBe(false);

    await clickTab('progress');
    expect(router.url).toBe('/tabs/progress');
    expect(renderedText()).toContain('Progress screen');

    await clickTab('about');
    expect(router.url).toBe('/tabs/about');
    expect(renderedText()).toContain('About screen');
  });
});
