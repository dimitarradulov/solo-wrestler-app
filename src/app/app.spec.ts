import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app';
import { routes } from './app.routes';

describe('AppComponent', () => {
  it('navigates between the primary tabs through rendered tab buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideIonicAngular({}), provideRouter(routes)],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    fixture.detectChanges();

    const renderedText = () =>
      (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ').trim();

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

    expect(router.url).toBe('/tabs/today');
    expect(renderedText()).toContain('Today screen');

    await clickTab('curriculum');
    expect(router.url).toBe('/tabs/curriculum');
    expect(renderedText()).toContain('Curriculum screen');

    await clickTab('progress');
    expect(router.url).toBe('/tabs/progress');
    expect(renderedText()).toContain('Progress screen');

    await clickTab('about');
    expect(router.url).toBe('/tabs/about');
    expect(renderedText()).toContain('About screen');

    await clickTab('today');
    expect(router.url).toBe('/tabs/today');
  });
});
