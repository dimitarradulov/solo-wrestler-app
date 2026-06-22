import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TabsPage } from './tabs';

describe('TabsPage', () => {
  const normalizeText = (value: string | null | undefined) =>
    (value ?? '').replace(/\s+/g, ' ').trim();

  it('renders the primary tabs and tab outlet', async () => {
    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [provideIonicAngular({}), provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(TabsPage);

    fixture.detectChanges();
    await fixture.whenStable();

    const tabs = fixture.nativeElement.querySelector('ion-tabs') as HTMLElement;
    const tabOutlets = tabs.querySelectorAll('ion-router-outlet');

    expect(tabOutlets).toHaveLength(1);
    expect(tabOutlets[0].getAttribute('tabs')).toBe('true');

    const expectedTabs = [
      ['today', 'today-outline', 'Today'],
      ['curriculum', 'barbell-outline', 'Curriculum'],
      ['progress', 'stats-chart-outline', 'Progress'],
      ['about', 'information-circle-outline', 'About'],
    ];

    for (const [tab, icon, label] of expectedTabs) {
      const tabButton = fixture.nativeElement.querySelector(
        `ion-tab-button[tab="${tab}"]`,
      ) as HTMLElement;

      expect(tabButton).not.toBeNull();
      expect(tabButton.querySelector(`ion-icon[name="${icon}"]`)).not.toBeNull();
      expect(normalizeText(tabButton.textContent)).toBe(label);
    }
  });
});
