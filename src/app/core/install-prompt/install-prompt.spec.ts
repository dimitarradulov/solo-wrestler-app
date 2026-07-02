import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstallPromptService } from './install-prompt.service';
import { InstallPromptComponent } from './install-prompt';

describe('InstallPromptComponent', () => {
  const shouldShow = signal(true);
  const platform = signal<'ios' | 'other'>('ios');
  const nativePromptAvailable = signal(false);
  const install = vi.fn();
  let fixture: ComponentFixture<InstallPromptComponent>;

  const text = (): string =>
    (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    shouldShow.set(true);
    platform.set('ios');
    nativePromptAvailable.set(false);
    install.mockReset();

    await TestBed.configureTestingModule({
      imports: [InstallPromptComponent],
      providers: [
        {
          provide: InstallPromptService,
          useValue: {
            shouldShow,
            platform,
            nativePromptAvailable,
            install,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallPromptComponent);
    fixture.detectChanges();
  });

  it('shows Safari instructions on iOS without install or dismiss actions', () => {
    expect(text()).toContain('In Safari, tap Share, then Add to Home Screen.');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(text()).not.toContain('Dismiss');
  });

  it('shows the Install action when a native browser prompt is available', () => {
    platform.set('other');
    nativePromptAvailable.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(button.textContent?.trim()).toBe('Install');
    expect(install).toHaveBeenCalledOnce();
  });

  it('shows browser-menu instructions when no native prompt is available', () => {
    platform.set('other');
    fixture.detectChanges();

    expect(text()).toContain('Open your browser menu');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
