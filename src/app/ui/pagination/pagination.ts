import { Component, input, output, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmButtonGroupImports } from '@spartan-ng/helm/button-group';

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

@Component({
  imports: [HlmButtonImports, HlmButtonGroupImports, NgIcon],
  providers: [provideIcons({ lucideArrowRight, lucideArrowLeft })],
  selector: 'app-pagination',
  styleUrl: './pagination.css',
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly totalPages = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly limit = input.required<number>();

  readonly selectPage = output<number>();

  protected readonly pages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    // Poucas páginas: exibe todas.
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    let start: number;
    let end: number;

    if (current <= 4) {
      // Próximo do início: 1 2 3 4 5 … última
      start = 2;
      end = 5;
    } else if (current >= total - 3) {
      // Próximo do fim: 1 … 56 57 58 59 60
      start = total - 4;
      end = total - 1;
    } else {
      // No meio: 1 … anterior atual próxima … última
      start = current - 1;
      end = current + 1;
    }

    const items: PageItem[] = [1];

    if (start === 3) {
      items.push(2);
    } else if (start > 3) {
      items.push('start-ellipsis');
    }

    for (let page = start; page <= end; page++) {
      items.push(page);
    }

    if (end === total - 2) {
      items.push(total - 1);
    } else if (end < total - 2) {
      items.push('end-ellipsis');
    }

    items.push(total);

    return items;
  });

  protected readonly hasPreviousPage = computed(() => this.currentPage() > 1);

  protected readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.selectPage.emit(page);
  }
}
