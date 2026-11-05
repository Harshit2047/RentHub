import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavouriteService } from '../core/favourite.service';
import { Apartment } from '../models/apartment.model';
import { ApartmentCardComponent } from '../apartments/apartment-card.component';
import { ApartmentFiltersComponent, FilterState } from '../shared/apartment-filters.component';
import { ToastService } from '../shared/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, RouterLink, ApartmentCardComponent, ApartmentFiltersComponent],
  template: `
    <div class="dash-page">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">My Favourites</h1>
          <p class="dash-subtitle" *ngIf="!isLoading">
            {{ filteredFavourites.length }} of {{ allFavourites.length }} saved {{ allFavourites.length === 1 ? 'apartment' : 'apartments' }} shown
          </p>
          <p class="dash-subtitle" *ngIf="isLoading">Loading saved apartments…</p>
        </div>
        <a routerLink="/apartments" class="btn-primary" style="font-size:0.875rem;padding:0.5rem 1.1rem;border-radius:8px;">
          Browse More
        </a>
      </div>

      <!-- Integrated Filter & Search Bar (Available for Favourites) -->
      <app-apartment-filters
        *ngIf="allFavourites.length > 0 || !isLoading"
        [initialValues]="currentFilterState"
        (filterChange)="onFilterStateChanged($event)"
      ></app-apartment-filters>

      <!-- Skeleton Loading -->
      <div *ngIf="isLoading" class="apartment-grid">
        <div *ngFor="let n of skeletons" class="skeleton-card">
          <div class="skeleton-img shimmer"></div>
          <div class="skeleton-body">
            <div class="skeleton-line shimmer" style="width:70%;height:16px;border-radius:6px"></div>
            <div class="skeleton-line shimmer" style="width:40%;height:12px;border-radius:6px;margin-top:8px"></div>
            <div class="skeleton-line shimmer" style="width:30%;height:20px;border-radius:6px;margin-top:12px"></div>
          </div>
          <div class="skeleton-footer shimmer"></div>
        </div>
      </div>

      <!-- Results Grid -->
      <div *ngIf="!isLoading && filteredFavourites.length > 0" class="apartment-grid">
        <app-apartment-card
          *ngFor="let apt of filteredFavourites; trackBy: trackByAptId"
          [apartment]="apt"
          (viewDetails)="onView(apt.id)"
          (toggleFavorite)="onRemoveFav($event || apt.id)"
        ></app-apartment-card>
      </div>

      <!-- No Filter Matches State -->
      <div *ngIf="!isLoading && allFavourites.length > 0 && filteredFavourites.length === 0" class="apt-empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.3">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3>No matching saved apartments</h3>
        <p>None of your saved favourites match the selected filter criteria.</p>
        <button
          type="button"
          (click)="onResetFilters()"
          class="btn-primary"
          style="display:inline-flex;margin-top:1rem;padding:0.5rem 1.25rem;border-radius:8px;font-size:0.875rem;"
        >
          Reset Filters
        </button>
      </div>

      <!-- Completely Empty Favourites State -->
      <div *ngIf="!isLoading && allFavourites.length === 0" class="apt-empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h3>No favourites yet</h3>
        <p>Click the heart icon on any apartment listing to save it here for quick access</p>
        <a routerLink="/apartments" class="btn-primary" style="display:inline-flex;margin-top:1rem;padding:0.5rem 1.25rem;border-radius:8px;font-size:0.875rem;">
          Browse Apartments
        </a>
      </div>

    </div>
  `,
  styles: [],
})
export class FavouritesComponent implements OnInit, OnDestroy {
  allFavourites: Apartment[] = [];
  filteredFavourites: Apartment[] = [];
  currentFilterState: FilterState = {
    search: '',
    city: '',
    bedrooms: '',
    furnished: '',
    availability: '',
    budgetRange: '',
    sortBy: 'newest'
  };

  isLoading = true;
  readonly skeletons = Array(6).fill(0);
  private destroy$ = new Subject<void>();

  constructor(
    private favService: FavouriteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.favService.loadFavourites()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apts) => {
          this.allFavourites = apts;
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Failed to load favourites.');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });

    // Reactively remove card if favourite status is cleared from anywhere
    this.favService.favouriteIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ids) => {
        if (!this.isLoading && this.allFavourites.length > 0) {
          const filtered = this.allFavourites.filter((a) => ids.has(a.id));
          if (filtered.length !== this.allFavourites.length) {
            this.allFavourites = filtered;
            this.applyFilters();
            this.cdr.detectChanges();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterStateChanged(state: FilterState): void {
    this.currentFilterState = state;
    this.applyFilters();
  }

  onResetFilters(): void {
    this.currentFilterState = {
      search: '',
      city: '',
      bedrooms: '',
      furnished: '',
      availability: '',
      budgetRange: '',
      sortBy: 'newest'
    };
    this.applyFilters();
  }

  private applyFilters(): void {
    const s = this.currentFilterState;
    let list = [...this.allFavourites];

    // Search Keyword filter
    if (s.search && s.search.trim()) {
      const q = s.search.trim().toLowerCase();
      list = list.filter((apt) =>
        (apt.title && apt.title.toLowerCase().includes(q)) ||
        (apt.city && apt.city.toLowerCase().includes(q)) ||
        (apt.address && apt.address.toLowerCase().includes(q)) ||
        (apt.description && apt.description.toLowerCase().includes(q))
      );
    }

    // City filter
    if (s.city && s.city.trim()) {
      const c = s.city.trim().toLowerCase();
      list = list.filter((apt) => apt.city && apt.city.toLowerCase().includes(c));
    }

    // Bedrooms filter
    if (s.bedrooms) {
      const b = Number(s.bedrooms);
      if (b >= 4) {
        list = list.filter((apt) => apt.bedrooms >= 4);
      } else {
        list = list.filter((apt) => apt.bedrooms === b);
      }
    }

    // Furnished filter
    if (s.furnished) {
      list = list.filter((apt) => apt.furnished === s.furnished);
    }

    // Availability filter
    if (s.availability) {
      list = list.filter((apt) => apt.availability === s.availability);
    }

    // Budget Range filter
    if (s.budgetRange) {
      if (s.budgetRange === 'under-15k') {
        list = list.filter((apt) => Number(apt.monthlyRent) <= 15000);
      } else if (s.budgetRange === '15k-30k') {
        list = list.filter((apt) => Number(apt.monthlyRent) >= 15000 && Number(apt.monthlyRent) <= 30000);
      } else if (s.budgetRange === '30k-50k') {
        list = list.filter((apt) => Number(apt.monthlyRent) >= 30000 && Number(apt.monthlyRent) <= 50000);
      } else if (s.budgetRange === 'above-50k') {
        list = list.filter((apt) => Number(apt.monthlyRent) >= 50000);
      }
    }

    // Sorting
    if (s.sortBy === 'price-asc') {
      list.sort((a, b) => Number(a.monthlyRent) - Number(b.monthlyRent));
    } else if (s.sortBy === 'price-desc') {
      list.sort((a, b) => Number(b.monthlyRent) - Number(a.monthlyRent));
    } else {
      // Newest first by createdAt or updatedAt
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    this.filteredFavourites = list;
    this.cdr.detectChanges();
  }

  trackByAptId(index: number, apt: any): string {
    return apt?.id || index.toString();
  }

  onRemoveFav(id: string): void {
    if (!id) return;
    this.allFavourites = this.allFavourites.filter((a) => a.id !== id);
    this.applyFilters();
  }

  onView(id: string): void {
    this.router.navigate(['/apartments', id]);
  }
}
