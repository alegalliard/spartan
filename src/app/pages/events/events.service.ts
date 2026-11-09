import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { EventRegistrationI } from '../registrations/event-registration.model';
import { RegistrationI } from '../registrations/registration.model';

import {
  EventDetailsI,
  EventI,
  EventWithRegistrationCountI,
  PaginatedResponseI,
} from './event.model';

@Service()
export class EventsService {
  private readonly http = inject(HttpClient);

  getEvents(page = 1, limit = 10): Observable<PaginatedResponseI<EventWithRegistrationCountI>> {
    return this.loadData().pipe(
      map(({ events, registrations, links }) => {
        const activeIds = new Set(
          registrations.filter((person) => person.deletedAt === null).map((person) => person.id),
        );
        const peopleByEvent = new Map<number, Set<number>>();
        for (const link of links) {
          if (!activeIds.has(link.registrationId)) continue;
          const people = peopleByEvent.get(link.eventId) ?? new Set<number>();
          people.add(link.registrationId);
          peopleByEvent.set(link.eventId, people);
        }
        // Excluídos não entram na listagem nem no total.
        const activeEvents = events.filter((event) => event.deletedAt === null);

        // Ordenação consistente entre as páginas.
        const sortedEvents = [...activeEvents].sort(
          (a, b) => a.date.localeCompare(b.date) || a.id - b.id,
        );

        const totalItems = sortedEvents.length;
        const pageSize = Math.max(1, Math.trunc(limit));
        const totalPages = Math.ceil(totalItems / pageSize);

        // Limita a página solicitada ao intervalo disponível.
        // Se a lista estiver vazia, mantém currentPage = 1.
        const currentPage = Math.min(Math.max(1, Math.trunc(page)), Math.max(1, totalPages));

        const start = (currentPage - 1) * pageSize;

        return {
          data: sortedEvents.slice(start, start + pageSize).map((event) => ({
            ...event,
            registrationCount: peopleByEvent.get(event.id)?.size ?? 0,
          })),
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

  getEventDetails(id: number): Observable<EventDetailsI | null> {
    if (!Number.isSafeInteger(id) || id < 1) return of(null);

    return this.loadData().pipe(
      map(({ events, registrations, links }) => {
        const event = events.find((event) => event.id === id && event.deletedAt === null);
        if (!event) return null;
        const registrationIds = new Set(
          links.filter((link) => link.eventId === id).map((link) => link.registrationId),
        );
        const people = registrations
          .filter((person) => person.deletedAt === null && registrationIds.has(person.id))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id - b.id);
        return { event, registrations: people };
      }),
    );
  }

  private loadData() {
    return forkJoin({
      events: this.http.get<EventI[]>('mocks/events.json'),
      registrations: this.http.get<RegistrationI[]>('mocks/registrations.json'),
      links: this.http.get<EventRegistrationI[]>('mocks/event-registrations.json'),
    });
  }
}
