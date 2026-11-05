import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApartmentService } from '../core/apartment.service';
import { InquiryService } from '../core/inquiry.service';
import { Apartment } from '../models/apartment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../shared/toast.service';
import { AuthService } from '../core/auth.service';
import { FavouriteService } from '../core/favourite.service';
import { CommentSectionComponent } from '../comments/comment-section.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-apartment-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentSectionComponent],
  template: `
    <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">

        <!-- Top Navigation & Badges -->
        <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <button type="button" class="btn-back" (click)="goBack()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Back to Listings</span>
          </button>

          <div class="flex items-center gap-2" *ngIf="apartment">
            <span class="badge"
                  [class.badge-available]="apartment.availability === 'AVAILABLE'"
                  [class.badge-rented]="apartment.availability === 'RENTED'">
              {{ apartment.availability === 'AVAILABLE' ? '● Available' : '● Rented' }}
            </span>
            <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200">
              {{ formatFurnished(apartment.furnished) }}
            </span>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div *ngIf="isLoading" class="space-y-6">
          <div class="w-full aspect-[21/9] max-h-[460px] rounded-2xl shimmer"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-4">
              <div class="h-10 w-2/3 rounded-xl shimmer"></div>
              <div class="h-6 w-1/3 rounded-lg shimmer"></div>
              <div class="grid grid-cols-4 gap-4 mt-6">
                <div class="h-24 rounded-xl shimmer" *ngFor="let n of [1,2,3,4]"></div>
              </div>
            </div>
            <div class="h-64 rounded-2xl shimmer"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage && !isLoading" class="card p-12 text-center bg-white rounded-2xl border border-slate-200">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" class="mx-auto mb-3">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="text-slate-700 font-medium mb-4">{{ errorMessage }}</p>
          <button class="btn-primary px-5 py-2.5 rounded-xl text-sm" (click)="reloadDetails()">
            Try Again
          </button>
        </div>

        <!-- Apartment Details Loaded -->
        <div *ngIf="apartment && !isLoading && !errorMessage">

          <!-- Interactive Photo Gallery -->
          <div class="gallery-card mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <!-- Featured Large Image View -->
            <div class="gallery-main-view">
              <img
                *ngIf="currentImageUrl"
                [src]="currentImageUrl"
                [alt]="apartment.title"
                class="w-full h-full object-cover transition-opacity duration-300"
              />

              <!-- No Photo Fallback -->
              <div *ngIf="!currentImageUrl" class="flex flex-col items-center justify-center text-slate-400 py-20">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span class="mt-2 text-sm font-medium">No property photos available</span>
              </div>

              <!-- Gallery Arrows & Counter -->
              <ng-container *ngIf="apartment.images && apartment.images.length > 1">
                <button type="button" (click)="prevImage()" class="gallery-arrow gallery-arrow-left" aria-label="Previous image">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" (click)="nextImage()" class="gallery-arrow gallery-arrow-right" aria-label="Next image">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                <div class="gallery-counter-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  </svg>
                  <span>{{ activeImageIndex + 1 }} / {{ apartment.images.length }}</span>
                </div>
              </ng-container>
            </div>

            <!-- Thumbnail Strip -->
            <div *ngIf="apartment.images && apartment.images.length > 1" class="gallery-thumb-strip">
              <button
                type="button"
                *ngFor="let img of apartment.images; let i = index"
                (click)="selectImage(i)"
                class="gallery-thumb-btn"
                [class.active]="i === activeImageIndex"
              >
                <img [src]="img.url" [alt]="apartment.title" class="w-full h-full object-cover rounded-lg" />
              </button>
            </div>
          </div>

          <!-- Main Details & Sidebar Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            <!-- Left 2 Columns -->
            <div class="lg:col-span-2 space-y-6">

              <!-- Title & Location Card -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {{ apartment.title }}
                </h1>
                <p class="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" class="shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ fullAddress }}</span>
                </p>
              </div>

              <!-- Quick Highlights (4 Stats Grid) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="stat-pill">
                  <div class="stat-pill-icon bg-indigo-50 text-indigo-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div class="stat-pill-val">{{ apartment.bedrooms }} Bedrooms</div>
                  <div class="stat-pill-sub">{{ apartment.bedrooms }} BHK Living</div>
                </div>

                <div class="stat-pill">
                  <div class="stat-pill-icon bg-cyan-50 text-cyan-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M5 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/>
                      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
                    </svg>
                  </div>
                  <div class="stat-pill-val">{{ apartment.bathrooms }} Bathrooms</div>
                  <div class="stat-pill-sub">Modern setup</div>
                </div>

                <div class="stat-pill">
                  <div class="stat-pill-icon bg-emerald-50 text-emerald-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div class="stat-pill-val">{{ apartment.area || '—' }} sq ft</div>
                  <div class="stat-pill-sub">Carpet Area</div>
                </div>

                <div class="stat-pill">
                  <div class="stat-pill-icon bg-amber-50 text-amber-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <div class="stat-pill-val">{{ formatFurnished(apartment.furnished) }}</div>
                  <div class="stat-pill-sub">Furnished state</div>
                </div>
              </div>

              <!-- About Description Section -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 class="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span>About this Apartment</span>
                </h2>
                <p class="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base" *ngIf="apartment.description && apartment.description.trim()">
                  {{ apartment.description }}
                </p>
                <p class="text-slate-400 italic text-sm" *ngIf="!apartment.description || !apartment.description.trim()">
                  No additional description has been provided by the landlord for this listing.
                </p>
              </div>

              <!-- Specifications Breakdown Table -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 class="text-xl font-bold text-slate-900 mb-4">Apartment Specifications</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div class="spec-row">
                    <span class="spec-label">Monthly Rent</span>
                    <span class="spec-val font-bold text-indigo-600">{{ formatRent(apartment.monthlyRent) }} / month</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Security Deposit</span>
                    <span class="spec-val font-semibold text-slate-700">{{ formatRent(apartment.securityDeposit) }} (Refundable)</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Furnishing Status</span>
                    <span class="spec-val font-medium text-slate-800">{{ formatFurnished(apartment.furnished) }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Dietary / Food Rule</span>
                    <span class="spec-val font-medium text-slate-800">{{ formatVeg(apartment.vegetarian) }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Street Address</span>
                    <span class="spec-val text-slate-700">{{ apartment.address || '—' }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">City, State</span>
                    <span class="spec-val text-slate-700">{{ apartment.city }}, {{ apartment.state }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Postal / PIN Code</span>
                    <span class="spec-val text-slate-700">{{ apartment.pincode || '—' }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Availability Status</span>
                    <span class="spec-val font-semibold" [class.text-emerald-600]="apartment.availability === 'AVAILABLE'" [class.text-rose-600]="apartment.availability !== 'AVAILABLE'">
                      {{ apartment.availability === 'AVAILABLE' ? 'Available Immediately' : 'Rented' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Questions & Discussions (Comment and Reply System) -->
              <app-comment-section
                [apartmentId]="apartment.id"
                [landlordUserId]="apartment.landlord?.userId"
              ></app-comment-section>

            </div>

            <!-- Right Column (Sticky Pricing & Landlord Card) -->
            <div class="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

              <!-- Price & Action Box -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div class="mb-5 pb-5 border-b border-slate-100">
                  <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Monthly Rent</div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl sm:text-4xl font-extrabold text-slate-900">{{ formatRent(apartment.monthlyRent) }}</span>
                    <span class="text-slate-500 text-sm font-medium">/ month</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>Deposit: <strong class="text-slate-800">{{ formatRent(apartment.securityDeposit) }}</strong> (Refundable)</span>
                  </div>
                </div>

                <!-- Book Apartment / Schedule Visit Button (Primary Tenant CTA) -->
                <button
                  *ngIf="!isLandlord"
                  type="button"
                  (click)="openBookingModal()"
                  class="btn-book-apartment w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all mb-3"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ bookingStatus === 'accepted' ? '✓ Booking Request Accepted!' : (hasBooked ? '✓ Booking Request Sent (Update)' : 'Book Apartment / Schedule Visit') }}</span>
                </button>

                <!-- Add to Favourites Button -->
                <button
                  type="button"
                  (click)="onToggleFav()"
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all shadow-sm"
                  [class.bg-rose-50]="isFav"
                  [class.text-rose-600]="isFav"
                  [class.border-rose-200]="isFav"
                  [class.bg-white]="!isFav"
                  [class.text-slate-700]="!isFav"
                  [class.border-slate-300]="!isFav"
                  [class.hover:border-rose-300]="!isFav"
                  [class.hover:text-rose-600]="!isFav"
                >
                  <svg *ngIf="!isFav" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <svg *ngIf="isFav" width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#dc2626" stroke-width="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.14 1.14L12 21.23l7.79-7.79a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{{ isFav ? 'Favourited' : 'Save to Favourites' }}</span>
                </button>

                <!-- Landlord Management Controls -->
                <div *ngIf="isLandlord" class="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                  <button type="button" (click)="onEdit()" class="btn-edit flex-1 text-center py-2 text-sm rounded-xl font-medium">Edit</button>
                  <button type="button" (click)="onDelete()" class="btn-delete px-4 py-2 text-sm rounded-xl font-medium">Delete</button>
                </div>
              </div>

              <!-- Landlord Contact Card -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" *ngIf="apartment.landlord">
                <h3 class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-4">Property Host</h3>
                
                <div class="flex items-center gap-3.5 mb-4">
                  <div class="w-13 h-13 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-200 shrink-0" style="width:48px;height:48px;">
                    {{ landlordInitial }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 text-base flex items-center gap-1.5 truncate">
                      <span class="truncate">{{ landlordName }}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#06b6d4" class="text-white shrink-0" title="Verified Landlord">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div class="text-xs text-slate-500 truncate" *ngIf="apartment.landlord.companyName">
                      {{ apartment.landlord.companyName }}
                    </div>
                    <div class="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span>✓ Verified Landlord</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 pt-4 border-t border-slate-100 text-sm">
                  <div class="flex items-center gap-2.5 text-slate-600" *ngIf="landlordPhone">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <a [href]="'tel:' + landlordPhone" class="hover:underline font-medium text-slate-800">{{ landlordPhone }}</a>
                  </div>

                  <div class="flex items-center gap-2.5 text-slate-600" *ngIf="landlordEmail">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <a [href]="'mailto:' + landlordEmail" class="hover:underline text-xs text-slate-700 truncate font-medium">{{ landlordEmail }}</a>
                  </div>
                </div>

                <div class="mt-5 pt-3 border-t border-slate-100" *ngIf="landlordPhone">
                  <a
                    [href]="'tel:' + landlordPhone"
                    class="btn-primary w-full text-center py-2.5 rounded-xl block text-sm font-semibold shadow-sm transition-all hover:shadow"
                  >
                    Contact Landlord
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
      <!-- Booking & Inquiry Modal Dialog -->
      <div
        *ngIf="isBookingModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        (click)="closeBookingModal()"
      >
        <div
          class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-base leading-tight">Book Apartment & Inquire</h3>
                <p class="text-xs text-slate-300">Direct booking request to {{ landlordName }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeBookingModal()"
              class="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 text-sm">
            
            <!-- Property Summary Pill -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <img
                *ngIf="currentImageUrl"
                [src]="currentImageUrl"
                alt="Thumbnail"
                class="w-16 h-14 object-cover rounded-lg shrink-0 border border-slate-200"
              />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-900 text-sm truncate">{{ apartment.title }}</div>
                <div class="text-xs text-slate-500 truncate mt-0.5">{{ fullAddress }}</div>
                <div class="text-xs font-semibold text-indigo-600 mt-1">
                  {{ formatRent(apartment.monthlyRent) }} / month
                  <span class="text-slate-400 font-normal"> • Deposit: {{ formatRent(apartment.securityDeposit) }}</span>
                </div>
              </div>
            </div>

            <!-- Preferred Move-in Date / Visit Date -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Preferred Move-in / Visit Date
              </label>
              <input
                type="date"
                [(ngModel)]="bookingDate"
                [min]="minDate"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Message Field -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Message to Host <span class="text-rose-500">*</span>
                </label>
                <span class="text-[11px] text-slate-400">{{ bookingMessage.length }} / 1000</span>
              </div>
              <textarea
                rows="4"
                [(ngModel)]="bookingMessage"
                placeholder="Introduce yourself, mention your move-in date, occupancy details, or questions..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              ></textarea>
            </div>

            <!-- Landlord Notice -->
            <div class="flex items-start gap-2 text-xs text-slate-500 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" class="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>The host will receive your contact details to respond and confirm your booking or property viewing.</span>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeBookingModal()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="submitBooking()"
              [disabled]="isBookingSubmitting"
              class="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm flex items-center gap-2"
            >
              <svg *ngIf="isBookingSubmitting" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span>{{ isBookingSubmitting ? 'Sending Request...' : 'Send Booking Request' }}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .gallery-main-view {
      position: relative;
      width: 100%;
      height: 480px;
      max-height: 520px;
      background-color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    @media (max-width: 640px) {
      .gallery-main-view { height: 300px; }
    }
    .gallery-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(0,0,0,0.08);
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: all 0.15s ease;
      z-index: 10;
    }
    .gallery-arrow:hover {
      background: #ffffff;
      transform: translateY(-50%) scale(1.1);
      color: #4f46e5;
    }
    .gallery-arrow-left { left: 1rem; }
    .gallery-arrow-right { right: 1rem; }

    .gallery-counter-pill {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
      color: #ffffff;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      letter-spacing: 0.02em;
    }

    .gallery-thumb-strip {
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow-x: auto;
    }
    .gallery-thumb-btn {
      width: 80px;
      height: 56px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      background: none;
    }
    .gallery-thumb-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .gallery-thumb-btn.active {
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
    }

    .stat-pill {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .stat-pill-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    .stat-pill-val {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }
    .stat-pill-sub {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .spec-row {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px dashed #f1f5f9;
    }
    .spec-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }
    .spec-val {
      font-size: 0.95rem;
    }

    .btn-book-apartment {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      border: none;
      cursor: pointer;
    }
    .btn-book-apartment:hover {
      background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
      transform: translateY(-1px);
    }
  `],
})
export class ApartmentDetailsComponent implements OnInit, OnDestroy {
  apartment: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  isLandlord = false;
  isFav = false;
  activeImageIndex = 0;

  // Booking Modal State
  isBookingModalOpen = false;
  isBookingSubmitting = false;
  hasBooked = false;
  bookingStatus: string | null = null;
  bookingDate = '';
  bookingMessage = 'Hi, I am interested in renting this apartment. I would like to schedule a visit and discuss the lease terms.';
  minDate = new Date().toISOString().split('T')[0];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apartmentService: ApartmentService,
    private authService: AuthService,
    private favService: FavouriteService,
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  get currentImageUrl(): string | null {
    if (this.apartment?.images && this.apartment.images.length > 0) {
      const img = this.apartment.images[this.activeImageIndex];
      return img?.url || this.apartment.images[0].url;
    }
    return null;
  }

  get fullAddress(): string {
    if (!this.apartment) return '';
    const parts = [
      this.apartment.address,
      this.apartment.city,
      this.apartment.state,
      this.apartment.pincode
    ].filter(Boolean);
    return parts.join(', ');
  }

  get landlordName(): string {
    return this.apartment?.landlord?.user?.fullName || 'Verified Landlord';
  }

  get landlordInitial(): string {
    return this.landlordName.charAt(0).toUpperCase() || 'L';
  }

  get landlordEmail(): string | null {
    return this.apartment?.landlord?.user?.email || null;
  }

  get landlordPhone(): string | null {
    return this.apartment?.landlord?.user?.phone || null;
  }

  ngOnInit(): void {
    this.isLandlord = this.authService.hasRole('LANDLORD');

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      if (this.authService.isAuthenticated()) {
        this.favService.favouriteIds$
          .pipe(takeUntil(this.destroy$))
          .subscribe(ids => {
            this.isFav = ids.has(id);
            this.cdr.detectChanges();
          });
        this.favService.loadFavourites().subscribe();

        if (!this.isLandlord) {
          this.inquiryService.getInquiries().pipe(takeUntil(this.destroy$)).subscribe(inquiries => {
            const found = inquiries.find(inq => inq.apartmentId === id || inq.apartment?.id === id);
            if (found) {
              this.hasBooked = true;
              this.bookingStatus = found.status;
              this.bookingMessage = found.message;
              this.cdr.detectChanges();
            }
          });
        }
      }

      this.apartmentService.getApartmentById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (apartment: any) => {
            this.apartment = apartment;
            this.activeImageIndex = 0;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.errorMessage = 'Failed to load apartment details.';
            this.isLoading = false;
            this.cdr.detectChanges();
            console.error('Error loading apartment:', err);
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectImage(index: number): void {
    this.activeImageIndex = index;
    this.cdr.detectChanges();
  }

  prevImage(): void {
    if (this.apartment?.images?.length) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.apartment.images.length) % this.apartment.images.length;
      this.cdr.detectChanges();
    }
  }

  nextImage(): void {
    if (this.apartment?.images?.length) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.apartment.images.length;
      this.cdr.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/apartments']);
  }

  reloadDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.errorMessage = null;
      this.apartmentService.getApartmentById(id).subscribe({
        next: (apt: any) => {
          this.apartment = apt;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not load property details.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  openBookingModal(): void {
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Please log in as a tenant to book or send an inquiry.');
      this.router.navigate(['/login']);
      return;
    }
    if (this.isLandlord) {
      this.toast.warning('Landlord accounts cannot book apartments. Please log in as a tenant.');
      return;
    }
    this.isBookingModalOpen = true;
    this.cdr.detectChanges();
  }

  closeBookingModal(): void {
    this.isBookingModalOpen = false;
    this.cdr.detectChanges();
  }

  submitBooking(): void {
    const msg = this.bookingMessage.trim();
    if (msg.length < 5) {
      this.toast.error('Please enter at least 5 characters for your message.');
      return;
    }

    let finalMessage = msg;
    if (this.bookingDate) {
      finalMessage = `[Preferred Move-in / Visit Date: ${this.bookingDate}]\n${msg}`;
    }

    this.isBookingSubmitting = true;
    this.cdr.detectChanges();

    this.inquiryService.sendInquiry(this.apartment.id, finalMessage).subscribe({
      next: () => {
        this.isBookingSubmitting = false;
        this.isBookingModalOpen = false;
        this.hasBooked = true;
        this.toast.success('Booking request sent successfully! The landlord will contact you soon.');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isBookingSubmitting = false;
        const errorMsg = err?.error?.message || err?.message || 'Failed to send booking request. Please try again.';
        this.toast.error(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  onToggleFav(): void {
    if (!this.apartment?.id) return;
    if (!this.authService.isAuthenticated()) {
      this.toast.warning('Please log in to save favourite apartments.');
      this.router.navigate(['/login']);
      return;
    }

    this.favService.toggleFavourite(this.apartment.id).subscribe({
      next: (isFav) => {
        this.isFav = isFav;
        this.toast.success(isFav ? 'Added to favourites!' : 'Removed from favourites');
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 401) {
          this.toast.warning('Session expired. Please log in again.');
          this.router.navigate(['/login']);
        } else {
          this.toast.error('Could not update favourite. Please try again.');
        }
      }
    });
  }

  onEdit(): void {
    if (this.apartment?.id) {
      this.router.navigate(['/edit', this.apartment.id]);
    }
  }

  onDelete(): void {
    if (!this.apartment?.id) return;
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    this.apartmentService.deleteApartment(this.apartment.id).subscribe({
      next: () => {
        this.toast.success('Listing deleted successfully.');
        this.router.navigate(['/apartments']);
      },
      error: () => {
        this.toast.error('Failed to delete apartment. Please try again.');
      },
    });
  }

  formatRent(amount: any): string {
    if (!amount) return '₹0';
    const num = Number(amount);
    return isNaN(num) ? `₹${amount}` : `₹${num.toLocaleString('en-IN')}`;
  }

  formatFurnished(state: string): string {
    if (!state) return 'Unfurnished';
    if (state === 'FURNISHED') return 'Fully Furnished';
    if (state === 'SEMI_FURNISHED') return 'Semi-Furnished';
    if (state === 'UNFURNISHED') return 'Unfurnished';
    return state;
  }

  formatVeg(rule: string): string {
    if (rule === 'ALLOWED' || rule === 'VEG_ONLY') return 'Vegetarian Preferred';
    if (rule === 'NOT_ALLOWED') return 'Non-Veg Allowed';
    return rule || 'No Restrictions';
  }
}
