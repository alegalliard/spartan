import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EventsList } from './list';
import { EventI } from '../event.model';

describe('EventsList integration', () => {
  let fixture: ComponentFixture<EventsList>;
  let http: HttpTestingController;
  const events: EventI[] = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Event ${i + 1}`,
    date: '2026-11-09',
    bands: [],
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EventsList);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('loads the first ten events and updates the table and pagination after clicking next', async () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-events-table')).toBeNull();
    http.expectOne({ method: 'GET', url: 'mocks/events.json' }).flush(events);
    http.expectOne('mocks/registrations.json').flush([{ id: 1, deletedAt: null }]);
    http.expectOne('mocks/event-registrations.json').flush([
      { id: 1, eventId: 1, registrationId: 1 },
      { id: 2, eventId: 11, registrationId: 1 },
    ]);
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(10);
    expect(element.querySelector('tbody a')?.textContent?.trim()).toBe('Event 1');
    expect(element.textContent).toContain('Page 1 of 2');
    expect(element.querySelectorAll('tbody td')[2].textContent?.trim()).toBe('1');

    element.querySelector<HTMLButtonElement>('[aria-label="Go to next page"]')!.click();
    fixture.detectChanges();
    http.expectOne({ method: 'GET', url: 'mocks/events.json' }).flush(events);
    http.expectOne('mocks/registrations.json').flush([{ id: 1, deletedAt: null }]);
    http.expectOne('mocks/event-registrations.json').flush([
      { id: 1, eventId: 1, registrationId: 1 },
      { id: 2, eventId: 11, registrationId: 1 },
    ]);
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(element.querySelector('tbody a')?.textContent?.trim()).toBe('Event 11');
    expect(element.textContent).toContain('Page 2 of 2');
    expect(element.querySelectorAll('tbody td')[2].textContent?.trim()).toBe('1');
    expect(
      element.querySelector<HTMLButtonElement>('[aria-label="Go to next page"]')!.disabled,
    ).toBe(true);
  });

  it('renders an empty table without pagination for an empty response', async () => {
    http.expectOne('mocks/events.json').flush([]);
    http.expectOne('mocks/registrations.json').flush([]);
    http.expectOne('mocks/event-registrations.json').flush([]);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('No events found.');
    expect(element.querySelector('nav[aria-label="Pagination"]')).toBeNull();
  });
});
