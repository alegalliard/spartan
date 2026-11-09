import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EventDetails } from './event-details';
import { EventI } from '../event.model';
import { RegistrationI } from '../../registrations/registration.model';

const event: EventI = {
  id: 1,
  name: 'Underground Night',
  date: '2026-11-09',
  bands: ['Vigil', 'Slow Abyss'],
  createdAt: '2026-09-01T14:00:00Z',
  updatedAt: '2026-09-15T18:30:00Z',
  deletedAt: null,
};
const ana: RegistrationI = {
  id: 1,
  name: 'Ana Silva',
  CPF: '731.000.001-37',
  email: 'ana@example.com',
  birthdate: '1990-05-17',
  city: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
  createdAt: '2026-07-01T20:00:00Z',
  updatedAt: '2026-07-08T22:00:00Z',
  deletedAt: null,
};
const bruno = { ...ana, id: 2, name: 'Bruno Souza', email: 'bruno@example.com' };
const deletedPerson = { ...ana, id: 3, name: 'Deleted Person', deletedAt: '2026-09-01T00:00:00Z' };
const otherPerson = { ...ana, id: 4, name: 'Other Event Person' };
const links = [
  { id: 1, eventId: 1, registrationId: 1 },
  { id: 2, eventId: 1, registrationId: 2 },
  { id: 3, eventId: 1, registrationId: 1 },
  { id: 4, eventId: 1, registrationId: 3 },
  { id: 5, eventId: 2, registrationId: 4 },
  { id: 6, eventId: 1, registrationId: 99 },
];

describe('EventDetails integration', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'events/:id', component: EventDetails }]),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });
  afterEach(() => http.verify());
  function respond(
    events = [event],
    people = [bruno, deletedPerson, otherPerson, ana],
    associations = links,
  ) {
    http.expectOne('mocks/events.json').flush(events);
    http.expectOne('mocks/registrations.json').flush(people);
    http.expectOne('mocks/event-registrations.json').flush(associations);
  }
  function element(): HTMLElement {
    return harness.routeNativeElement!;
  }

  it('loads the event details and lists only distinct active people linked to this event', async () => {
    await harness.navigateByUrl('/events/1', EventDetails);
    expect(element().querySelector('[role="status"]')?.textContent).toContain('Loading event');
    respond();
    await harness.fixture.whenStable();
    expect(element().querySelector('h1')?.textContent).toBe('Underground Night');
    expect(element().textContent).toContain('09/11/2026');
    expect(element().textContent).toContain('Vigil');
    expect(element().textContent).toContain('Slow Abyss');
    const buttons = element().querySelectorAll<HTMLButtonElement>(
      'button[aria-controls="person-details"]',
    );
    expect(Array.from(buttons, (b) => b.textContent?.trim())).toEqual(['Ana Silva', 'Bruno Souza']);
    expect(element().textContent).not.toContain('Deleted Person');
    expect(element().textContent).not.toContain('Other Event Person');
    expect(element().querySelector('#person-details')?.textContent).toContain('Select a person');
    expect(element().textContent).not.toContain(ana.email);
    expect(element().querySelector('a[routerLink]')?.getAttribute('href')).toBe('/events');
  });

  it('shows the selected person in the adjacent panel and replaces it on another click', async () => {
    await harness.navigateByUrl('/events/1', EventDetails);
    respond();
    await harness.fixture.whenStable();
    const buttons = element().querySelectorAll<HTMLButtonElement>(
      'button[aria-controls="person-details"]',
    );
    buttons[0].click();
    await harness.fixture.whenStable();
    const panel = element().querySelector('#person-details')!;
    for (const value of [
      'Ana Silva',
      ana.CPF,
      ana.email,
      '17/05/1990',
      'São Paulo',
      'SP',
      'Brasil',
    ]) {
      expect(panel.textContent).toContain(value);
    }
    expect(panel.querySelector('a')?.getAttribute('href')).toBe('mailto:ana@example.com');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    buttons[1].click();
    await harness.fixture.whenStable();
    expect(panel.textContent).toContain('Bruno Souza');
    expect(panel.textContent).toContain('bruno@example.com');
    expect(panel.textContent).not.toContain('Ana Silva');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('shows empty states for an event without people or bands', async () => {
    await harness.navigateByUrl('/events/1', EventDetails);
    respond([{ ...event, bands: [] }], [], []);
    await harness.fixture.whenStable();
    expect(element().textContent).toContain('No registered people.');
    expect(element().textContent).toContain('No bands listed.');
    expect(element().querySelector('button')).toBeNull();
  });

  it.each([
    { label: 'missing', events: [] },
    { label: 'deleted', events: [{ ...event, deletedAt: '2026-10-01T00:00:00Z' }] },
  ])('shows not found for a $label event', async ({ events }) => {
    await harness.navigateByUrl('/events/1', EventDetails);
    respond(events);
    await harness.fixture.whenStable();
    expect(element().textContent).toContain('Event not found');
    expect(element().querySelector('#person-details')).toBeNull();
  });

  it.each(['abc', '0', '-1', '1.5'])(
    'rejects invalid event ID %s without fetching mocks',
    async (id) => {
      await harness.navigateByUrl(`/events/${id}`, EventDetails);
      expect(element().textContent).toContain('Event not found');
      http.expectNone('mocks/events.json');
      http.expectNone('mocks/registrations.json');
      http.expectNone('mocks/event-registrations.json');
    },
  );

  it('shows an error when a mock fails to load', async () => {
    await harness.navigateByUrl('/events/1', EventDetails);
    http.expectOne('mocks/events.json').flush([event]);
    http.expectOne('mocks/registrations.json').flush([]);
    http
      .expectOne('mocks/event-registrations.json')
      .flush('Failure', { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    expect(element().querySelector('[role="alert"]')?.textContent).toContain('Unable to load');
    expect(element().querySelector('[role="status"]')).toBeNull();
  });

  it('reloads details and clears the selection when the event ID changes on the same page', async () => {
    const component = await harness.navigateByUrl('/events/1', EventDetails);
    respond();
    await harness.fixture.whenStable();
    element().querySelector<HTMLButtonElement>('button')!.click();
    await harness.fixture.whenStable();
    expect(element().querySelector('#person-details')?.textContent).toContain(ana.email);
    expect(await harness.navigateByUrl('/events/2', EventDetails)).toBe(component);
    expect(element().querySelector('#person-details')).toBeNull();
    respond([{ ...event, id: 2, name: 'Second Event' }]);
    await harness.fixture.whenStable();
    expect(element().querySelector('h1')?.textContent).toBe('Second Event');
    expect(element().querySelector('button')?.textContent).toContain('Other Event Person');
    expect(element().querySelector('#person-details')?.textContent).toContain('Select a person');
  });
});
