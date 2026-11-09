import { Component, input } from '@angular/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { RegistrationI } from '../../registration.model';

@Component({
  selector: 'app-registrations-table',
  imports: [HlmTableImports],
  templateUrl: './registrations-table.html',
})
export class RegistrationsTable {
  readonly registrations = input.required<RegistrationI[]>();

  protected age(birthdate: string): number {
    const [year, month, day] = birthdate.split('-').map(Number);
    const today = new Date();
    const birthdayIsPending =
      today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);

    return today.getFullYear() - year - (birthdayIsPending ? 1 : 0);
  }
}
