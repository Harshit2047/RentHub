import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FavouriteService } from '../core/favourite.service';
import { InquiryService, Inquiry } from '../core/inquiry.service';
import { ApartmentCardComponent } from '../apartments/apartment-card.component';
import { ToastService } from '../shared/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ApartmentCardComponent],
  template: `
    <div class="dash-page">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">My Dashboard</h1>
          <p class="dash-subtitle">Welcome back, {{ userName }}</p>
        </div>
        <a routerLink="/apartments" class="btn-primary" style="font-size:0.875rem;padding:0.5rem 1.1rem;border-radius:8px;">
          Browse Apartments
        </a>
      </div>

      <!-- Stats row -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-bottom:2rem;">

        <div class="stat-card">
          <div class="stat-card-icon stat-card-icon-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ favourites.length }}</div>
            <div class="stat-label">Favourites</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon stat-card-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ inquiries.length }}</div>
            <div class="stat-label">Inquiries & Bookings</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon stat-card-icon-warning">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ favourites.length }}</div>
            <div class="stat-label">Shortlisted Units</div>
          </div>
        </div>

      </div>

      <!-- Inquiries and Bookings Section -->
      <div class="dash-section" style="margin-bottom:2.5rem;">
        <div class="dash-section-header">
          <div>
            <h2 class="dash-section-title">My Bookings & Inquiries</h2>
            <p style="font-size:0.8rem;color:#64748b;margin-top:2px;">Direct booking requests and visits sent to property landlords</p>
          </div>
        </div>

        <!-- Inquiries List -->
        <div *ngIf="inquiries.length > 0" style="display:flex;flex-direction:column;gap:0.75rem;">
          <div
            *ngFor="let inq of inquiries"
            class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ inq.apartment?.title || 'Apartment Booking' }}</h3>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1"
                    [class.bg-emerald-50]="inq.status?.toLowerCase() === 'accepted'"
                    [class.text-emerald-700]="inq.status?.toLowerCase() === 'accepted'"
                    [class.border-emerald-300]="inq.status?.toLowerCase() === 'accepted'"
                    [class.bg-amber-50]="inq.status?.toLowerCase() === 'pending'"
                    [class.text-amber-700]="inq.status?.toLowerCase() === 'pending'"
                    [class.border-amber-300]="inq.status?.toLowerCase() === 'pending'"
                    [class.bg-rose-50]="inq.status?.toLowerCase() === 'rejected'"
                    [class.text-rose-700]="inq.status?.toLowerCase() === 'rejected'"
                    [class.border-rose-300]="inq.status?.toLowerCase() === 'rejected'"
                  >
                    <svg *ngIf="inq.status?.toLowerCase() === 'accepted'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{{ inq.status?.toLowerCase() === 'accepted' ? 'Accepted' : (inq.status?.toLowerCase() === 'rejected' ? 'Declined' : 'Pending') }}</span>
                  </span>
                </div>
                <p class="text-xs text-slate-500 truncate mt-0.5">
                  {{ inq.apartment?.city }} • Landlord: <strong>{{ inq.landlord?.user?.fullName || 'Verified Landlord' }}</strong>
                </p>
                <p class="text-xs text-slate-600 line-clamp-1 mt-1 font-normal italic">"{{ inq.message }}"</p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
              <a
                [routerLink]="['/apartments', inq.apartmentId]"
                class="btn-view-unit px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                style="background-color: #4f46e5 !important; color: #ffffff !important; text-decoration: none;"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span style="color: #ffffff !important;">View Apartment</span>
              </a>
              <a
                *ngIf="inq.landlord?.user?.phone"
                [href]="'tel:' + inq.landlord?.user?.phone"
                class="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
              >
                Call Landlord
              </a>
            </div>
          </div>
        </div>

        <!-- Empty Inquiries -->
        <div *ngIf="inquiries.length === 0" class="apt-empty-state" style="padding:2.5rem 1rem;background-color:#ffffff;border-radius:1rem;border:1px solid #e2e8f0;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h3 style="margin-top:0.5rem;font-size:0.95rem;font-weight:700;">No booking requests sent yet</h3>
          <p style="font-size:0.8rem;color:#64748b;margin-top:0.25rem;">Browse apartments and click "Book Apartment / Schedule Visit" to send your direct booking request.</p>
        </div>
      </div>

      <!-- Saved apartments section -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h2 class="dash-section-title">Saved Apartments</h2>
          <a routerLink="/favourites" class="dash-section-link">View all →</a>
        </div>

        <!-- Skeleton -->
        <div *ngIf="isLoading" class="apartment-grid">
          <div *ngFor="let n of skeletons" class="skeleton-card">
            <div class="skeleton-img shimmer"></div>
            <div class="skeleton-body">
              <div class="skeleton-line shimmer" style="width:65%;height:15px;border-radius:5px"></div>
              <div class="skeleton-line shimmer" style="width:40%;height:11px;border-radius:5px;margin-top:8px"></div>
              <div class="skeleton-line shimmer" style="width:28%;height:19px;border-radius:5px;margin-top:12px"></div>
            </div>
            <div class="skeleton-footer shimmer"></div>
          </div>
        </div>

        <!-- Cards -->
        <div *ngIf="!isLoading && favourites.length > 0" class="apartment-grid">
          <app-apartment-card
            *ngFor="let apt of favourites; trackBy: trackByAptId"
            [apartment]="apt"
            (viewDetails)="onView(apt.id)"
            (toggleFavorite)="onRemoveFav($event || apt.id)"
          ></app-apartment-card>
        </div>

        <!-- Empty -->
        <div *ngIf="!isLoading && favourites.length === 0" class="apt-empty-state" style="padding:3rem 1rem;">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h3>No saved apartments yet</h3>
          <p>Favourite apartments to see them here</p>
          <a routerLink="/apartments" class="btn-primary" style="display:inline-flex;margin-top:1rem;padding:0.5rem 1.25rem;border-radius:8px;font-size:0.875rem;">
            Browse Apartments
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [],
})
export class TenantDashboardComponent implements OnInit, OnDestroy {
  favourites: any[] = [];
  inquiries: Inquiry[] = [];
  isLoading = true;
  userName = '';
  readonly skeletons = Array(3).fill(0);
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private favService: FavouriteService,
    private inquiryService: InquiryService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.authState$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.userName = user?.fullName?.split(' ')[0] || 'there';
    });

    this.favService.loadFavourites()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apts) => {
          this.favourites = apts.slice(0, 6);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });

    this.favService.favouriteIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ids) => {
        if (!this.isLoading && this.favourites.length > 0) {
          const filtered = this.favourites.filter((a) => ids.has(a.id));
          if (filtered.length !== this.favourites.length) {
            this.favourites = filtered;
            this.cdr.detectChanges();
          }
        }
      });

    this.inquiryService.getInquiries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inquiries) => {
          this.inquiries = inquiries;
          this.cdr.detectChanges();
        },
        error: () => {
          // Ignore
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByAptId(index: number, apt: any): string {
    return apt?.id || index.toString();
  }

  onRemoveFav(id: string): void {
    if (!id) return;
    this.favourites = this.favourites.filter((a) => a.id !== id);
    this.cdr.detectChanges();
  }

  onView(id: string): void { this.router.navigate(['/apartments', id]); }
}
