import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { EventsService } from '../events.service';
import { EventDetailsI } from '../event.model';

type DetailsState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; details: EventDetailsI | null };

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-event-details',
  styleUrl: './event-details.css',
  templateUrl: './event-details.html',
})
export class EventDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly eventsService = inject(EventsService);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly state = toSignal(
    this.route.paramMap.pipe(
      tap(() => this.selectedId.set(null)),
      switchMap((params) =>
        this.eventsService.getEventDetails(Number(params.get('id'))).pipe(
          map((details) => ({ status: 'ready', details }) as DetailsState),
          startWith<DetailsState>({ status: 'loading' }),
          catchError(() => of<DetailsState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as DetailsState },
  );
  protected readonly selectedPerson = computed(() => {
    const state = this.state();
    return state.status === 'ready'
      ? (state.details?.registrations.find((person) => person.id === this.selectedId()) ?? null)
      : null;
  });
}
