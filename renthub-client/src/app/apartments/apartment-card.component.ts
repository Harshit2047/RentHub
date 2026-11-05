import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavouriteService } from '../core/favourite.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-apartment-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="apartment-card hover:shadow-xl transition-all duration-200 group cursor-pointer"
         [routerLink]="['/apartments', apartment?.id]">

      <!-- Image + badges -->
      <div class="apartment-card-image aspect-[16/10] overflow-hidden relative">
        <img
          *ngIf="apartment?.images && apartment?.images?.length > 0"
          [src]="apartment.images[0].url"
          [alt]="apartment?.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <!-- No-image placeholder -->
        <div *ngIf="!apartment?.images || apartment?.images?.length === 0"
             class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span class="text-xs text-slate-400 mt-2">No Image</span>
        </div>

        <!-- Status badge -->
        <div class="absolute top-3 left-3">
          <span class="badge"
                [class.badge-available]="apartment?.status === 'AVAILABLE'"
                [class.badge-rented]="apartment?.status === 'RENTED'"
                [class.badge-pending]="apartment?.status === 'PENDING'">
            {{ apartment?.status ?? 'AVAILABLE' }}
          </span>
        </div>

        <!-- Favourite button -->
        <button
          type="button"
          class="apt-fav-btn"
          [class.apt-fav-btn--active]="isFav"
          [attr.aria-label]="isFav ? 'Remove from favourites' : 'Add to favourites'"
          title="{{ isFav ? 'Remove from favourites' : 'Add to favourites' }}"
          (click)="onFavClick($event)"
          [disabled]="favLoading"
        >
          <!-- Unfavourited outline heart -->
          <svg *ngIf="!isFav" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <!-- Favourited solid vibrant red heart -->
          <svg *ngIf="isFav" width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="apartment-card-content p-4 flex-1">
        <h3 class="apartment-card-title text-base font-semibold text-text-primary mb-1 line-clamp-2">
          {{ apartment?.title }}
        </h3>

        <!-- Location -->
        <p *ngIf="apartment?.city" class="flex items-center gap-1 text-xs text-text-muted mb-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {{ apartment?.city }}{{ apartment?.state ? ', ' + apartment?.state : '' }}
        </p>

        <!-- Specs -->
        <div class="flex items-center gap-3 mb-3 text-xs text-text-secondary">
          <span class="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {{ apartment?.bedrooms }} bed
          </span>
          <span class="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M5 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/>
              <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
            </svg>
            {{ apartment?.bathrooms }} bath
          </span>
          <span *ngIf="apartment?.furnished" class="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Furnished
          </span>
        </div>

        <!-- Rent -->
        <div class="apartment-card-rent text-primary font-bold text-lg">
          {{ formatRent(apartment?.monthlyRent) }}<span class="text-xs font-normal text-text-muted">/mo</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="apartment-card-actions flex items-center justify-between pt-2 px-4 pb-3 border-t border-border mt-auto">
        <button
          type="button"
          class="apartment-card-view-btn text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          (click)="$event.stopPropagation(); viewDetails.emit(apartment?.id)"
        >
          View Details
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <span class="text-xs text-text-muted">
          {{ apartment?.squareFootage ? apartment?.squareFootage + ' sq ft' : '' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .apt-fav-btn {
      position: absolute; top: 0.75rem; right: 0.75rem;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.95); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(0,0,0,0.08); cursor: pointer; color: #64748b;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
    }
    .apt-fav-btn:hover {
      transform: scale(1.15);
      background: #ffffff;
      border-color: #fca5a5;
    }
    .apt-fav-btn--active {
      background: #ffffff;
      border-color: #f87171;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);
    }
    .apt-fav-btn:disabled { opacity: 0.6; cursor: wait; }
  `],
})
export class ApartmentCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() apartment: any = {};
  @Input() isLandlord = false;

  @Output() viewDetails    = new EventEmitter<string>();
  @Output() toggleFavorite = new EventEmitter<string>();

  isFav = false;
  favLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private favService: FavouriteService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.updateFavStatus(this.favService.getFavouriteIds());

    // Reactively sync heart state from shared BehaviorSubject
    this.favService.favouriteIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ids => {
        this.updateFavStatus(ids);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apartment']) {
      this.updateFavStatus(this.favService.getFavouriteIds());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFavStatus(ids: Set<string>): void {
    const id = this.apartment?.id;
    const shouldBeFav = id ? ids.has(id) : false;
    if (this.isFav !== shouldBeFav) {
      this.isFav = shouldBeFav;
      this.cdr.detectChanges();
    }
  }

  onFavClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.apartment?.id || this.favLoading) return;

    if (!this.authService.isAuthenticated()) {
      this.toast.warning('Please log in to save favourite apartments.');
      this.router.navigate(['/login']);
      return;
    }

    this.favLoading = true;
    this.favService.toggleFavourite(this.apartment.id).subscribe({
      next: (isFav) => {
        this.favLoading = false;
        this.isFav = isFav;
        this.cdr.detectChanges();
        this.toast.success(isFav ? 'Added to favourites!' : 'Removed from favourites');
        this.toggleFavorite.emit(this.apartment.id);
      },
      error: (err) => {
        this.favLoading = false;
        this.updateFavStatus(this.favService.getFavouriteIds());
        if (err?.status === 401) {
          this.toast.warning('Session expired. Please log in again.');
          this.router.navigate(['/login']);
        } else {
          this.toast.error('Could not update favourite. Please try again.');
        }
      },
    });
  }

  formatRent(amount: number | undefined): string {
    if (!amount) return '—';
    return '₹' + amount.toLocaleString('en-IN');
  }
}
