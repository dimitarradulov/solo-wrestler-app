import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNgxLocalstorage } from 'ngx-localstorage';
import { routes } from './app.routes';

describe('app routes', () => {
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
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  const setupRouter = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideNgxLocalstorage({ prefix: 'solo-wrestler', delimiter: '.' }),
      ],
    });

    return TestBed.inject(Router);
  };

  it('redirects / to /intro when onboarding is not complete', async () => {
    const router = setupRouter();

    await router.navigateByUrl('/');

    expect(router.url).toBe('/intro');
  });

  it('redirects / to /tabs/today when onboarding is complete', async () => {
    storage.setItem('solo-wrestler.onboarding-complete', 'true');
    const router = setupRouter();

    await router.navigateByUrl('/');

    expect(router.url).toBe('/tabs/today');
  });
});
