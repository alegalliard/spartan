import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PaginatedResponse } from '../../ui/pagination/pagination.model';
import { RegistrationI } from './registration.model';

@Service()
export class RegistrationsService {
  private readonly http = inject(HttpClient);

  getRegistrations(page = 1, limit = 10): Observable<PaginatedResponse<RegistrationI>> {
    return this.http.get<RegistrationI[]>('mocks/registrations.json').pipe(
      map((registrations) => {
        const active = registrations.filter((person) => person.deletedAt === null);
        const sorted = active.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id - b.id);
        const totalItems = sorted.length;
        const pageSize = Math.max(1, Math.trunc(limit));
        const totalPages = Math.ceil(totalItems / pageSize);
        const currentPage = Math.min(Math.max(1, Math.trunc(page)), Math.max(1, totalPages));
        const start = (currentPage - 1) * pageSize;

        return {
          data: sorted.slice(start, start + pageSize),
          pagination: {
            currentPage,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
          },
        };
      }),
    );
  }
}
