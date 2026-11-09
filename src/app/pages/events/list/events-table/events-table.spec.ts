import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventsTable } from './events-table';
import { EventDetails } from '../../event-details/event-details';
import { EventWithRegistrationCountI } from '../../event.model';

describe('EventsTable', () => {
  let fixture: ComponentFixture<EventsTable>;
  let element: HTMLElement;
  const events: EventWithRegistrationCountI[] = [
    {
      id: 42,
      registrationCount: 7,
      name: 'Underground Night',
      date: '2026-11-09',
      bands: [],
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    },
    {
      id: 43,
      registrationCount: 0,
      name: 'Another Show',
      date: '2026-12-05',
      bands: [],
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'events/:id', component: EventDetails }])],
    });
    fixture = TestBed.createComponent(EventsTable);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('events', events);
    fixture.detectChanges();
  });
  it('renders all event names, formatted dates and machine-readable dates', () => {
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(Array.from(element.querySelectorAll('tbody a'), (a) => a.textContent?.trim())).toEqual([
      'Underground Night',
      'Another Show',
    ]);
    expect(Array.from(element.querySelectorAll('time'), (t) => t.textContent?.trim())).toEqual([
      '09/11/2026',
      '05/12/2026',
    ]);
    expect(Array.from(element.querySelectorAll('time'), (t) => t.getAttribute('datetime'))).toEqual(
      ['2026-11-09', '2026-12-05'],
    );
  });
  it('renders the registered people column including zero', () => {
    expect(element.querySelectorAll('th')).toHaveLength(3);
    expect(element.querySelectorAll('th')[2].textContent?.trim()).toBe('Registered people');
    expect(
      Array.from(element.querySelectorAll('tbody tr'), (row) =>
        row.querySelectorAll('td')[2].textContent?.trim(),
      ),
    ).toEqual(['7', '0']);
    fixture.componentRef.setInput('events', [{ ...events[0], registrationCount: 9 }]);
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody td')[2].textContent?.trim()).toBe('9');
  });
  it('links each event to its details and navigates when selected', async () => {
    const links = element.querySelectorAll<HTMLAnchorElement>('tbody a');
    expect(Array.from(links, (a) => a.getAttribute('href'))).toEqual(['/events/42', '/events/43']);
    links[0].click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/events/42');
  });
  it('replaces existing rows with the empty state when events change', () => {
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(element.querySelector('tbody td')?.getAttribute('colspan')).toBe('3');
    expect(element.textContent).toContain('No events found.');
    expect(element.querySelector('tbody a')).toBeNull();
  });
});
