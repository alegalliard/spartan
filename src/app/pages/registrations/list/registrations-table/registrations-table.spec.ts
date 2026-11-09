import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationI } from '../../registration.model';
import { RegistrationsTable } from './registrations-table';

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

describe('RegistrationsTable', () => {
  let fixture: ComponentFixture<RegistrationsTable>;
  let element: HTMLElement;
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 9, 12));
    fixture = TestBed.createComponent(RegistrationsTable);
    element = fixture.nativeElement;
    fixture.componentRef.setInput('registrations', [person]);
    fixture.detectChanges();
  });
  afterEach(() => vi.useRealTimers());

  it('renders age and contact information without CPF, country or birthdate', () => {
    expect(
      Array.from(element.querySelectorAll('tbody td'), (cell) => cell.textContent?.trim()),
    ).toEqual(['Ana Silva', 'ana@example.com', '36', 'São Paulo', 'SP']);
    expect(
      Array.from(element.querySelectorAll('th[scope="col"]'), (cell) => cell.textContent?.trim()),
    ).toEqual(['Name', 'Email', 'Age', 'City', 'State']);
    expect(element.textContent).not.toContain(person.CPF);
    expect(element.textContent).not.toContain(person.country);
    expect(element.textContent).not.toContain(person.birthdate);
    expect(element.textContent).not.toContain('17/05/1990');
    expect(element.querySelector('time')).toBeNull();
  });

  it.each([
    { birthdate: '1990-11-10', age: 35 },
    { birthdate: '1990-11-09', age: 36 },
    { birthdate: '1990-11-08', age: 36 },
    { birthdate: '1990-12-01', age: 35 },
    { birthdate: '1990-01-01', age: 36 },
    { birthdate: '2026-11-09', age: 0 },
  ])('renders age $age for birthdate $birthdate', ({ birthdate, age }) => {
    fixture.componentRef.setInput('registrations', [{ ...person, birthdate }]);
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody td')[2].textContent?.trim()).toBe(String(age));
  });

  it.each([
    { today: new Date(2027, 1, 28, 12), age: 26 },
    { today: new Date(2027, 2, 1, 12), age: 27 },
    { today: new Date(2028, 1, 29, 12), age: 28 },
  ])('calculates leap-day birthdays on $today', ({ today, age }) => {
    vi.setSystemTime(today);
    fixture.componentRef.setInput('registrations', [{ ...person, birthdate: '2000-02-29' }]);
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody td')[2].textContent?.trim()).toBe(String(age));
  });
  it('updates rows when the input changes', () => {
    fixture.componentRef.setInput('registrations', [
      { ...person, id: 2, name: 'Bruno Souza' },
      person,
    ]);
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(element.querySelector('tbody td')?.textContent?.trim()).toBe('Bruno Souza');
  });
  it('replaces rows with an empty state spanning all columns', () => {
    fixture.componentRef.setInput('registrations', []);
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(element.querySelector('tbody td')?.getAttribute('colspan')).toBe('5');
    expect(element.textContent).toContain('No registrations found.');
    expect(element.querySelector('time')).toBeNull();
  });
});
