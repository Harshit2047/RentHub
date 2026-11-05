import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApartmentService } from '../core/apartment.service';
import { InquiryService, Inquiry } from '../core/inquiry.service';
import { ApartmentCardComponent } from '../apartments/apartment-card.component';
import { ToastService } from '../shared/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ApartmentCardComponent],
  template: `
    <div class="dash-page">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Landlord Dashboard</h1>
          <p class="dash-subtitle">Manage your listings and track tenant inquiries</p>
        </div>
        <a routerLink="/create" class="btn-primary" style="font-size:0.875rem;padding:0.5rem 1.1rem;border-radius:8px;white-space:nowrap;">
          + New Listing
        </a>
      </div>

      <!-- Received Tenant Inquiries Section -->
      <div class="dash-section" style="margin-bottom:2.5rem;" *ngIf="inquiries.length > 0">
        <div class="dash-section-header">
          <div>
            <h2 class="dash-section-title">Tenant Inquiries & Booking Requests</h2>
            <p style="font-size:0.8rem;color:#64748b;margin-top:2px;">Prospective tenants interested in your properties</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {{ inquiries.length }} total
          </span>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div
            *ngFor="let inq of inquiries"
            class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            [class.border-emerald-200]="inq.status?.toLowerCase() === 'accepted'"
            [class.bg-emerald-50/20]="inq.status?.toLowerCase() === 'accepted'"
          >
            <div class="flex items-start gap-3.5 min-w-0">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border"
                [class.bg-emerald-100]="inq.status?.toLowerCase() === 'accepted'"
                [class.text-emerald-800]="inq.status?.toLowerCase() === 'accepted'"
                [class.border-emerald-200]="inq.status?.toLowerCase() === 'accepted'"
                [class.bg-indigo-100]="inq.status?.toLowerCase() !== 'accepted'"
                [class.text-indigo-700]="inq.status?.toLowerCase() !== 'accepted'"
                [class.border-indigo-200]="inq.status?.toLowerCase() !== 'accepted'"
              >
                {{ (inq.tenant?.fullName || 'T').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ inq.tenant?.fullName || 'Prospective Tenant' }}</h3>
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
                    <span>{{ inq.status || 'pending' }}</span>
                  </span>
                </div>
                <p class="text-xs text-slate-500 truncate mt-0.5">
                  Property: <strong class="text-slate-800">{{ inq.apartment?.title }}</strong> ({{ inq.apartment?.city }})
                </p>
                <p class="text-xs text-slate-700 mt-1.5 font-normal whitespace-pre-line bg-slate-50 rounded-lg p-2 border border-slate-100">
                  "{{ inq.message }}"
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-center">
              <!-- Accept & Decline Action Buttons -->
              <button
                *ngIf="inq.status?.toLowerCase() !== 'accepted'"
                type="button"
                (click)="onAcceptInquiry(inq)"
                [disabled]="updatingInquiryId === inq.id"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{{ updatingInquiryId === inq.id ? 'Accepting...' : 'Accept Request' }}</span>
              </button>

              <button
                *ngIf="inq.status?.toLowerCase() === 'pending'"
                type="button"
                (click)="onDeclineInquiry(inq)"
                [disabled]="updatingInquiryId === inq.id"
                class="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>Decline</span>
              </button>

              <span
                *ngIf="inq.status?.toLowerCase() === 'accepted'"
                class="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Accepted</span>
              </span>

              <!-- Contact shortcuts -->
              <a
                *ngIf="inq.tenant?.phone"
                [href]="'tel:' + inq.tenant?.phone"
                class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                style="color: #334155 !important; text-decoration: none;"
                title="Call tenant"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span style="color: #334155 !important;">Call Tenant</span>
              </a>

              <a
                *ngIf="inq.tenant?.email"
                [href]="'mailto:' + inq.tenant?.email"
                class="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5"
                style="color: #334155 !important; text-decoration: none;"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span style="color: #334155 !important;">Email</span>
              </a>

              <a
                [routerLink]="['/apartments', inq.apartmentId]"
                class="btn-view-unit px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                style="background-color: #4f46e5 !important; color: #ffffff !important; text-decoration: none;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span style="color: #ffffff !important; font-weight: 700;">View Unit</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- My listings section -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h2 class="dash-section-title">My Listings</h2>
          <a routerLink="/create" class="dash-section-link">+ Add new</a>
        </div>

        <!-- Skeleton -->
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

        <!-- Cards -->
        <div *ngIf="!isLoading && myApartments.length > 0" class="apartment-grid">
          <app-apartment-card
            *ngFor="let apt of myApartments"
            [apartment]="apt"
            [isLandlord]="true"
            (viewDetails)="onView(apt.id)"
          ></app-apartment-card>
        </div>

        <!-- Empty -->
        <div *ngIf="!isLoading && myApartments.length === 0" class="apt-empty-state" style="padding:3.5rem 1rem;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h3>No listings yet</h3>
          <p>Create your first apartment listing to get started</p>
          <a routerLink="/create" class="btn-primary" style="display:inline-flex;margin-top:1rem;padding:0.55rem 1.4rem;border-radius:8px;font-size:0.875rem;">
            + Create Listing
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [],
})
export class LandlordDashboardComponent implements OnInit, OnDestroy {
  myApartments: any[] = [];
  inquiries: Inquiry[] = [];
  isLoading = true;
  readonly skeletons = Array(3).fill(0);
  private destroy$ = new Subject<void>();

  get activeListings(): number { return this.myApartments.filter(a => a.status === 'AVAILABLE').length; }
  get rentedListings(): number  { return this.myApartments.filter(a => a.status === 'RENTED').length; }

  constructor(
    private authService: AuthService,
    private apartmentService: ApartmentService,
    private inquiryService: InquiryService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.apartmentService.getMyListings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apts) => {
          this.myApartments = apts;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Failed to load listings.');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
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

  updatingInquiryId: string | null = null;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAcceptInquiry(inq: Inquiry): void {
    if (!inq.id || this.updatingInquiryId === inq.id) return;
    this.updatingInquiryId = inq.id;
    this.cdr.detectChanges();

    this.inquiryService.updateStatus(inq.id, 'accepted').subscribe({
      next: () => {
        inq.status = 'accepted';
        this.updatingInquiryId = null;
        this.toast.success(`Booking request for "${inq.apartment?.title || 'apartment'}" accepted! Tenant will be notified.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.updatingInquiryId = null;
        const msg = err?.error?.message || err?.message || 'Failed to accept inquiry.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  onDeclineInquiry(inq: Inquiry): void {
    if (!inq.id || this.updatingInquiryId === inq.id) return;
    this.updatingInquiryId = inq.id;
    this.cdr.detectChanges();

    this.inquiryService.updateStatus(inq.id, 'rejected').subscribe({
      next: () => {
        inq.status = 'rejected';
        this.updatingInquiryId = null;
        this.toast.info(`Booking request from ${inq.tenant?.fullName || 'tenant'} declined.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.updatingInquiryId = null;
        const msg = err?.error?.message || err?.message || 'Failed to decline inquiry.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  onView(id: string): void { this.router.navigate(['/apartments', id]); }
}
