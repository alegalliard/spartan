import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RegistrationI } from './registration.model';
import { RegistrationsService } from './registrations.service';

const person: RegistrationI = {
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

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let http: HttpTestingController;
  const people = [
    { ...person, id: 3, name: 'Zélia' },
    { ...person, id: 2, name: 'Ágata' },
    { ...person, id: 4, name: 'Deleted', deletedAt: '2026-08-01T00:00:00Z' },
    { ...person, id: 1, name: 'Ágata' },
  ];
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] });
    service = TestBed.inject(RegistrationsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function respond(data = people) {
    http.expectOne({ method: 'GET', url: 'mocks/registrations.json' }).flush(data);
  }
  it('returns active people sorted by Portuguese name and ID with default pagination', async () => {
    const result = firstValueFrom(service.getRegistrations());
    respond();
    const response = await result;
    expect(response.data.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(response.pagination).toEqual({
      currentPage: 1,
      pageSize: 10,
      totalItems: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
  it.each([
    { page: 1, limit: 2, current: 1, size: 2, ids: [1, 2] },
    { page: 2, limit: 2, current: 2, size: 2, ids: [3] },
    { page: 99, limit: 2, current: 2, size: 2, ids: [3] },
    { page: 0, limit: 2, current: 1, size: 2, ids: [1, 2] },
    { page: -1, limit: 2, current: 1, size: 2, ids: [1, 2] },
    { page: 2.9, limit: 1, current: 2, size: 1, ids: [2] },
    { page: 1, limit: 0, current: 1, size: 1, ids: [1] },
    { page: 1, limit: -2, current: 1, size: 1, ids: [1] },
    { page: 1, limit: 2.9, current: 1, size: 2, ids: [1, 2] },
  ])('paginates page $page with limit $limit', async ({ page, limit, current, size, ids }) => {
    const result = firstValueFrom(service.getRegistrations(page, limit));
    respond();
    const response = await result;
    expect(response.data.map((p) => p.id)).toEqual(ids);
    expect(response.pagination).toEqual({
      currentPage: current,
      pageSize: size,
      totalItems: 3,
      totalPages: Math.ceil(3 / size),
      hasNextPage: current < Math.ceil(3 / size),
      hasPreviousPage: current > 1,
    });
  });
  it.each([{ data: [] }, { data: [people[2]] }])(
    'returns empty pagination without active people ($data)',
    async ({ data }) => {
      const result = firstValueFrom(service.getRegistrations(99));
      respond(data);
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
    },
  );
  it('propagates HTTP errors', async () => {
    const result = firstValueFrom(service.getRegistrations());
    const assertion = expect(result).rejects.toMatchObject({ status: 500 });
    http
      .expectOne('mocks/registrations.json')
      .flush('Failure', { status: 500, statusText: 'Server Error' });
    await assertion;
  });
});
