import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RegistrationI } from '../registration.model';
import { RegistrationsList } from './list';

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

describe('RegistrationsList integration', () => {
  let fixture: ComponentFixture<RegistrationsList>;
  let http: HttpTestingController;
  const people = Array.from({ length: 11 }, (_, i) => ({
    ...person,
    id: i + 1,
    name: `Pessoa ${String(i + 1).padStart(2, '0')}`,
  }));
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegistrationsList);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  it('loads ten active people and updates the table when navigating forward and back', async () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-registrations-table')).toBeNull();
    const data = [
      ...people,
      { ...person, id: 12, name: 'Deleted', deletedAt: '2026-08-01T00:00:00Z' },
    ];
    http.expectOne({ method: 'GET', url: 'mocks/registrations.json' }).flush(data);
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(10);
    expect(element.querySelector('tbody td')?.textContent?.trim()).toBe('Pessoa 01');
    expect(element.textContent).not.toContain('Deleted');
    expect(element.textContent).toContain('Page 1 of 2');
    element.querySelector<HTMLButtonElement>('[aria-label="Go to next page"]')!.click();
    fixture.detectChanges();
    http.expectOne('mocks/registrations.json').flush(data);
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(element.querySelector('tbody td')?.textContent?.trim()).toBe('Pessoa 11');
    expect(element.textContent).toContain('Page 2 of 2');
    expect(
      element.querySelector<HTMLButtonElement>('[aria-label="Go to next page"]')!.disabled,
    ).toBe(true);
    element.querySelector<HTMLButtonElement>('[aria-label="Go to previous page"]')!.click();
    fixture.detectChanges();
    http.expectOne('mocks/registrations.json').flush(data);
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(10);
    expect(element.textContent).toContain('Page 1 of 2');
  });
  it('renders an empty state without pagination', async () => {
    http.expectOne('mocks/registrations.json').flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No registrations found.');
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });
});
