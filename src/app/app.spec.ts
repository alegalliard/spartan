import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

describe('App sidebar integration', () => {
  let fixture: ComponentFixture<App>;
  let media: EventTarget & { matches: boolean };
  beforeEach(() => {
    document.cookie = 'sidebar_state=; path=/; max-age=0';
    media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    );
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
  });
  afterEach(() => {
    fixture?.destroy();
    vi.unstubAllGlobals();
    document.cookie = 'sidebar_state=; path=/; max-age=0';
  });
  async function render() {
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
  }
  function trigger() {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[hlmSidebarTrigger]',
    )!;
  }
  it('renders the layout and collapses and expands the desktop sidebar', async () => {
    await render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(trigger().textContent).toContain('Toggle Sidebar');
    expect(element.querySelector('hlm-sidebar')?.getAttribute('data-state')).toBe('expanded');
    trigger().click();
    fixture.detectChanges();
    expect(element.querySelector('hlm-sidebar')?.getAttribute('data-state')).toBe('collapsed');
    expect(document.cookie).toContain('sidebar_state=false');
    trigger().click();
    fixture.detectChanges();
    expect(element.querySelector('hlm-sidebar')?.getAttribute('data-state')).toBe('expanded');
  });
  it('restores the collapsed sidebar preference', async () => {
    document.cookie = 'sidebar_state=false; path=/';
    await render();
    expect(fixture.nativeElement.querySelector('hlm-sidebar').getAttribute('data-state')).toBe(
      'collapsed',
    );
  });
  it('toggles the sidebar with the keyboard shortcut', async () => {
    await render();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
    fixture.detectChanges();
    expect(TestBed.inject(HlmSidebarService).open()).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
    fixture.detectChanges();
    expect(TestBed.inject(HlmSidebarService).open()).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', metaKey: true }));
    fixture.detectChanges();
    expect(TestBed.inject(HlmSidebarService).open()).toBe(true);
  });
  it('opens and closes the mobile sidebar and resets it when switching to desktop', async () => {
    media.matches = true;
    await render();
    const service = TestBed.inject(HlmSidebarService);
    expect(service.isMobile()).toBe(true);
    expect(service.openMobile()).toBe(false);
    trigger().click();
    await fixture.whenStable();
    expect(service.openMobile()).toBe(true);
    expect(document.querySelector('[data-mobile="true"]')).not.toBeNull();
    expect(service.open()).toBe(true);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(service.openMobile()).toBe(false);
    trigger().click();
    await fixture.whenStable();
    media.matches = false;
    media.dispatchEvent(Object.assign(new Event('change'), { matches: false }));
    await fixture.whenStable();
    expect(service.openMobile()).toBe(false);
    expect(fixture.nativeElement.querySelector('hlm-sidebar').getAttribute('data-state')).toBe(
      'expanded',
    );
  });
});
