import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination-nav" aria-label="Pagination">
      <button
        type="button"
        class="pagination-btn"
        [disabled]="currentPage <= 1"
        (click)="go(currentPage - 1)"
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Prev
      </button>

      <div class="pagination-pages">
        <ng-container *ngFor="let p of pageNumbers">
          <span *ngIf="p === -1" class="pagination-ellipsis">…</span>
          <button
            *ngIf="p !== -1"
            type="button"
            class="pagination-num"
            [class.active]="p === currentPage"
            (click)="go(p)"
          >{{ p }}</button>
        </ng-container>
      </div>

      <button
        type="button"
        class="pagination-btn"
        [disabled]="currentPage >= totalPages"
        (click)="go(currentPage + 1)"
        aria-label="Next page"
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </nav>
  `,
  styles: [`
    .pagination-nav { display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:1.5rem 0; flex-wrap:wrap; }
    .pagination-btn {
      display:inline-flex; align-items:center; gap:0.35rem;
      padding:0.45rem 0.9rem; border-radius:8px; border:1px solid #e2e8f0;
      background:#fff; color:#475569; font-size:0.85rem; font-weight:500;
      cursor:pointer; transition:all 0.15s;
    }
    .pagination-btn:hover:not(:disabled) { background:#f8fafc; border-color:#4f46e5; color:#4f46e5; }
    .pagination-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .pagination-pages { display:flex; align-items:center; gap:0.25rem; }
    .pagination-num {
      width:36px; height:36px; display:flex; align-items:center; justify-content:center;
      border-radius:8px; border:1px solid transparent;
      background:transparent; color:#475569; font-size:0.85rem; font-weight:500; cursor:pointer;
      transition:all 0.15s;
    }
    .pagination-num:hover { background:#f1f5f9; }
    .pagination-num.active { background:#4f46e5; color:#fff; border-color:#4f46e5; }
    .pagination-ellipsis { width:36px; text-align:center; color:#94a3b8; font-size:0.9rem; }
  `],
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    pages.push(1);
    if (cur > 3) pages.push(-1);
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
