import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EventDetails } from './pages/events/event-details/event-details';
import { NotFound } from './pages/not-found/not-found';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { routes } from './app.routes';

import { EventsList as EventsPage } from './pages/events/list/list.js';
import { RegistrationsList as RegistrationsPage } from './pages/registrations/list/list.js';

describe('App navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClientTesting()],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should render the Events page at /events', async () => {
    const harness = await RouterTestingHarness.create();

    const page = await harness.navigateByUrl('/events', EventsPage);

    TestBed.inject(HttpTestingController).expectOne('mocks/events.json').flush([]);
    TestBed.inject(HttpTestingController).expectOne('mocks/registrations.json').flush([]);
    TestBed.inject(HttpTestingController).expectOne('mocks/event-registrations.json').flush([]);
    await harness.fixture.whenStable();
    expect(page).toBeInstanceOf(EventsPage);
  });

  it('should render the Registrations page at /registrations', async () => {
    const harness = await RouterTestingHarness.create();

    const page = await harness.navigateByUrl('/registrations', RegistrationsPage);

    TestBed.inject(HttpTestingController).expectOne('mocks/registrations.json').flush([]);
    await harness.fixture.whenStable();
    expect(page).toBeInstanceOf(RegistrationsPage);
  });
  it('renders event details for an event ID', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/events/42', EventDetails)).toBeInstanceOf(EventDetails);
    TestBed.inject(HttpTestingController).expectOne('mocks/events.json').flush([]);
    TestBed.inject(HttpTestingController).expectOne('mocks/registrations.json').flush([]);
    TestBed.inject(HttpTestingController).expectOne('mocks/event-registrations.json').flush([]);
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('Event not found');
  });

  it.each(['/', '/unknown', '/events/42/unknown'])('renders not found at %s', async (url) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, NotFound);
    expect(harness.routeNativeElement?.textContent).toContain('Page not found');
  });
});
