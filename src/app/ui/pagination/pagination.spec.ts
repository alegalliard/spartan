import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    element = fixture.nativeElement;

    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('limit', 10);
  });

  function getButton(label: string): HTMLButtonElement {
    const button = element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);

    if (!button) {
      throw new Error(`Button "${label}" was not rendered`);
    }

    return button;
  }

  function getPageNumbers(): number[] {
    const buttons = element.querySelectorAll<HTMLButtonElement>(
      'button[aria-label^="Go to page "]',
    );

    return Array.from(buttons, (button) => Number(button.textContent?.trim()));
  }

  it.each([0, 1])('should hide pagination when totalPages is %i', (total) => {
    fixture.componentRef.setInput('totalPages', total);

    fixture.detectChanges();

    expect(element.querySelector('nav[aria-label="Pagination"]')).toBeNull();
  });

  it('should show pagination when totalPages is greater than 1', () => {
    fixture.componentRef.setInput('totalPages', 2);

    fixture.detectChanges();

    expect(element.querySelector('nav[aria-label="Pagination"]')).not.toBeNull();
  });

  it.each([
    { current: 1, previousDisabled: true, nextDisabled: false },
    { current: 2, previousDisabled: false, nextDisabled: false },
    { current: 20, previousDisabled: false, nextDisabled: true },
  ])(
    'should set navigation button states on page $current',
    ({ current, previousDisabled, nextDisabled }) => {
      fixture.componentRef.setInput('currentPage', current);

      fixture.detectChanges();

      expect(getButton('Go to first page').disabled).toBe(previousDisabled);
      expect(getButton('Go to previous page').disabled).toBe(previousDisabled);
      expect(getButton('Go to next page').disabled).toBe(nextDisabled);
      expect(getButton('Go to last page').disabled).toBe(nextDisabled);
    },
  );

  it.each([
    {
      total: 7,
      current: 4,
      expected: [1, 2, 3, 4, 5, 6, 7],
      ellipsisCount: 0,
    },
    {
      total: 8,
      current: 1,
      expected: [1, 2, 3, 4, 5, 8],
      ellipsisCount: 1,
    },
    {
      total: 60,
      current: 1,
      expected: [1, 2, 3, 4, 5, 60],
      ellipsisCount: 1,
    },
    {
      total: 60,
      current: 30,
      expected: [1, 29, 30, 31, 60],
      ellipsisCount: 2,
    },
    { total: 60, current: 4, expected: [1, 2, 3, 4, 5, 60], ellipsisCount: 1 },
    { total: 60, current: 5, expected: [1, 4, 5, 6, 60], ellipsisCount: 2 },
    { total: 60, current: 56, expected: [1, 55, 56, 57, 60], ellipsisCount: 2 },
    { total: 60, current: 57, expected: [1, 56, 57, 58, 59, 60], ellipsisCount: 1 },
    {
      total: 60,
      current: 60,
      expected: [1, 56, 57, 58, 59, 60],
      ellipsisCount: 1,
    },
  ])(
    'should render the page window for page $current of $total',
    ({ total, current, expected, ellipsisCount }) => {
      fixture.componentRef.setInput('totalPages', total);
      fixture.componentRef.setInput('currentPage', current);

      fixture.detectChanges();

      expect(getPageNumbers()).toEqual(expected);

      const ellipses = Array.from(element.querySelectorAll('span[aria-hidden="true"]')).filter(
        (span) => span.textContent?.trim() === '…',
      );

      expect(ellipses).toHaveLength(ellipsisCount);
    },
  );

  it('should identify the current page with aria-current', () => {
    fixture.detectChanges();

    const currentPages = element.querySelectorAll('button[aria-current="page"]');

    expect(currentPages).toHaveLength(1);
    expect(currentPages[0].textContent?.trim()).toBe('2');
  });

  it.each([
    { label: 'Go to first page', expected: 1 },
    { label: 'Go to previous page', expected: 9 },
    { label: 'Go to next page', expected: 11 },
    { label: 'Go to last page', expected: 20 },
    { label: 'Go to page 11', expected: 11 },
  ])('should emit $expected when clicking "$label"', ({ label, expected }) => {
    fixture.componentRef.setInput('currentPage', 10);

    fixture.detectChanges();

    const onSelectPage = vi.fn();
    fixture.componentInstance.selectPage.subscribe(onSelectPage);

    getButton(label).click();

    expect(onSelectPage).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('should not emit when clicking the current page', () => {
    fixture.detectChanges();

    const onSelectPage = vi.fn();
    fixture.componentInstance.selectPage.subscribe(onSelectPage);

    getButton('Go to page 2').click();

    expect(onSelectPage).not.toHaveBeenCalled();
  });

  it.each([
    { current: 1, label: 'Go to first page' },
    { current: 1, label: 'Go to previous page' },
    { current: 20, label: 'Go to next page' },
    { current: 20, label: 'Go to last page' },
  ])('should not emit when clicking disabled "$label"', ({ current, label }) => {
    fixture.componentRef.setInput('currentPage', current);

    fixture.detectChanges();

    const onSelectPage = vi.fn();
    fixture.componentInstance.selectPage.subscribe(onSelectPage);

    getButton(label).click();

    expect(onSelectPage).not.toHaveBeenCalled();
  });
  it('updates page numbers, current page and navigation when inputs change', () => {
    fixture.detectChanges();
    fixture.componentRef.setInput('currentPage', 19);
    fixture.detectChanges();
    expect(getPageNumbers()).toEqual([1, 16, 17, 18, 19, 20]);
    expect(getButton('Go to page 19').getAttribute('aria-current')).toBe('page');
    expect(getButton('Go to page 20').getAttribute('aria-current')).toBeNull();
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();
    expect(getPageNumbers()).toEqual([1, 2, 3]);
    expect(getButton('Go to next page').disabled).toBe(true);
    expect(element.textContent).toContain('Page 3 of 3');
    fixture.componentRef.setInput('totalPages', 1);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    expect(element.querySelector('nav')).toBeNull();
  });
});
