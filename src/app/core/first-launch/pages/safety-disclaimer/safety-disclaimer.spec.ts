import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from '../../../../app.routes';
import { ONBOARDING_COMPLETE_KEY } from '../../onboarding-completion-store';
import { SafetyDisclaimerPage } from './safety-disclaimer';

describe('SafetyDisclaimerPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();
  const createStorage = (): Storage => {
    const values = new Map<string, string>();

    return {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => Array.from(values.keys())[index] ?? null,
      removeItem: (key: string) => {
        values.delete(key);
      },
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
  };

  let storage: Storage;
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    storage = createStorage();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [SafetyDisclaimerPage],
      providers: [provideIonicAngular({}), provideRouter(routes)],
    }).compileComponents();

    const fixture = TestBed.createComponent(SafetyDisclaimerPage);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, router };
  };

  it('renders the heading, exact disclaimer and action label', async () => {
    const { fixture } = await setup();
    const text = normalizeText(fixture.nativeElement.textContent);

    expect(text).toContain('Safety Disclaimer');
    expect(text).toContain(
      'Train only on a safe mat surface. Do not dive head-first. Keep your head up and protect your neck. This app is for general training guidance, not professional coaching or medical advice.',
    );

    const button = fixture.nativeElement.querySelector('ion-button');
    expect(normalizeText(button?.textContent)).toBe('I Understand');
  });

  it('uses a single h1 for the page title', async () => {
    const { fixture } = await setup();
    const headings = fixture.nativeElement.querySelectorAll('h1');

    expect(headings).toHaveLength(1);
    expect(normalizeText(headings[0].textContent)).toBe('Safety Disclaimer');
  });

  it('keeps the page minimal', async () => {
    const { fixture } = await setup();

    expect(fixture.nativeElement.querySelector('ion-header')).toBeNull();
    expect(fixture.nativeElement.querySelector('ion-toolbar')).toBeNull();
    expect(fixture.nativeElement.querySelector('ion-back-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('ion-icon')).toBeNull();
  });

  it('navigates to Today when I Understand is pressed', async () => {
    const { fixture, router } = await setup();

    await router.navigateByUrl('/safety-disclaimer');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('ion-button');

    button.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );

    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/tabs/today');
    expect(storage.getItem(ONBOARDING_COMPLETE_KEY)).toBe('true');
  });
});
