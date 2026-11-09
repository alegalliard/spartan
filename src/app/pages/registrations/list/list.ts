import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Pagination } from '../../../ui/pagination/pagination';
import { RegistrationsService } from '../registrations.service';
import { RegistrationsTable } from './registrations-table/registrations-table';

@Component({
  imports: [AsyncPipe, Pagination, RegistrationsTable],
  selector: 'app-registrations-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class RegistrationsList {
  private readonly registrationsService = inject(RegistrationsService);
  protected readonly limit = 10;
  protected registrations$ = this.registrationsService.getRegistrations(1, this.limit);

  protected loadPage(page: number): void {
    this.registrations$ = this.registrationsService.getRegistrations(page, this.limit);
  }
}
