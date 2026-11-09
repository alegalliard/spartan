import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { EventI } from '../events/event.model';
import { EventsService } from './events.service.js';

describe('EventsService', () => {
  let service: EventsService;
  let httpTesting: HttpTestingController;

  function createEvent(id: number, date: string, deletedAt: string | null = null): EventI {
    return {
      id,
      name: `Underground Event ${id}`,
      date,
      bands: ['Slow Abyss', 'Vigil'],
      createdAt: '2026-09-01T14:00:00Z',
      updatedAt: '2026-09-15T18:30:00Z',
      deletedAt,
    };
  }

  const firstEvent = createEvent(1, '2026-10-03');
  const secondEvent = createEvent(2, '2026-11-14');
  const thirdEvent = createEvent(3, '2026-12-05');

  const deletedEvent = createEvent(4, '2026-11-21', '2026-11-08T16:00:00Z');

  // Fora de ordem para verificar também a ordenação por data.
  const mockEvents: EventI[] = [thirdEvent, deletedEvent, firstEvent, secondEvent];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });

    service = TestBed.inject(EventsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function respondWith(events: EventI[]): void {
    const request = httpTesting.expectOne({
      method: 'GET',
      url: 'mocks/events.json',
    });

    request.flush(events);
    httpTesting.expectOne('mocks/registrations.json').flush([]);
    httpTesting.expectOne('mocks/event-registrations.json').flush([]);
  }

  it('should return sorted active events with default pagination', async () => {
    const result = firstValueFrom(service.getEvents());

    respondWith(mockEvents);

    expect(await result).toEqual({
      data: [firstEvent, secondEvent, thirdEvent].map((event) => ({
        ...event,
        registrationCount: 0,
      })),
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it.each([
    {
      page: 1,
      expectedData: [firstEvent, secondEvent],
      hasNextPage: true,
      hasPreviousPage: false,
    },
    {
      page: 2,
      expectedData: [thirdEvent],
      hasNextPage: false,
      hasPreviousPage: true,
    },
  ])(
    'should return the correct data and metadata for page $page',
    async ({ page, expectedData, hasNextPage, hasPreviousPage }) => {
      const result = firstValueFrom(service.getEvents(page, 2));

      respondWith(mockEvents);

      expect(await result).toEqual({
        data: expectedData.map((event) => ({ ...event, registrationCount: 0 })),
        pagination: {
          currentPage: page,
          pageSize: 2,
          totalItems: 3,
          totalPages: 2,
          hasNextPage,
          hasPreviousPage,
        },
      });
    },
  );

  it('should use the last page when the requested page exceeds the total', async () => {
    const result = firstValueFrom(service.getEvents(99, 2));

    respondWith(mockEvents);

    const response = await result;

    expect(response.data).toEqual([{ ...thirdEvent, registrationCount: 0 }]);
    expect(response.pagination.currentPage).toBe(2);
    expect(response.pagination.hasNextPage).toBe(false);
  });

  it('should return empty pagination when there are no active events', async () => {
    const result = firstValueFrom(service.getEvents(1, 10));

    // Um arquivo com apenas registros excluídos também deve resultar
    // em uma listagem vazia.
    respondWith([deletedEvent]);

    expect(await result).toEqual({
      data: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('should propagate an error when the request fails', async () => {
    const result = firstValueFrom(service.getEvents());

    const assertion = expect(result).rejects.toMatchObject({
      status: 404,
      statusText: 'Not Found',
    } satisfies Partial<HttpErrorResponse>);

    const request = httpTesting.expectOne({
      method: 'GET',
      url: 'mocks/events.json',
    });

    httpTesting.expectOne('mocks/registrations.json').flush([]);
    httpTesting.expectOne('mocks/event-registrations.json').flush([]);
    request.flush('File not found', {
      status: 404,
      statusText: 'Not Found',
    });

    await assertion;
  });
  it('sorts events with equal dates by ID across page boundaries', async () => {
    const earlier = createEvent(1, '2026-11-09');
    const later = createEvent(2, '2026-11-09');
    const result = firstValueFrom(service.getEvents(2, 1));
    respondWith([later, earlier]);
    expect((await result).data).toEqual([{ ...later, registrationCount: 0 }]);
  });

  it.each([
    { page: 0, limit: 2, currentPage: 1, pageSize: 2, ids: [1, 2] },
    { page: -3, limit: 2, currentPage: 1, pageSize: 2, ids: [1, 2] },
    { page: 2.9, limit: 1, currentPage: 2, pageSize: 1, ids: [2] },
    { page: 1, limit: 0, currentPage: 1, pageSize: 1, ids: [1] },
    { page: 1, limit: -2, currentPage: 1, pageSize: 1, ids: [1] },
    { page: 1, limit: 2.9, currentPage: 1, pageSize: 2, ids: [1, 2] },
  ])(
    'normalizes page $page and limit $limit',
    async ({ page, limit, currentPage, pageSize, ids }) => {
      const result = firstValueFrom(service.getEvents(page, limit));
      respondWith(mockEvents);
      const response = await result;
      expect(response.data.map((event) => event.id)).toEqual(ids);
      expect(response.pagination).toEqual({
        currentPage,
        pageSize,
        totalItems: 3,
        totalPages: Math.ceil(3 / pageSize),
        hasNextPage: currentPage < Math.ceil(3 / pageSize),
        hasPreviousPage: currentPage > 1,
      });
    },
  );

  it('returns empty pagination at page one for an empty file and a high requested page', async () => {
    const result = firstValueFrom(service.getEvents(99, 10));
    respondWith([]);
    expect(await result).toEqual({
      data: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });
  it('counts distinct active people per event, ignoring deleted and missing people', async () => {
    const result = firstValueFrom(service.getEvents());
    httpTesting.expectOne('mocks/events.json').flush(mockEvents);
    httpTesting.expectOne('mocks/registrations.json').flush([
      { id: 10, deletedAt: null },
      { id: 20, deletedAt: null },
      { id: 30, deletedAt: '2026-11-01T00:00:00Z' },
    ]);
    httpTesting.expectOne('mocks/event-registrations.json').flush([
      { id: 1, eventId: 1, registrationId: 10 },
      { id: 2, eventId: 1, registrationId: 20 },
      { id: 3, eventId: 1, registrationId: 10 },
      { id: 4, eventId: 1, registrationId: 30 },
      { id: 5, eventId: 1, registrationId: 99 },
      { id: 6, eventId: 2, registrationId: 10 },
      { id: 7, eventId: 4, registrationId: 20 },
      { id: 8, eventId: 99, registrationId: 20 },
    ]);
    const response = await result;
    expect(response.data.map((event) => [event.id, event.registrationCount])).toEqual([
      [1, 2],
      [2, 1],
      [3, 0],
    ]);
    expect(response.pagination.totalItems).toBe(3);
  });

  it.each(['mocks/registrations.json', 'mocks/event-registrations.json'])(
    'propagates errors loading %s',
    async (url) => {
      const result = firstValueFrom(service.getEvents());
      const assertion = expect(result).rejects.toMatchObject({ status: 500 });
      httpTesting.expectOne('mocks/events.json').flush(mockEvents);
      const people = httpTesting.expectOne('mocks/registrations.json');
      const links = httpTesting.expectOne('mocks/event-registrations.json');
      if (url === 'mocks/registrations.json') {
        links.flush([]);
        people.flush('Failure', { status: 500, statusText: 'Server Error' });
      } else {
        people.flush([]);
        links.flush('Failure', { status: 500, statusText: 'Server Error' });
      }
      await assertion;
    },
  );
});
