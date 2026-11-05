import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApartmentService, Apartment } from '../core/apartment.service';
import { ApartmentCardComponent } from '../apartments/apartment-card.component';
import { AuthService } from '../core/auth.service';
import { FavouriteService } from '../core/favourite.service';
import { User } from '../models/auth.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ApartmentCardComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">

      <!-- ========================================================= -->
      <!-- 1. HERO SECTION WITH SEARCH BAR -->
      <!-- ========================================================= -->
      <section class="hero-container relative text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        <!-- Decorative Glow Orbs -->
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-6xl mx-auto relative z-10 text-center">

          <!-- Trust Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-md mb-6 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Over 1,200+ Verified Homes & Direct Landlord Contacts</span>
          </div>

          <!-- Main Hero Headline -->
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-4">
            Find Your Ideal Rental Home <br class="hidden sm:inline" />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-white">
              Without Brokerage Hassles
            </span>
          </h1>

          <!-- Hero Subtitle -->
          <p class="max-w-2xl mx-auto text-slate-300 text-sm sm:text-lg mb-10 leading-relaxed font-normal">
            Explore premium apartments, verified flats, and studios across top Indian cities.
            Connect directly with verified property hosts and move in seamlessly.
          </p>

          <!-- Interactive Search Card -->
          <div class="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 text-left">
            <form (ngSubmit)="onSearch()" class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              
              <!-- Location / City Input -->
              <div class="sm:col-span-5">
                <label for="searchCity" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  City or Location
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <input
                    id="searchCity"
                    type="text"
                    [(ngModel)]="searchCity"
                    name="searchCity"
                    placeholder="e.g. Jabalpur, Mumbai, Pune..."
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                  />
                </div>
              </div>

              <!-- Bedrooms / BHK Dropdown -->
              <div class="sm:col-span-3">
                <label for="searchBedrooms" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Bedrooms
                </label>
                <select
                  id="searchBedrooms"
                  [(ngModel)]="searchBedrooms"
                  name="searchBedrooms"
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              <!-- Furnishing Dropdown -->
              <div class="sm:col-span-4">
                <label for="searchFurnished" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Furnishing
                </label>
                <div class="flex gap-2">
                  <select
                    id="searchFurnished"
                    [(ngModel)]="searchFurnished"
                    name="searchFurnished"
                    class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                  >
                    <option value="">All Furnishings</option>
                    <option value="FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>

                  <!-- Search Submit Button -->
                  <button
                    type="submit"
                    class="btn-search-hero px-5 py-2.5 rounded-xl font-bold text-sm text-white shrink-0 shadow-md flex items-center justify-center gap-1.5 transition-all"
                    title="Search Apartments"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span class="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>

            </form>

            <!-- Popular Quick Cities Chips -->
            <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span class="font-semibold text-slate-400">Popular Cities:</span>
              <button
                type="button"
                *ngFor="let city of ['Jabalpur', 'Mumbai', 'Bengaluru', 'Delhi', 'Pune']"
                (click)="quickSearchCity(city)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors"
              >
                {{ city }}
              </button>
            </div>
          </div>

          <!-- Hero Metrics Bar -->
          <div class="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div class="text-2xl sm:text-3xl font-extrabold text-white">1,200+</div>
              <div class="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">Verified Properties</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-extrabold text-white">₹0</div>
              <div class="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">Brokerage Commission</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div class="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">Direct Host Contacts</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-extrabold text-white">4.9 ★</div>
              <div class="text-xs sm:text-sm text-indigo-200 font-medium mt-0.5">Renter Satisfaction</div>
            </div>
          </div>

        </div>
      </section>


      <!-- ========================================================= -->
      <!-- 2. FEATURED LISTINGS SECTION -->
      <!-- ========================================================= -->
      <section class="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <!-- Section Header -->
        <div class="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>Handpicked Selection</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Apartments
            </h2>
            <p class="text-slate-600 text-sm sm:text-base mt-1">
              Top-rated rental properties verified for modern amenities and great connectivity.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              *ngIf="currentUser?.role === 'LANDLORD'"
              routerLink="/create"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>+ List Property</span>
            </a>
            <a
              routerLink="/apartments"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>View All Listings</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Skeleton Loading Cards -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let n of [1, 2, 3]" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-3">
            <div class="aspect-[16/10] rounded-xl shimmer"></div>
            <div class="h-6 w-3/4 rounded-lg shimmer"></div>
            <div class="h-4 w-1/2 rounded-md shimmer"></div>
            <div class="flex gap-2 pt-2">
              <div class="h-5 w-16 rounded-md shimmer"></div>
              <div class="h-5 w-16 rounded-md shimmer"></div>
            </div>
          </div>
        </div>

        <!-- Featured Apartment Cards Grid -->
        <div *ngIf="!isLoading && featuredApartments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-apartment-card
            *ngFor="let apartment of featuredApartments"
            [apartment]="apartment"
            (viewDetails)="onViewDetails(apartment.id)"
          ></app-apartment-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && featuredApartments.length === 0" class="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" class="mx-auto mb-3">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <h3 class="text-lg font-bold text-slate-800 mb-1">No featured apartments found</h3>
          <p class="text-slate-500 text-sm mb-4">Be the first to list a property or check out all available listings.</p>
          <a routerLink="/apartments" class="btn-primary-compact px-5 py-2.5 rounded-xl text-sm font-semibold inline-block">
            Browse All Apartments
          </a>
        </div>
      </section>


      <!-- ========================================================= -->
      <!-- 3. HOW RENTHUB WORKS (3 STEP GUIDE) -->
      <!-- ========================================================= -->
      <section class="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center max-w-2xl mx-auto mb-14">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 mb-2">
              <span>Simple & Transparent</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Renting Made Effortless in 3 Simple Steps
            </h2>
            <p class="text-slate-600 text-sm sm:text-base mt-2">
              From discovering the perfect apartment to signing your lease, RentHub keeps the journey smooth and transparent.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Step 1 -->
            <div class="step-card">
              <div class="step-icon bg-indigo-50 text-indigo-600 border border-indigo-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div class="step-number text-indigo-600">Step 01</div>
              <h3 class="step-title">Discover & Filter</h3>
              <p class="step-desc">
                Search apartments by budget, BHK configuration, furnishing state, and dietary preferences with live photo galleries.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="step-card">
              <div class="step-icon bg-cyan-50 text-cyan-600 border border-cyan-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="step-number text-cyan-600">Step 02</div>
              <h3 class="step-title">Direct Host Contact</h3>
              <p class="step-desc">
                Connect directly with verified property hosts via verified phone and email without paying expensive broker commissions.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="step-card">
              <div class="step-icon bg-emerald-50 text-emerald-600 border border-emerald-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div class="step-number text-emerald-600">Step 03</div>
              <h3 class="step-title">Move In Seamlessly</h3>
              <p class="step-desc">
                Review transparent security deposits, inspect lease terms, and move into your dream living space with peace of mind.
              </p>
            </div>
          </div>

        </div>
      </section>


      <!-- ========================================================= -->
      <!-- 4. LATEST LISTINGS SECTION -->
      <!-- ========================================================= -->
      <section class="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div class="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Fresh On Market</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Latest Available Properties
            </h2>
            <p class="text-slate-600 text-sm sm:text-base mt-1">
              Newly published rental listings added this week.
            </p>
          </div>

          <a
            routerLink="/apartments"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Explore All {{ totalItems || '' }} Listings</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>

        <!-- Skeleton Loading Cards -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let n of [1, 2, 3, 4, 5, 6]" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-3">
            <div class="aspect-[16/10] rounded-xl shimmer"></div>
            <div class="h-6 w-3/4 rounded-lg shimmer"></div>
            <div class="h-4 w-1/2 rounded-md shimmer"></div>
          </div>
        </div>

        <!-- Latest Apartment Cards Grid -->
        <div *ngIf="!isLoading && latestApartments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-apartment-card
            *ngFor="let apartment of latestApartments"
            [apartment]="apartment"
            (viewDetails)="onViewDetails(apartment.id)"
          ></app-apartment-card>
        </div>

        <!-- Bottom Browse Button -->
        <div class="mt-12 text-center" *ngIf="!isLoading && latestApartments.length > 0">
          <a
            routerLink="/apartments"
            class="btn-primary-compact px-8 py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            <span>Browse All Apartments</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </section>


      <!-- ========================================================= -->
      <!-- 5. WHY CHOOSE RENTHUB (VALUE PROPOSITION) -->
      <!-- ========================================================= -->
      <section class="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center max-w-2xl mx-auto mb-14">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <span>Why RentHub</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed For Better Renting
            </h2>
            <p class="text-slate-600 text-sm sm:text-base mt-2">
              Everything you need to find and secure a comfortable rental home with confidence.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div class="feature-box">
              <div class="feature-icon bg-indigo-50 text-indigo-600">🛡️</div>
              <h3 class="feature-title">Verified Listings</h3>
              <p class="feature-desc">Every listing features authentic multi-photo galleries and verified landlord badges.</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon bg-emerald-50 text-emerald-600">💰</div>
              <h3 class="feature-title">Zero Hidden Fees</h3>
              <p class="feature-desc">Clear monthly rent and refundable security deposit breakdowns without surprise agent charges.</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon bg-rose-50 text-rose-600">❤️</div>
              <h3 class="feature-title">Instant Favourites</h3>
              <p class="feature-desc">Save listings with a single click and access your shortlisted properties across all devices.</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon bg-cyan-50 text-cyan-600">⚡</div>
              <h3 class="feature-title">Direct Host Connect</h3>
              <p class="feature-desc">Call or email property owners directly to schedule instant in-person visits.</p>
            </div>

          </div>

        </div>
      </section>




    </div>
  `,
  styles: [`
    .hero-container {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%);
    }

    .btn-search-hero {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
    }
    .btn-search-hero:hover {
      background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
      transform: translateY(-1px);
    }

    .btn-primary-compact {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: #ffffff;
      transition: all 0.2s ease;
    }
    .btn-primary-compact:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .step-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.75rem;
      position: relative;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .step-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
      border-color: #cbd5e1;
    }

    .step-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .step-number {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }

    .step-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .step-desc {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.5;
    }

    .feature-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.5rem;
      transition: all 0.2s ease;
    }
    .feature-box:hover {
      background-color: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .feature-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }

    .feature-desc {
      font-size: 0.825rem;
      color: #64748b;
      line-height: 1.5;
    }

    .shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmerAnim 1.5s infinite;
    }

    @keyframes shimmerAnim {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class HomeComponent implements OnInit, OnChanges, OnDestroy {
  featuredApartments: Apartment[] = [];
  latestApartments: Apartment[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  totalItems = 0;
  currentUser: User | null = null;

  // Search Bar Fields
  searchCity = '';
  searchBedrooms = '';
  searchFurnished = '';

  private destroy$ = new Subject<void>();

  constructor(
    private apartmentService: ApartmentService,
    private authService: AuthService,
    private favService: FavouriteService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
      });

    if (this.authService.isAuthenticated()) {
      this.favService.loadFavourites().subscribe();
    }

    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters']) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Fetch featured apartments (top 3)
    this.apartmentService
      .getApartments({}, 1, 3)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.featuredApartments = response.apartments;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load featured apartments.';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error loading featured apartments:', err);
        },
      });

    // Fetch latest listings (up to 6)
    this.apartmentService
      .getApartments({}, 1, 6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.latestApartments = response.apartments;
          this.totalItems = response.total;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load latest listings.';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error loading latest listings:', err);
        },
      });
  }

  onSearch(): void {
    const queryParams: any = {};
    if (this.searchCity.trim()) queryParams.city = this.searchCity.trim();
    if (this.searchBedrooms) queryParams.bedrooms = this.searchBedrooms;
    if (this.searchFurnished) queryParams.furnished = this.searchFurnished;
    this.router.navigate(['/apartments'], { queryParams });
  }

  quickSearchCity(city: string): void {
    this.searchCity = city;
    this.router.navigate(['/apartments'], { queryParams: { city } });
  }

  onViewDetails(apartmentId: string): void {
    this.router.navigate(['/apartments', apartmentId]);
  }
}
