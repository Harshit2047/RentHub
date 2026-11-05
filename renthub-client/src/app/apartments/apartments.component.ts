import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Apartment, ApartmentService } from '../core/apartment.service';
import { ApartmentFilters } from '../models/apartment.model';
import { ApartmentCardComponent } from './apartment-card.component';
import { PaginationComponent } from '../shared/pagination.component';
import { ApartmentFiltersComponent, FilterState } from '../shared/apartment-filters.component';
import { ToastService } from '../shared/toast.service';
import { AuthService } from '../core/auth.service';
import { FavouriteService } from '../core/favourite.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-apartments',
  standalone: true,
  imports: [CommonModule, ApartmentCardComponent, PaginationComponent, ApartmentFiltersComponent],
  template: `
    <div class="apartment-listings">

      <!-- Page header -->
      <div class="apt-page-header">
        <div>
          <h2 class="apt-page-title">
            {{ filters.city ? 'Apartments in ' + filters.city : 'All Apartments' }}
          </h2>
          <p class="apt-page-subtitle" *ngIf="!isLoading">
            {{ totalItems }} {{ totalItems === 1 ? 'apartment' : 'apartments' }} found
          </p>
          <p class="apt-page-subtitle" *ngIf="isLoading">Searching listings…</p>
        </div>
      </div>

      <!-- Integrated Filter & Search Bar -->
      <app-apartment-filters
        [initialValues]="filterState"
        (filterChange)="onFilterStateChanged($event)"
      ></app-apartment-filters>

      <!-- ── SKELETON LOADING ── -->
      <div *ngIf="isLoading" class="apartment-grid">
        <div *ngFor="let n of skeletonCards" class="skeleton-card">
          <!-- image placeholder -->
          <div class="skeleton-img shimmer"></div>
          <!-- content placeholders -->
          <div class="skeleton-body">
            <div class="skeleton-line shimmer" style="width:70%;height:16px;border-radius:6px"></div>
            <div class="skeleton-line shimmer" style="width:45%;height:12px;border-radius:6px;margin-top:8px"></div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <div class="skeleton-line shimmer" style="width:56px;height:12px;border-radius:6px"></div>
              <div class="skeleton-line shimmer" style="width:56px;height:12px;border-radius:6px"></div>
              <div class="skeleton-line shimmer" style="width:56px;height:12px;border-radius:6px"></div>
            </div>
            <div class="skeleton-line shimmer" style="width:35%;height:20px;border-radius:6px;margin-top:12px"></div>
          </div>
          <div class="skeleton-footer shimmer"></div>
        </div>
      </div>

      <!-- Error state -->
      <div *ngIf="errorMessage && !isLoading" class="apt-error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ errorMessage }}</p>
        <button class="btn-retry" (click)="onReload()">Try Again</button>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && !errorMessage && apartments.length === 0" class="apt-empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <h3>No apartments found</h3>
        <p>Try adjusting your search criteria or resetting filters</p>
        <button
          type="button"
          (click)="onResetFilters()"
          class="btn-primary"
          style="display:inline-flex;margin-top:1rem;padding:0.5rem 1.25rem;border-radius:8px;font-size:0.875rem;"
        >
          Reset Filters
        </button>
      </div>

      <!-- Results grid -->
      <div class="apartment-grid" *ngIf="!isLoading && apartments.length > 0">
        <app-apartment-card
          *ngFor="let apartment of apartments"
          [apartment]="apartment"
          (viewDetails)="onViewDetails(apartment.id)"
        ></app-apartment-card>
      </div>

      <!-- Pagination -->
      <div class="pagination-area" *ngIf="totalPages > 1 && !isLoading">
        <app-pagination
          [totalItems]="totalItems"
          [currentPage]="currentPage"
          [totalPages]="totalPages"
          (pageChange)="onPageChange($event)"
        ></app-pagination>
      </div>
    </div>
  `,
  styles: [],
})
export class ApartmentsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initialFilters: ApartmentFilters = {};
  @Input() currentUserRole: 'TENANT' | 'LANDLORD' = 'TENANT';

  apartments: Apartment[] = [];
  filters: ApartmentFilters = {};
  filterState: Partial<FilterState> = {};
  isLoading = false;
  errorMessage: string | null = null;
  totalItems = 0;
  currentPage = 1;
  totalPages = 1;
  readonly skeletonCards = Array(9).fill(0);
  private destroy$ = new Subject<void>();

  constructor(
    private apartmentService: ApartmentService,
    private authService: AuthService,
    private favService: FavouriteService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.filterState = {
        city: params['city'] || '',
        search: params['search'] || '',
        bedrooms: params['bedrooms'] ? String(params['bedrooms']) : '',
        furnished: params['furnished'] || '',
        availability: params['availability'] || '',
        budgetRange: this.inferBudgetRange(params['minRent'], params['maxRent']),
        sortBy: this.inferSortBy(params['sortBy'], params['sortOrder']),
      };

      this.filters = this.mapStateToFilters(this.filterState as FilterState);
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.loadApartments();
    });

    if (this.authService.isAuthenticated()) {
      this.favService.loadFavourites().subscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters']) {
      this.filters = { ...this.initialFilters };
      this.currentPage = 1;
      this.loadApartments();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterStateChanged(state: FilterState): void {
    this.filterState = state;
    this.filters = this.mapStateToFilters(state);
    this.currentPage = 1;

    // Update query params in URL
    const queryParams: any = {
      page: 1,
      city: state.city ? state.city.trim() : null,
      search: state.search ? state.search.trim() : null,
      bedrooms: state.bedrooms ? state.bedrooms : null,
      furnished: state.furnished ? state.furnished : null,
      availability: state.availability ? state.availability : null,
    };

    if (state.budgetRange === 'under-15k') { queryParams.maxRent = 15000; queryParams.minRent = null; }
    else if (state.budgetRange === '15k-30k') { queryParams.minRent = 15000; queryParams.maxRent = 30000; }
    else if (state.budgetRange === '30k-50k') { queryParams.minRent = 30000; queryParams.maxRent = 50000; }
    else if (state.budgetRange === 'above-50k') { queryParams.minRent = 50000; queryParams.maxRent = null; }
    else { queryParams.minRent = null; queryParams.maxRent = null; }

    if (state.sortBy === 'price-asc') { queryParams.sortBy = 'monthlyRent'; queryParams.sortOrder = 'asc'; }
    else if (state.sortBy === 'price-desc') { queryParams.sortBy = 'monthlyRent'; queryParams.sortOrder = 'desc'; }
    else { queryParams.sortBy = 'createdAt'; queryParams.sortOrder = 'desc'; }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  onResetFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  private mapStateToFilters(state: FilterState): ApartmentFilters {
    const f: ApartmentFilters = {};

    if (state.city && state.city.trim()) f.city = state.city.trim();
    if (state.search && state.search.trim()) f.search = state.search.trim();
    if (state.bedrooms) f.bedrooms = Number(state.bedrooms);
    if (state.furnished) f.furnished = state.furnished as any;
    if (state.availability) f.availability = state.availability as any;

    if (state.budgetRange === 'under-15k') { f.maxRent = 15000; }
    else if (state.budgetRange === '15k-30k') { f.minRent = 15000; f.maxRent = 30000; }
    else if (state.budgetRange === '30k-50k') { f.minRent = 30000; f.maxRent = 50000; }
    else if (state.budgetRange === 'above-50k') { f.minRent = 50000; }

    if (state.sortBy === 'price-asc') { f.sortBy = 'monthlyRent'; f.sortOrder = 'asc'; }
    else if (state.sortBy === 'price-desc') { f.sortBy = 'monthlyRent'; f.sortOrder = 'desc'; }
    else { f.sortBy = 'createdAt'; f.sortOrder = 'desc'; }

    return f;
  }

  private inferBudgetRange(minRent?: any, maxRent?: any): string {
    const min = minRent !== undefined && minRent !== null ? Number(minRent) : null;
    const max = maxRent !== undefined && maxRent !== null ? Number(maxRent) : null;

    if (max === 15000 && !min) return 'under-15k';
    if (min === 15000 && max === 30000) return '15k-30k';
    if (min === 30000 && max === 50000) return '30k-50k';
    if (min === 50000 && !max) return 'above-50k';
    return '';
  }

  private inferSortBy(sortBy?: string, sortOrder?: string): string {
    if (sortBy === 'monthlyRent' && sortOrder === 'asc') return 'price-asc';
    if (sortBy === 'monthlyRent' && sortOrder === 'desc') return 'price-desc';
    return 'newest';
  }

  private loadApartments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.apartmentService
      .getApartments(this.filters, this.currentPage, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.apartments = response.apartments;
          this.totalItems = response.total;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toast.error('Failed to load apartments. Please try again.');
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error('Error loading apartments:', err);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadApartments();
  }

  onViewDetails(apartmentId: string): void {
    this.router.navigate(['/apartments', apartmentId]);
  }

  onReload(): void {
    this.loadApartments();
  }
}
