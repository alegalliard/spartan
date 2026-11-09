import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { EventWithRegistrationCountI } from '../../event.model';

@Component({
  selector: 'app-events-table',
  imports: [DatePipe, RouterLink, HlmTableImports],
  templateUrl: './events-table.html',
})
export class EventsTable {
  readonly events = input.required<EventWithRegistrationCountI[]>();
}
