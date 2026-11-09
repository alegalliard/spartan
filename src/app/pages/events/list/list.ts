import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Pagination } from '../../../ui/pagination/pagination';
import { EventsService } from '../events.service.js';
import { EventsTable } from './events-table/events-table';
@Component({
  imports: [AsyncPipe, Pagination, EventsTable],
  selector: 'app-events-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class EventsList {
  currentPage = 1;
  private readonly eventsService = inject(EventsService);

  protected readonly limit = 10;
  protected events$ = this.eventsService.getEvents(this.currentPage, this.limit);

  protected loadPage(page: number): void {
    this.events$ = this.eventsService.getEvents(page, this.limit);
  }

  goToPage(value: number) {
    this.currentPage = value;
  }
}
