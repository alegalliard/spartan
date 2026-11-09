import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    await fixture.whenStable();
  });

  it.each([
    { title: 'Events', url: '/events' },
    { title: 'Registrations', url: '/registrations' },
  ])('should render the $title link point to $url', ({ title, url }) => {
    const element: HTMLElement = fixture.nativeElement;
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a'));

    const link = links.find((item) => item.textContent.trim() === title);

    expect(link, `Link "${title}" should exists`).toBeDefined();
    expect(link?.getAttribute('href')).toBe(url);
  });
});
