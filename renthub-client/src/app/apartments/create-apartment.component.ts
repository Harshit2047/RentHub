import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApartmentService, ApartmentFormValues } from '../core/apartment.service';
import { ApartmentImage } from '../models/apartment.model';
import { ToastService } from '../shared/toast.service';
import { Subject, takeUntil } from 'rxjs';

interface PopularAmenity {
  name: string;
  category: string;
}

@Component({
  selector: 'app-create-apartment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">

        <!-- Top Header Navigation & Status -->
        <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <button type="button" class="btn-back" (click)="goBack()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Back to Listings</span>
          </button>

          <!-- Mode Toggle Tabs (Form vs Preview) -->
          <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-sm">
            <button
              type="button"
              (click)="editMode()"
              class="px-4 py-1.5 rounded-lg font-medium transition-all"
              [class.bg-indigo-600]="!isPreviewMode"
              [class.text-white]="!isPreviewMode"
              [class.text-slate-600]="isPreviewMode"
              [class.hover:text-slate-900]="isPreviewMode"
            >
              1. Listing Details Form
            </button>
            <button
              type="button"
              (click)="showPreview()"
              class="px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
              [class.bg-indigo-600]="isPreviewMode"
              [class.text-white]="isPreviewMode"
              [class.text-slate-600]="!isPreviewMode"
              [class.hover:text-slate-900]="!isPreviewMode"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>2. Full Preview</span>
            </button>
          </div>
        </div>

        <!-- Page Title & Subtitle Banner -->
        <div class="mb-8">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Landlord Property Portal</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ isPreviewMode ? 'Listing Preview Mode' : 'Create New Apartment Listing' }}
          </h1>
          <p class="text-slate-600 text-sm sm:text-base mt-1">
            {{ isPreviewMode
              ? 'Review how prospective tenants will experience your property before publishing.'
              : 'Provide complete details and high-resolution images to publish your property on RentHub.' }}
          </p>
        </div>

        <!-- ========================================================= -->
        <!-- VIEW 1: CREATION FORM MODE -->
        <!-- ========================================================= -->
        <div *ngIf="!isPreviewMode" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <!-- Left Columns (Main Form Sections) -->
          <div class="lg:col-span-2 space-y-6">

            <form [formGroup]="apartmentForm" (ngSubmit)="onSubmit()" class="space-y-6">

              <!-- Section 1: Basic Information -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-indigo-50 text-indigo-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Basic Information</h2>
                    <p class="card-subtitle">Set an attractive title and clear description for your apartment</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <!-- Title -->
                  <div>
                    <label for="title" class="field-label">
                      Listing Title <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      formControlName="title"
                      class="field-input"
                      [class.field-input-error]="f.title?.invalid && (submitted || f.title?.touched)"
                      placeholder="e.g. Spacious 2BHK Apartment with Balcony & City View"
                    />
                    <div *ngIf="f.title?.invalid && (submitted || f.title?.touched)" class="field-error">
                      <span *ngIf="f.title?.errors?.['required']">Property title is required</span>
                      <span *ngIf="f.title?.errors?.['maxlength']">Title must be under 200 characters</span>
                    </div>
                  </div>

                  <!-- Description -->
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label for="description" class="field-label mb-0">Property Description</label>
                      <span class="text-xs text-slate-400">
                        {{ apartmentForm.get('description')?.value?.length || 0 }} / 1000
                      </span>
                    </div>
                    <textarea
                      id="description"
                      rows="4"
                      formControlName="description"
                      class="field-input resize-y"
                      placeholder="Highlight unique features: natural lighting, nearby metro/markets, peaceful neighborhood, modular kitchen..."
                    ></textarea>
                    <p class="text-xs text-slate-400 mt-1">Detailed descriptions receive 40% more tenant inquiries.</p>
                  </div>
                </div>
              </div>

              <!-- Section 2: Pricing & Availability -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-emerald-50 text-emerald-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Pricing & Lease Terms</h2>
                    <p class="card-subtitle">Specify monthly rent, security deposit and availability</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Monthly Rent -->
                  <div>
                    <label for="monthlyRent" class="field-label">
                      Monthly Rent (₹) <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        id="monthlyRent"
                        type="number"
                        formControlName="monthlyRent"
                        class="field-input pl-8"
                        [class.field-input-error]="f.monthlyRent?.invalid && (submitted || f.monthlyRent?.touched)"
                        placeholder="e.g. 25000"
                        min="1"
                      />
                    </div>
                    <div *ngIf="f.monthlyRent?.invalid && (submitted || f.monthlyRent?.touched)" class="field-error">
                      <span *ngIf="f.monthlyRent?.errors?.['required']">Monthly rent is required</span>
                      <span *ngIf="f.monthlyRent?.errors?.['min']">Monthly rent must be greater than 0</span>
                    </div>
                  </div>

                  <!-- Security Deposit -->
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label for="securityDeposit" class="field-label mb-0">Security Deposit (₹)</label>
                      <span class="text-xs text-emerald-600 font-medium">Refundable</span>
                    </div>
                    <div class="relative">
                      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        id="securityDeposit"
                        type="number"
                        formControlName="securityDeposit"
                        class="field-input pl-8"
                        placeholder="e.g. 50000"
                        min="0"
                      />
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Leave 0 or empty if no deposit is required.</p>
                  </div>

                  <!-- Availability Status -->
                  <div class="sm:col-span-2">
                    <label for="availability" class="field-label">Availability Status</label>
                    <div class="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        (click)="setAvailability('AVAILABLE')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('availability')?.value === 'AVAILABLE'"
                      >
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span class="font-medium text-sm">Available Now</span>
                      </button>
                      <button
                        type="button"
                        (click)="setAvailability('PENDING')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('availability')?.value === 'PENDING'"
                      >
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span class="font-medium text-sm">Pending</span>
                      </button>
                      <button
                        type="button"
                        (click)="setAvailability('RENTED')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('availability')?.value === 'RENTED'"
                      >
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                        <span class="font-medium text-sm">Rented</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Property Specs & Living Preferences -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-cyan-50 text-cyan-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Property Specifications & Rules</h2>
                    <p class="card-subtitle">Room counts, square footage and household rules</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <!-- Bedrooms -->
                  <div>
                    <label for="bedrooms" class="field-label">
                      Bedrooms <span class="text-rose-500">*</span>
                    </label>
                    <div class="flex items-center">
                      <button
                        type="button"
                        (click)="decrement('bedrooms')"
                        class="stepper-btn rounded-l-xl"
                        aria-label="Decrease bedrooms"
                      >
                        –
                      </button>
                      <input
                        id="bedrooms"
                        type="number"
                        formControlName="bedrooms"
                        class="field-input text-center rounded-none font-bold"
                        [class.field-input-error]="f.bedrooms?.invalid && (submitted || f.bedrooms?.touched)"
                        min="1"
                        max="10"
                      />
                      <button
                        type="button"
                        (click)="increment('bedrooms')"
                        class="stepper-btn rounded-r-xl"
                        aria-label="Increase bedrooms"
                      >
                        +
                      </button>
                    </div>
                    <div *ngIf="f.bedrooms?.invalid && (submitted || f.bedrooms?.touched)" class="field-error">
                      <span *ngIf="f.bedrooms?.errors?.['required']">Bedrooms required</span>
                      <span *ngIf="f.bedrooms?.errors?.['min']">Min 1</span>
                    </div>
                  </div>

                  <!-- Bathrooms -->
                  <div>
                    <label for="bathrooms" class="field-label">
                      Bathrooms <span class="text-rose-500">*</span>
                    </label>
                    <div class="flex items-center">
                      <button
                        type="button"
                        (click)="decrement('bathrooms')"
                        class="stepper-btn rounded-l-xl"
                        aria-label="Decrease bathrooms"
                      >
                        –
                      </button>
                      <input
                        id="bathrooms"
                        type="number"
                        formControlName="bathrooms"
                        class="field-input text-center rounded-none font-bold"
                        [class.field-input-error]="f.bathrooms?.invalid && (submitted || f.bathrooms?.touched)"
                        min="1"
                        max="10"
                      />
                      <button
                        type="button"
                        (click)="increment('bathrooms')"
                        class="stepper-btn rounded-r-xl"
                        aria-label="Increase bathrooms"
                      >
                        +
                      </button>
                    </div>
                    <div *ngIf="f.bathrooms?.invalid && (submitted || f.bathrooms?.touched)" class="field-error">
                      <span *ngIf="f.bathrooms?.errors?.['required']">Bathrooms required</span>
                      <span *ngIf="f.bathrooms?.errors?.['min']">Min 1</span>
                    </div>
                  </div>

                  <!-- Carpet Area -->
                  <div>
                    <label for="area" class="field-label">Carpet Area</label>
                    <div class="relative">
                      <input
                        id="area"
                        type="number"
                        formControlName="area"
                        class="field-input pr-14"
                        placeholder="e.g. 1250"
                        min="1"
                      />
                      <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">sq ft</span>
                    </div>
                  </div>
                </div>

                <!-- Furnishing Status visual selection -->
                <div class="mb-5">
                  <label class="field-label">
                    Furnishing Status <span class="text-rose-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      (click)="setFurnished('FURNISHED')"
                      class="visual-select-card"
                      [class.active]="apartmentForm.get('furnished')?.value === 'FURNISHED'"
                    >
                      <div class="text-lg mb-1">🛋️</div>
                      <div class="font-bold text-slate-900 text-sm">Fully Furnished</div>
                      <div class="text-xs text-slate-500">Sofa, beds, AC, appliances</div>
                    </button>
                    <button
                      type="button"
                      (click)="setFurnished('SEMI_FURNISHED')"
                      class="visual-select-card"
                      [class.active]="apartmentForm.get('furnished')?.value === 'SEMI_FURNISHED'"
                    >
                      <div class="text-lg mb-1">🪑</div>
                      <div class="font-bold text-slate-900 text-sm">Semi-Furnished</div>
                      <div class="text-xs text-slate-500">Wardrobes, lights & fans</div>
                    </button>
                    <button
                      type="button"
                      (click)="setFurnished('UNFURNISHED')"
                      class="visual-select-card"
                      [class.active]="apartmentForm.get('furnished')?.value === 'UNFURNISHED'"
                    >
                      <div class="text-lg mb-1">📦</div>
                      <div class="font-bold text-slate-900 text-sm">Unfurnished</div>
                      <div class="text-xs text-slate-500">Bare unit for tenant setup</div>
                    </button>
                  </div>
                </div>

                <!-- Dietary Rule visual selection -->
                <div>
                  <label class="field-label">
                    Dietary / Food Rule <span class="text-rose-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      (click)="setVegetarian('ALLOWED')"
                      class="visual-select-card text-left flex items-center gap-3 p-3.5"
                      [class.active]="apartmentForm.get('vegetarian')?.value === 'ALLOWED'"
                    >
                      <span class="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0">
                        <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                      </span>
                      <div>
                        <div class="font-bold text-slate-900 text-sm">Vegetarian Preferred / Only</div>
                        <div class="text-xs text-slate-500">Pure-veg tenants preferred</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      (click)="setVegetarian('NOT_ALLOWED')"
                      class="visual-select-card text-left flex items-center gap-3 p-3.5"
                      [class.active]="apartmentForm.get('vegetarian')?.value === 'NOT_ALLOWED'"
                    >
                      <span class="w-4 h-4 rounded-full border-2 border-rose-600 flex items-center justify-center shrink-0">
                        <span class="w-2 h-2 rounded-full bg-rose-600"></span>
                      </span>
                      <div>
                        <div class="font-bold text-slate-900 text-sm">Non-Vegetarian Allowed</div>
                        <div class="text-xs text-slate-500">No dietary restrictions</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Section 4: Location & Address -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-amber-50 text-amber-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Location & Address</h2>
                    <p class="card-subtitle">Exact address and geographic location details</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <!-- Street Address -->
                  <div>
                    <label for="address" class="field-label">
                      Street Address <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      formControlName="address"
                      class="field-input"
                      [class.field-input-error]="f.address?.invalid && (submitted || f.address?.touched)"
                      placeholder="e.g. Flat 304, Green Park Society, MG Road"
                    />
                    <div *ngIf="f.address?.invalid && (submitted || f.address?.touched)" class="field-error">
                      <span *ngIf="f.address?.errors?.['required']">Street address is required</span>
                    </div>
                  </div>

                  <!-- City & State -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="city" class="field-label">
                        City <span class="text-rose-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        formControlName="city"
                        class="field-input"
                        [class.field-input-error]="f.city?.invalid && (submitted || f.city?.touched)"
                        placeholder="e.g. Mumbai, Bengaluru, Jabalpur"
                      />
                      <div *ngIf="f.city?.invalid && (submitted || f.city?.touched)" class="field-error">
                        <span *ngIf="f.city?.errors?.['required']">City is required</span>
                      </div>
                    </div>

                    <div>
                      <label for="state" class="field-label">State / Region</label>
                      <input
                        id="state"
                        type="text"
                        formControlName="state"
                        class="field-input"
                        placeholder="e.g. Maharashtra, Karnataka, MP"
                      />
                    </div>
                  </div>

                  <!-- PIN Code -->
                  <div class="w-full sm:w-1/2">
                    <label for="pincode" class="field-label">Postal / PIN Code</label>
                    <input
                      id="pincode"
                      type="text"
                      formControlName="pincode"
                      class="field-input"
                      placeholder="e.g. 400001"
                      maxlength="10"
                    />
                  </div>
                </div>
              </div>

              <!-- Section 5: Amenities (Interactive Quick-Select) -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-purple-50 text-purple-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div class="flex-1 flex items-center justify-between">
                    <div>
                      <h2 class="card-title">Apartment Amenities</h2>
                      <p class="card-subtitle">Select features available in your property</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {{ amenities.length }} / 10 selected
                    </span>
                  </div>
                </div>

                <!-- Popular Amenity Chips -->
                <div class="mb-4">
                  <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Popular Amenities (Click to toggle)</div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      *ngFor="let item of popularAmenities"
                      (click)="toggleAmenity(item.name)"
                      class="amenity-chip-btn"
                      [class.active]="amenities.includes(item.name)"
                    >
                      <svg *ngIf="amenities.includes(item.name)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-indigo-600">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{{ item.name }}</span>
                    </button>
                  </div>
                </div>

                <!-- Custom Amenity Input -->
                <div>
                  <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Add Custom Amenity</div>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [(ngModel)]="customAmenityInput"
                      [ngModelOptions]="{standalone: true}"
                      (keyup.enter)="addCustomAmenity()"
                      placeholder="e.g. EV Charging Station, Jacuzzi, Servant Room..."
                      class="field-input flex-1"
                    />
                    <button
                      type="button"
                      (click)="addCustomAmenity()"
                      class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <!-- Selected Amenities Pills -->
                <div *ngIf="amenities.length > 0" class="mt-4 pt-4 border-t border-slate-100">
                  <div class="text-xs text-slate-500 font-medium mb-2">Selected for this listing:</div>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      *ngFor="let am of amenities"
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      <span>{{ am }}</span>
                      <button
                        type="button"
                        (click)="removeAmenity(am)"
                        class="hover:text-rose-600 ml-0.5 leading-none"
                        aria-label="Remove amenity"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Section 6: Photo Gallery Upload -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-rose-50 text-rose-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div class="flex-1 flex items-center justify-between">
                    <div>
                      <h2 class="card-title">Property Photos</h2>
                      <p class="card-subtitle">Upload 1 to 6 high-resolution photos of the apartment</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {{ selectedFiles.length }} / 6 uploaded
                    </span>
                  </div>
                </div>

                <!-- Drag & Drop Zone -->
                <div
                  class="dropzone-box"
                  [class.dropzone-box-active]="isDragging"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                  (click)="fileInput.click()"
                >
                  <input
                    type="file"
                    #fileInput
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    (change)="onFileSelected($event)"
                    class="hidden"
                  />
                  <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mb-1">
                    Click to browse or drag & drop property photos here
                  </div>
                  <p class="text-xs text-slate-400">
                    Supported formats: JPEG, PNG, WebP (up to 5MB each). Recommended 3-6 photos.
                  </p>
                </div>

                <!-- Photo Preview Grid -->
                <div *ngIf="selectedFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  <div
                    *ngFor="let item of selectedFiles; let i = index"
                    class="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 shadow-sm"
                  >
                    <img [src]="item.preview" [alt]="'Photo ' + (i+1)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    <!-- Cover Photo Badge on first item -->
                    <span *ngIf="i === 0" class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                      Cover Photo
                    </span>

                    <!-- Remove Button -->
                    <button
                      type="button"
                      (click)="removePreview(i, $event)"
                      class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow"
                      title="Remove image"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Empty state hint -->
                <div *ngIf="selectedFiles.length === 0" class="mt-3 text-center text-xs text-slate-400">
                  No images uploaded yet. Listings with photos receive 5x more tenant clicks.
                </div>
              </div>

            </form>

          </div>

          <!-- Right Column: Sticky Live Preview Card & Publishing Checklist -->
          <div class="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

            <!-- Real-time Mini Listing Card Preview -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-hidden">
              <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center justify-between">
                <span>Live Card Preview</span>
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <!-- Card Mockup -->
              <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div class="relative aspect-[16/10] bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                  <img
                    *ngIf="selectedFiles.length > 0"
                    [src]="selectedFiles[0].preview"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <div *ngIf="selectedFiles.length === 0" class="flex flex-col items-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span class="text-xs mt-1">Photo Preview</span>
                  </div>

                  <span class="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {{ apartmentForm.get('availability')?.value === 'AVAILABLE' ? 'Available' : 'Rented' }}
                  </span>
                </div>

                <div class="p-3.5 bg-white">
                  <div class="text-indigo-600 font-extrabold text-base">
                    {{ formatRent(apartmentForm.get('monthlyRent')?.value) }}
                    <span class="text-xs text-slate-500 font-normal">/ month</span>
                  </div>
                  <div class="font-bold text-slate-900 text-sm truncate mt-0.5">
                    {{ apartmentForm.get('title')?.value || 'Apartment Title...' }}
                  </div>
                  <div class="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{{ previewAddress }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100">
                    <span>🛏️ {{ apartmentForm.get('bedrooms')?.value || 1 }} Beds</span>
                    <span>•</span>
                    <span>🚿 {{ apartmentForm.get('bathrooms')?.value || 1 }} Baths</span>
                    <span>•</span>
                    <span>📐 {{ apartmentForm.get('area')?.value || '—' }} sq ft</span>
                  </div>
                </div>
              </div>

              <!-- Readiness Checklist -->
              <div class="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div class="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Readiness Checklist</div>
                
                <div class="flex items-center justify-between" [class.text-emerald-600]="f.title?.valid" [class.text-slate-400]="!f.title?.valid">
                  <span>Property Title</span>
                  <span>{{ f.title?.valid ? '✓ Ready' : 'Required' }}</span>
                </div>

                <div class="flex items-center justify-between" [class.text-emerald-600]="f.monthlyRent?.valid" [class.text-slate-400]="!f.monthlyRent?.valid">
                  <span>Monthly Rent</span>
                  <span>{{ f.monthlyRent?.valid ? '✓ Ready' : 'Required' }}</span>
                </div>

                <div class="flex items-center justify-between" [class.text-emerald-600]="f.address?.valid && f.city?.valid" [class.text-slate-400]="!(f.address?.valid && f.city?.valid)">
                  <span>Location & City</span>
                  <span>{{ (f.address?.valid && f.city?.valid) ? '✓ Ready' : 'Required' }}</span>
                </div>

                <div class="flex items-center justify-between" [class.text-emerald-600]="selectedFiles.length > 0" [class.text-slate-400]="selectedFiles.length === 0">
                  <span>Photos Attached</span>
                  <span>{{ selectedFiles.length > 0 ? selectedFiles.length + ' added' : 'Recommended' }}</span>
                </div>
              </div>

              <!-- Main CTA buttons -->
              <div class="mt-5 space-y-2">
                <button
                  type="button"
                  (click)="showPreview()"
                  class="btn-secondary w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>Preview Full Listing</span>
                </button>

                <button
                  type="button"
                  (click)="finalSubmit()"
                  [disabled]="isSubmitting"
                  class="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg *ngIf="!isSubmitting" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg *ngIf="isSubmitting" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span>{{ isSubmitting ? 'Publishing Listing...' : 'Publish Listing Now' }}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        <!-- ========================================================= -->
        <!-- VIEW 2: FULL PREVIEW MODE -->
        <!-- ========================================================= -->
        <div *ngIf="isPreviewMode" class="space-y-6">

          <!-- Preview Bar -->
          <div class="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div>
                <div class="font-bold text-base">Full Listing Preview</div>
                <div class="text-indigo-100 text-xs">Verify all property data before making your listing public.</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="editMode()"
                class="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ← Return to Edit
              </button>
              <button
                type="button"
                (click)="finalSubmit()"
                [disabled]="isSubmitting"
                class="px-5 py-2 rounded-xl text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm transition-all"
              >
                Publish Listing Now
              </button>
            </div>
          </div>

          <!-- High-Fidelity Details Layout Mockup -->
          <div>
            <!-- Gallery Section -->
            <div class="gallery-preview-box mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
              <div class="relative w-full aspect-[16/9] max-h-[460px] bg-slate-950 flex items-center justify-center">
                <img
                  *ngIf="selectedFiles.length > 0"
                  [src]="selectedFiles[activePreviewImageIndex]?.preview || selectedFiles[0].preview"
                  alt="Property Preview"
                  class="w-full h-full object-cover"
                />
                <div *ngIf="selectedFiles.length === 0" class="text-center text-slate-400 py-20">
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span class="text-sm font-medium">No photos uploaded for this listing</span>
                </div>

                <div *ngIf="selectedFiles.length > 1" class="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {{ activePreviewImageIndex + 1 }} / {{ selectedFiles.length }} photos
                </div>
              </div>

              <!-- Thumbnails -->
              <div *ngIf="selectedFiles.length > 1" class="flex gap-2 p-3 bg-slate-900 border-t border-slate-800 overflow-x-auto">
                <button
                  type="button"
                  *ngFor="let file of selectedFiles; let idx = index"
                  (click)="activePreviewImageIndex = idx"
                  class="w-18 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all"
                  [class.border-indigo-500]="idx === activePreviewImageIndex"
                  [class.border-transparent]="idx !== activePreviewImageIndex"
                  [class.opacity-60]="idx !== activePreviewImageIndex"
                >
                  <img [src]="file.preview" alt="Thumb" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              <!-- Left 2 Cols -->
              <div class="lg:col-span-2 space-y-6">

                <!-- Title & Location Card -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {{ apartmentForm.get('title')?.value || 'Untitled Apartment Listing' }}
                  </h1>
                  <p class="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" class="shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{{ fullAddress }}</span>
                  </p>
                </div>

                <!-- 4 Stats Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="stat-pill">
                    <div class="stat-pill-val">{{ apartmentForm.get('bedrooms')?.value || 1 }} Bedrooms</div>
                    <div class="stat-pill-sub">{{ apartmentForm.get('bedrooms')?.value || 1 }} BHK Living</div>
                  </div>
                  <div class="stat-pill">
                    <div class="stat-pill-val">{{ apartmentForm.get('bathrooms')?.value || 1 }} Bathrooms</div>
                    <div class="stat-pill-sub">Standard Bath</div>
                  </div>
                  <div class="stat-pill">
                    <div class="stat-pill-val">{{ apartmentForm.get('area')?.value || '—' }} sq ft</div>
                    <div class="stat-pill-sub">Carpet Area</div>
                  </div>
                  <div class="stat-pill">
                    <div class="stat-pill-val">{{ formatFurnished(apartmentForm.get('furnished')?.value) }}</div>
                    <div class="stat-pill-sub">Furnished status</div>
                  </div>
                </div>

                <!-- Description -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 class="text-xl font-bold text-slate-900 mb-3">About this Apartment</h2>
                  <p class="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base" *ngIf="apartmentForm.get('description')?.value">
                    {{ apartmentForm.get('description')?.value }}
                  </p>
                  <p class="text-slate-400 italic text-sm" *ngIf="!apartmentForm.get('description')?.value">
                    No description provided yet.
                  </p>
                </div>

                <!-- Specifications Breakdown -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 class="text-xl font-bold text-slate-900 mb-4">Apartment Specifications</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div class="spec-row">
                      <span class="spec-label">Monthly Rent</span>
                      <span class="spec-val font-bold text-indigo-600">{{ formatRent(apartmentForm.get('monthlyRent')?.value) }} / month</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">Security Deposit</span>
                      <span class="spec-val font-semibold text-slate-700">{{ formatRent(apartmentForm.get('securityDeposit')?.value) }} (Refundable)</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">Furnishing Status</span>
                      <span class="spec-val font-medium text-slate-800">{{ formatFurnished(apartmentForm.get('furnished')?.value) }}</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">Dietary / Food Rule</span>
                      <span class="spec-val font-medium text-slate-800">{{ formatVeg(apartmentForm.get('vegetarian')?.value) }}</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">Street Address</span>
                      <span class="spec-val text-slate-700">{{ apartmentForm.get('address')?.value || '—' }}</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">City, State</span>
                      <span class="spec-val text-slate-700">{{ apartmentForm.get('city')?.value }}, {{ apartmentForm.get('state')?.value || '—' }}</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">Postal / PIN Code</span>
                      <span class="spec-val text-slate-700">{{ apartmentForm.get('pincode')?.value || '—' }}</span>
                    </div>
                    <div class="spec-row">
                      <span class="spec-label">Availability Status</span>
                      <span class="spec-val font-semibold text-emerald-600">
                        {{ apartmentForm.get('availability')?.value === 'AVAILABLE' ? 'Available Immediately' : 'Rented' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Amenities Cloud in Preview -->
                <div *ngIf="amenities.length > 0" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 class="text-xl font-bold text-slate-900 mb-3">Amenities & Perks</h2>
                  <div class="flex flex-wrap gap-2">
                    <span
                      *ngFor="let am of amenities"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{{ am }}</span>
                    </span>
                  </div>
                </div>

              </div>

              <!-- Right Col: Price Box & Host Information -->
              <div class="lg:col-span-1 space-y-6">

                <!-- Price Box -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Monthly Rent</div>
                  <div class="flex items-baseline gap-1 mb-2">
                    <span class="text-3xl font-extrabold text-slate-900">{{ formatRent(apartmentForm.get('monthlyRent')?.value) }}</span>
                    <span class="text-slate-500 text-sm font-medium">/ month</span>
                  </div>
                  <div class="text-xs text-slate-500 mb-5">
                    Security Deposit: <strong class="text-slate-800">{{ formatRent(apartmentForm.get('securityDeposit')?.value) }}</strong>
                  </div>

                  <button
                    type="button"
                    (click)="finalSubmit()"
                    [disabled]="isSubmitting"
                    class="btn-primary w-full py-3 rounded-xl text-sm font-bold shadow-sm"
                  >
                    Confirm & Publish Listing
                  </button>

                  <button
                    type="button"
                    (click)="editMode()"
                    class="btn-secondary w-full py-2.5 rounded-xl text-sm font-semibold mt-2"
                  >
                    Edit Details
                  </button>
                </div>

                <!-- Host Card Notice -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">Host & Contact Information</div>
                  <p class="text-sm text-slate-600 leading-relaxed">
                    Once published, inquiries will be routed to your registered landlord profile email and telephone number.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      <!-- Confirmation Modal Dialog -->
      <div
        *ngIf="showConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        (click)="cancelSubmit()"
      >
        <div
          class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center gap-3.5 mb-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Publish this listing?</h3>
              <p class="text-xs text-slate-500">Your apartment will be live and searchable by tenants.</p>
            </div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-5">
            <div class="flex justify-between text-slate-600">
              <span>Title:</span>
              <strong class="text-slate-900 truncate max-w-[200px]">{{ apartmentForm.get('title')?.value }}</strong>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Monthly Rent:</span>
              <strong class="text-indigo-600 font-bold">{{ formatRent(apartmentForm.get('monthlyRent')?.value) }}/mo</strong>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>City / Location:</span>
              <strong class="text-slate-900">{{ apartmentForm.get('city')?.value }}</strong>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Photos:</span>
              <strong class="text-slate-900">{{ selectedFiles.length }} uploaded</strong>
            </div>
          </div>

          <div class="flex justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              (click)="cancelSubmit()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm"
              (click)="performSubmit()"
            >
              Yes, Publish Listing
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .btn-back:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    .form-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .card-subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .field-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.35rem;
    }

    .field-input {
      width: 100%;
      border-radius: 0.75rem;
      border: 1.5px solid #cbd5e1;
      padding: 0.65rem 0.875rem;
      font-size: 0.925rem;
      color: #0f172a;
      background-color: #ffffff;
      transition: all 0.2s ease;
      outline: none;
    }
    .field-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    .field-input-error {
      border-color: #ef4444 !important;
      background-color: #fef2f2;
    }

    .field-error {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .stepper-btn {
      width: 44px;
      height: 44px;
      background-color: #f8fafc;
      border: 1.5px solid #cbd5e1;
      color: #334155;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .stepper-btn:hover {
      background-color: #e2e8f0;
      color: #0f172a;
    }

    .radio-pill-card {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.75rem;
      border: 1.5px solid #e2e8f0;
      background-color: #f8fafc;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .radio-pill-card:hover {
      border-color: #cbd5e1;
      background-color: #ffffff;
    }
    .radio-pill-card.active {
      border-color: #4f46e5;
      background-color: #eef2ff;
      color: #4338ca;
      box-shadow: 0 0 0 1px #4f46e5;
    }

    .visual-select-card {
      padding: 1rem;
      border-radius: 0.875rem;
      border: 1.5px solid #e2e8f0;
      background-color: #ffffff;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .visual-select-card:hover {
      border-color: #cbd5e1;
      background-color: #f8fafc;
    }
    .visual-select-card.active {
      border-color: #4f46e5;
      background-color: #eef2ff;
      box-shadow: 0 0 0 1.5px #4f46e5;
    }

    .amenity-chip-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      border-radius: 0.65rem;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      color: #475569;
      font-size: 0.825rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .amenity-chip-btn:hover {
      border-color: #cbd5e1;
      background-color: #f8fafc;
      color: #0f172a;
    }
    .amenity-chip-btn.active {
      border-color: #c7d2fe;
      background-color: #eef2ff;
      color: #4338ca;
      font-weight: 600;
    }

    .dropzone-box {
      border: 2px dashed #cbd5e1;
      border-radius: 1rem;
      padding: 2rem 1.5rem;
      text-align: center;
      background-color: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .dropzone-box:hover, .dropzone-box-active {
      border-color: #4f46e5;
      background-color: #f5f3ff;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: #ffffff;
      transition: all 0.2s ease;
    }
    .btn-primary:hover:not(:disabled) {
      opacity: 0.95;
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #ffffff;
      border: 1.5px solid #e2e8f0;
      color: #334155;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    .stat-pill {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
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
  `]
})
export class CreateApartmentComponent implements OnInit, OnDestroy {
  apartmentForm: any;
  submitted = false;
  isSubmitting = false;
  isPreviewMode = false;
  formValid = false;
  showError = false;
  errorMessage = '';
  showConfirm = false;
  isDragging = false;
  activePreviewImageIndex = 0;

  previewImages: ApartmentImage[] = [];
  selectedFiles: Array<{ file: File; preview: string }> = [];
  existingImages: ApartmentImage[] = [];
  amenities: string[] = [];
  customAmenityInput = '';

  popularAmenities: PopularAmenity[] = [
    { name: 'Parking Space', category: 'facility' },
    { name: 'High-Speed WiFi', category: 'facility' },
    { name: 'Air Conditioning', category: 'facility' },
    { name: 'Elevator / Lift', category: 'facility' },
    { name: 'Power Backup', category: 'facility' },
    { name: 'Gym & Fitness', category: 'leisure' },
    { name: 'Private Balcony', category: 'leisure' },
    { name: 'Swimming Pool', category: 'leisure' },
    { name: '24x7 Security', category: 'security' },
    { name: 'Gated Society', category: 'security' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private apartmentService: ApartmentService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.apartmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(100)]],
      pincode: ['', [Validators.maxLength(10)]],
      monthlyRent: [null, [Validators.required, Validators.min(1)]],
      securityDeposit: [null, [Validators.min(0)]],
      bedrooms: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      bathrooms: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      area: [null, [Validators.min(0)]],
      furnished: ['FURNISHED', [Validators.required]],
      vegetarian: ['ALLOWED', [Validators.required]],
      availability: ['AVAILABLE'],
      amenities: [[]],
    });

    Object.keys(this.apartmentForm.controls).forEach((key) => {
      Object.defineProperty(this.apartmentForm, key, {
        get: () => this.apartmentForm.get(key),
        enumerable: true,
        configurable: true,
      });
    });

    this.apartmentForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.computeFormValidity();
        this.cdr.detectChanges();
      });

    this.computeFormValidity();
  }

  get f(): any {
    return { ...this.apartmentForm?.controls, submitted: this.submitted };
  }

  get previewAddress(): string {
    const city = this.apartmentForm.get('city')?.value;
    const state = this.apartmentForm.get('state')?.value;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    return 'City, Location';
  }

  get fullAddress(): string {
    const parts = [
      this.apartmentForm.get('address')?.value,
      this.apartmentForm.get('city')?.value,
      this.apartmentForm.get('state')?.value,
      this.apartmentForm.get('pincode')?.value,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Address not specified';
  }

  increment(fieldName: string): void {
    const control = this.apartmentForm.get(fieldName);
    if (!control) return;
    const val = Number(control.value || 0);
    if (val < 10) {
      control.setValue(val + 1);
    }
  }

  decrement(fieldName: string): void {
    const control = this.apartmentForm.get(fieldName);
    if (!control) return;
    const val = Number(control.value || 0);
    if (val > 1) {
      control.setValue(val - 1);
    }
  }

  setAvailability(status: string): void {
    this.apartmentForm.get('availability')?.setValue(status);
  }

  setFurnished(status: string): void {
    this.apartmentForm.get('furnished')?.setValue(status);
  }

  setVegetarian(status: string): void {
    this.apartmentForm.get('vegetarian')?.setValue(status);
  }

  toggleAmenity(name: string): void {
    const idx = this.amenities.indexOf(name);
    if (idx >= 0) {
      this.amenities.splice(idx, 1);
    } else {
      if (this.amenities.length >= 10) {
        this.toast.warning('Maximum 10 amenities allowed.');
        return;
      }
      this.amenities.push(name);
    }
    this.cdr.detectChanges();
  }

  addCustomAmenity(): void {
    const val = this.customAmenityInput.trim();
    if (!val) return;
    if (this.amenities.includes(val)) {
      this.toast.info('Amenity already in list.');
      return;
    }
    if (this.amenities.length >= 10) {
      this.toast.warning('Maximum 10 amenities allowed.');
      return;
    }
    this.amenities.push(val);
    this.customAmenityInput = '';
    this.cdr.detectChanges();
  }

  removeAmenity(name: string): void {
    this.amenities = this.amenities.filter((a) => a !== name);
    this.cdr.detectChanges();
  }

  addAmenity(event: any): void {
    const input = event.target;
    const value = input.value.trim();
    if (value && this.amenities.length < 10) {
      this.amenities.push(value);
    }
    input.value = '';
    this.cdr.detectChanges();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      this.handleFiles(files);
    }
    event.target.value = '';
  }

  private handleFiles(files: FileList): void {
    if (!files || files.length === 0) return;
    const remainingSlots = 6 - this.selectedFiles.length;
    if (remainingSlots <= 0) {
      this.toast.warning('Maximum 6 property photos allowed.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    let addedCount = 0;
    for (let i = 0; i < files.length && addedCount < remainingSlots; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        this.toast.warning(`${file.name}: Only JPEG, PNG, or WebP files are supported.`);
        continue;
      }
      if (file.size > maxSize) {
        this.toast.warning(`${file.name}: Image size must be under 5MB.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file,
          preview: e.target.result,
        });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
      addedCount++;
    }

    if (files.length > remainingSlots) {
      this.toast.info(`Added the first ${remainingSlots} photos (maximum 6).`);
    }
  }

  removePreview(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedFiles.splice(index, 1);
    if (this.activePreviewImageIndex >= this.selectedFiles.length) {
      this.activePreviewImageIndex = Math.max(0, this.selectedFiles.length - 1);
    }
    this.cdr.detectChanges();
  }

  removeExistingImage(imageId: string): void {
    this.existingImages = this.existingImages.filter((img) => img.id !== imageId);
  }

  computeFormValidity(): void {
    this.formValid =
      this.apartmentForm.title?.valid &&
      this.apartmentForm.address?.valid &&
      this.apartmentForm.city?.valid &&
      this.apartmentForm.monthlyRent?.valid &&
      this.apartmentForm.bedrooms?.valid &&
      this.apartmentForm.bathrooms?.valid &&
      this.apartmentForm.furnished?.valid &&
      this.apartmentForm.vegetarian?.valid;
  }

  showPreview(): void {
    this.submitted = true;

    if (!this.computeIsValid()) {
      this.toast.warning('Please complete all required fields before previewing.');
      return;
    }

    this.clearMessage();
    this.activePreviewImageIndex = 0;
    this.isPreviewMode = true;
    this.formValid = true;
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editMode(): void {
    this.isPreviewMode = false;
    this.formValid = false;
    this.submitted = false;
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  finalSubmit(): void {
    this.submitted = true;

    if (!this.computeIsValid()) {
      this.toast.error('Please fill in all required fields marked with *');
      return;
    }

    this.clearMessage();
    this.showConfirm = true;
    this.cdr.detectChanges();
  }

  cancelSubmit(): void {
    this.showConfirm = false;
    this.cdr.detectChanges();
  }

  performSubmit(): void {
    if (this.isSubmitting) return;

    this.showConfirm = false;
    this.isSubmitting = true;
    this.submitted = true;
    this.clearMessage();
    this.cdr.detectChanges();

    const formValues: ApartmentFormValues = {
      title: this.apartmentForm.title.value,
      description: this.apartmentForm.description.value || undefined,
      address: this.apartmentForm.address.value,
      city: this.apartmentForm.city.value,
      state: this.apartmentForm.state.value || undefined,
      pincode: this.apartmentForm.pincode.value || undefined,
      monthlyRent: Number(this.apartmentForm.monthlyRent.value),
      securityDeposit: this.apartmentForm.securityDeposit.value ? Number(this.apartmentForm.securityDeposit.value) : 0,
      bedrooms: Number(this.apartmentForm.bedrooms.value),
      bathrooms: Number(this.apartmentForm.bathrooms.value),
      area: this.apartmentForm.area.value ? Number(this.apartmentForm.area.value) : 0,
      furnished: this.apartmentForm.furnished.value as 'FURNISHED' | 'UNFURNISHED' | 'SEMI_FURNISHED',
      vegetarian: this.apartmentForm.vegetarian.value as 'ALLOWED' | 'NOT_ALLOWED',
      amenities: this.amenities,
      availability: this.apartmentForm.availability.value || 'AVAILABLE',
    };

    const images = this.selectedFiles.map((f) => f.file);

    this.apartmentService.createApartment(formValues, images).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showConfirm = false;
        this.toast.success('Apartment listing published successfully!');
        this.initializeForm();
        this.submitted = false;
        this.selectedFiles = [];
        this.previewImages = [];
        this.amenities = [];
        this.isPreviewMode = false;
        this.cdr.detectChanges();

        this.router.navigate(['/apartments']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = this.extractError(err);
        this.toast.error(msg);
        this.errorMessage = msg;
        this.showError = true;
        this.cdr.detectChanges();
      },
    });
  }

  private computeIsValid(): boolean {
    return !!(
      this.apartmentForm.title?.valid &&
      this.apartmentForm.address?.valid &&
      this.apartmentForm.city?.valid &&
      this.apartmentForm.monthlyRent?.valid &&
      this.apartmentForm.bedrooms?.valid &&
      this.apartmentForm.bathrooms?.valid &&
      this.apartmentForm.furnished?.valid &&
      this.apartmentForm.vegetarian?.valid
    );
  }

  clearMessage(): void {
    this.showError = false;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  private extractError(err: any): string {
    if (typeof err === 'string') return err;
    return (
      err?.error?.message ||
      err?.message ||
      'Failed to create apartment. Please try again.'
    );
  }

  onSubmit(): void {
    this.finalSubmit();
  }

  goBack(): void {
    this.router.navigate(['/apartments']);
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
