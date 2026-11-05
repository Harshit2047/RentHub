import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApartmentService, ApartmentFormValues } from '../core/apartment.service';
import { Apartment, ApartmentImage } from '../models/apartment.model';
import { ToastService } from '../shared/toast.service';
import { Subject, takeUntil } from 'rxjs';

interface PopularAmenity {
  name: string;
  category: string;
}

@Component({
  selector: 'app-edit-apartment',
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
            <span>Back to Property</span>
          </button>

          <!-- Mode Toggle Tabs (Form vs Preview) -->
          <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-sm">
            <button
              type="button"
              (click)="editMode()"
              class="px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
              [class.bg-indigo-600]="!isPreviewMode"
              [class.text-white]="!isPreviewMode"
              [class.text-slate-600]="isPreviewMode"
              [class.hover:text-slate-900]="isPreviewMode"
            >
              1. Edit Details Form
            </button>
            <button
              type="button"
              (click)="showPreview()"
              class="px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              [class.bg-indigo-600]="isPreviewMode"
              [class.text-white]="isPreviewMode"
              [class.text-slate-600]="!isPreviewMode"
              [class.hover:text-slate-900]="!isPreviewMode"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>2. Live Preview</span>
            </button>
          </div>
        </div>

        <!-- Page Title & Subtitle Banner -->
        <div class="mb-8">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Landlord Property Portal • Edit Mode</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ isPreviewMode ? 'Listing Preview' : 'Edit Apartment Listing' }}
          </h1>
          <p class="text-slate-600 text-sm sm:text-base mt-1">
            {{ isPreviewMode
              ? 'Preview how prospective tenants will see your updated property details.'
              : 'Modify property pricing, features, specifications, and manage photos for this listing.' }}
          </p>
        </div>

        <!-- Loading Skeleton -->
        <div *ngIf="isLoadingData" class="space-y-6">
          <div class="h-12 w-1/3 bg-slate-200 rounded-xl animate-pulse"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
              <div class="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
            </div>
            <div class="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- VIEW 1: EDIT FORM MODE -->
        <!-- ========================================================= -->
        <div *ngIf="!isLoadingData && !isPreviewMode" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

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
                    <h2 class="card-title">Pricing & Availability</h2>
                    <p class="card-subtitle">Specify monthly rent, security deposit and unit status</p>
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
                    <label class="field-label">Availability Status</label>
                    <div class="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        (click)="setAvailability('AVAILABLE')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('availability')?.value === 'AVAILABLE'"
                      >
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span class="font-medium text-sm">Available</span>
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

                <div class="space-y-4">
                  <!-- Rooms Row -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <!-- Bedrooms -->
                    <div>
                      <label for="bedrooms" class="field-label">
                        Bedrooms <span class="text-rose-500">*</span>
                      </label>
                      <input
                        id="bedrooms"
                        type="number"
                        formControlName="bedrooms"
                        class="field-input"
                        [class.field-input-error]="f.bedrooms?.invalid && (submitted || f.bedrooms?.touched)"
                        placeholder="e.g. 2"
                        min="1"
                        max="20"
                      />
                      <div *ngIf="f.bedrooms?.invalid && (submitted || f.bedrooms?.touched)" class="field-error">
                        <span *ngIf="f.bedrooms?.errors?.['required']">Bedrooms count is required</span>
                        <span *ngIf="f.bedrooms?.errors?.['min']">Minimum 1 bedroom</span>
                      </div>
                    </div>

                    <!-- Bathrooms -->
                    <div>
                      <label for="bathrooms" class="field-label">
                        Bathrooms <span class="text-rose-500">*</span>
                      </label>
                      <input
                        id="bathrooms"
                        type="number"
                        formControlName="bathrooms"
                        class="field-input"
                        [class.field-input-error]="f.bathrooms?.invalid && (submitted || f.bathrooms?.touched)"
                        placeholder="e.g. 2"
                        min="1"
                        max="20"
                      />
                      <div *ngIf="f.bathrooms?.invalid && (submitted || f.bathrooms?.touched)" class="field-error">
                        <span *ngIf="f.bathrooms?.errors?.['required']">Bathrooms count is required</span>
                        <span *ngIf="f.bathrooms?.errors?.['min']">Minimum 1 bathroom</span>
                      </div>
                    </div>

                    <!-- Area -->
                    <div>
                      <label for="area" class="field-label">Area (sq ft)</label>
                      <input
                        id="area"
                        type="number"
                        formControlName="area"
                        class="field-input"
                        placeholder="e.g. 1150"
                        min="50"
                      />
                    </div>
                  </div>

                  <!-- Furnishing Status -->
                  <div>
                    <label class="field-label">Furnishing Status <span class="text-rose-500">*</span></label>
                    <div class="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        (click)="setFurnished('FURNISHED')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('furnished')?.value === 'FURNISHED'"
                      >
                        <span class="font-medium text-sm">Furnished</span>
                      </button>
                      <button
                        type="button"
                        (click)="setFurnished('SEMI_FURNISHED')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('furnished')?.value === 'SEMI_FURNISHED'"
                      >
                        <span class="font-medium text-sm">Semi-Furnished</span>
                      </button>
                      <button
                        type="button"
                        (click)="setFurnished('UNFURNISHED')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('furnished')?.value === 'UNFURNISHED'"
                      >
                        <span class="font-medium text-sm">Unfurnished</span>
                      </button>
                    </div>
                  </div>

                  <!-- Dietary / Food Rule -->
                  <div>
                    <label class="field-label">Food & Dietary Rule <span class="text-rose-500">*</span></label>
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        (click)="setVegetarian('NOT_ALLOWED')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('vegetarian')?.value === 'NOT_ALLOWED'"
                      >
                        <span class="font-medium text-sm">All Cuisines Allowed</span>
                      </button>
                      <button
                        type="button"
                        (click)="setVegetarian('ALLOWED')"
                        class="radio-pill-card"
                        [class.active]="apartmentForm.get('vegetarian')?.value === 'ALLOWED'"
                      >
                        <span class="font-medium text-sm">Vegetarian Only</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 4: Location Details -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-amber-50 text-amber-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="card-title">Location & Address</h2>
                    <p class="card-subtitle">Exact address and geographic location of the listing</p>
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
                      placeholder="e.g. Flat 402, Royal Residency, Civil Lines"
                    />
                    <div *ngIf="f.address?.invalid && (submitted || f.address?.touched)" class="field-error">
                      <span *ngIf="f.address?.errors?.['required']">Street address is required</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <!-- City -->
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
                        placeholder="e.g. Jabalpur"
                      />
                      <div *ngIf="f.city?.invalid && (submitted || f.city?.touched)" class="field-error">
                        <span *ngIf="f.city?.errors?.['required']">City is required</span>
                      </div>
                    </div>

                    <!-- State -->
                    <div>
                      <label for="state" class="field-label">State</label>
                      <input
                        id="state"
                        type="text"
                        formControlName="state"
                        class="field-input"
                        placeholder="e.g. Madhya Pradesh"
                      />
                    </div>

                    <!-- Pincode -->
                    <div>
                      <label for="pincode" class="field-label">PIN Code</label>
                      <input
                        id="pincode"
                        type="text"
                        formControlName="pincode"
                        class="field-input"
                        placeholder="e.g. 482001"
                      />
                    </div>
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
                      {{ amenities.length }} selected
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
                      class="amenity-chip-btn cursor-pointer"
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
                      class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
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
                        class="hover:text-rose-600 ml-0.5 leading-none cursor-pointer"
                        aria-label="Remove amenity"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Section 6: Photo Gallery Management -->
              <div class="form-card">
                <div class="card-header">
                  <div class="card-icon bg-rose-50 text-rose-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div class="flex-1 flex items-center justify-between">
                    <div>
                      <h2 class="card-title">Property Photos Management</h2>
                      <p class="card-subtitle">Manage existing photos or upload new high-resolution images</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {{ (apartment?.images?.length || 0) + selectedFiles.length }} photos
                    </span>
                  </div>
                </div>

                <!-- Existing Photos (Currently in Database) -->
                <div *ngIf="apartment?.images && apartment.images.length > 0" class="mb-5">
                  <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5">
                    Existing Photos ({{ apartment.images.length }})
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      *ngFor="let img of apartment.images; let i = index"
                      class="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 shadow-sm"
                    >
                      <img [src]="img.url" [alt]="'Property photo ' + (i+1)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      <!-- Cover Photo Badge on first item -->
                      <span *ngIf="i === 0" class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                        Cover
                      </span>

                      <!-- Delete Existing Photo Button -->
                      <button
                        type="button"
                        (click)="deleteExistingImage(img.id, i)"
                        [disabled]="isDeletingImage === img.id"
                        class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow cursor-pointer disabled:opacity-50"
                        title="Delete this photo"
                      >
                        <svg *ngIf="isDeletingImage !== img.id" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <svg *ngIf="isDeletingImage === img.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Drag & Drop Zone for New Photos -->
                <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Upload New Photos</div>
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
                    Click to browse or drag & drop new photos here
                  </div>
                  <p class="text-xs text-slate-400">
                    Supported formats: JPEG, PNG, WebP (up to 5MB each).
                  </p>
                </div>

                <!-- Newly Selected Photos Preview Grid -->
                <div *ngIf="selectedFiles.length > 0" class="mt-4">
                  <div class="text-xs text-slate-500 font-medium mb-2">New photos to upload on save:</div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      *ngFor="let item of selectedFiles; let i = index"
                      class="relative aspect-[4/3] rounded-xl overflow-hidden border border-emerald-300 group bg-slate-900 shadow-sm"
                    >
                      <img [src]="item.preview" [alt]="'New Photo ' + (i+1)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      <span class="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                        New
                      </span>

                      <!-- Remove Button -->
                      <button
                        type="button"
                        (click)="removePreview(i, $event)"
                        class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow cursor-pointer"
                        title="Cancel upload"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </form>

          </div>

          <!-- Right Column: Sticky Live Preview Card & Actions -->
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
                    *ngIf="currentPreviewImage"
                    [src]="currentPreviewImage"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <div *ngIf="!currentPreviewImage" class="flex flex-col items-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span class="text-xs mt-1">Photo Preview</span>
                  </div>

                  <span
                    class="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm"
                    [class.bg-emerald-600]="apartmentForm.get('availability')?.value === 'AVAILABLE'"
                    [class.bg-amber-600]="apartmentForm.get('availability')?.value === 'PENDING'"
                    [class.bg-rose-600]="apartmentForm.get('availability')?.value === 'RENTED'"
                  >
                    {{ formatAvailability(apartmentForm.get('availability')?.value) }}
                  </span>
                </div>

                <div class="p-3.5 space-y-1.5">
                  <div class="text-base font-bold text-slate-900 truncate">
                    {{ apartmentForm.get('title')?.value || 'Apartment Title' }}
                  </div>
                  <div class="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{{ apartmentForm.get('city')?.value || 'City' }}{{ apartmentForm.get('state')?.value ? ', ' + apartmentForm.get('state')?.value : '' }}</span>
                  </div>
                  <div class="flex items-baseline gap-1 pt-1">
                    <span class="text-lg font-extrabold text-indigo-600">{{ formatRent(apartmentForm.get('monthlyRent')?.value) }}</span>
                    <span class="text-xs text-slate-400">/ month</span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{{ apartmentForm.get('bedrooms')?.value || 1 }} Beds</span>
                    <span>•</span>
                    <span>{{ apartmentForm.get('bathrooms')?.value || 1 }} Baths</span>
                    <span>•</span>
                    <span>{{ formatFurnished(apartmentForm.get('furnished')?.value) }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons Inside Sticky Box -->
              <div class="mt-5 space-y-2.5">
                <button
                  type="button"
                  (click)="onSubmit()"
                  [disabled]="isSubmitting"
                  class="w-full btn-primary py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <svg *ngIf="!isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg *ngIf="isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                  </svg>
                  <span>{{ isSubmitting ? 'Saving Changes...' : 'Save & Update Listing' }}</span>
                </button>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="goBack()"
                    class="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>

                  <a
                    [href]="'/apartments/' + apartmentId"
                    target="_blank"
                    class="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-indigo-600 font-semibold text-xs transition-colors flex items-center gap-1"
                    title="Open live listing in new tab"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span>View Live</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Host Card Notice -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Listing Management</div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Changes made to monthly rent, availability, or amenities are immediately reflected across search filters and tenant dashboards.
              </p>
            </div>

          </div>

        </div>

        <!-- ========================================================= -->
        <!-- VIEW 2: LIVE PREVIEW MODE -->
        <!-- ========================================================= -->
        <div *ngIf="!isLoadingData && isPreviewMode" class="space-y-6">
          <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-sm">Tenant Preview Mode</h3>
                <p class="text-xs text-slate-600">This is exactly how prospective renters will view this apartment listing.</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="editMode()"
                class="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back to Edit Form
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="isSubmitting"
                class="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : 'Save & Publish Updates' }}
              </button>
            </div>
          </div>

          <!-- Mockup of Apartment Details Page -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <!-- Top gallery mockup -->
            <div class="aspect-[21/9] max-h-[440px] rounded-2xl overflow-hidden bg-slate-900 mb-6 relative">
              <img
                *ngIf="currentPreviewImage"
                [src]="currentPreviewImage"
                alt="Main view"
                class="w-full h-full object-cover"
              />
              <div *ngIf="!currentPreviewImage" class="flex flex-col items-center justify-center h-full text-slate-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span class="mt-2 text-sm font-medium">No photo uploaded</span>
              </div>
              <div class="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold">
                {{ (apartment?.images?.length || 0) + selectedFiles.length }} Total Photos
              </div>
            </div>

            <!-- Details Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-6">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      [class.bg-emerald-100]="apartmentForm.get('availability')?.value === 'AVAILABLE'"
                      [class.text-emerald-800]="apartmentForm.get('availability')?.value === 'AVAILABLE'"
                      [class.bg-rose-100]="apartmentForm.get('availability')?.value !== 'AVAILABLE'"
                      [class.text-rose-800]="apartmentForm.get('availability')?.value !== 'AVAILABLE'"
                    >
                      ● {{ formatAvailability(apartmentForm.get('availability')?.value) }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {{ formatFurnished(apartmentForm.get('furnished')?.value) }}
                    </span>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {{ apartmentForm.get('title')?.value || 'Untitled Apartment' }}
                  </h1>
                  <p class="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{{ apartmentForm.get('address')?.value }}, {{ apartmentForm.get('city')?.value }} {{ apartmentForm.get('state')?.value }}</span>
                  </p>
                </div>

                <!-- Spec Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <div class="text-[11px] text-slate-400 uppercase font-semibold">Bedrooms</div>
                    <div class="text-base font-bold text-slate-900 mt-0.5">{{ apartmentForm.get('bedrooms')?.value || 1 }} BHK</div>
                  </div>
                  <div>
                    <div class="text-[11px] text-slate-400 uppercase font-semibold">Bathrooms</div>
                    <div class="text-base font-bold text-slate-900 mt-0.5">{{ apartmentForm.get('bathrooms')?.value || 1 }} Bath</div>
                  </div>
                  <div>
                    <div class="text-[11px] text-slate-400 uppercase font-semibold">Area</div>
                    <div class="text-base font-bold text-slate-900 mt-0.5">{{ apartmentForm.get('area')?.value || '—' }} sq ft</div>
                  </div>
                  <div>
                    <div class="text-[11px] text-slate-400 uppercase font-semibold">Food Preference</div>
                    <div class="text-base font-bold text-slate-900 mt-0.5">{{ apartmentForm.get('vegetarian')?.value === 'ALLOWED' ? 'Veg Only' : 'All Allowed' }}</div>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <h3 class="text-base font-bold text-slate-900 mb-2">About this Apartment</h3>
                  <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ apartmentForm.get('description')?.value || 'No description provided.' }}
                  </p>
                </div>

                <!-- Amenities -->
                <div *ngIf="amenities.length > 0">
                  <h3 class="text-base font-bold text-slate-900 mb-2.5">Amenities & Features</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      *ngFor="let am of amenities"
                      class="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      ✓ {{ am }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right preview pricing column -->
              <div class="lg:col-span-1">
                <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                  <div>
                    <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Monthly Rent</div>
                    <div class="text-3xl font-extrabold text-slate-900">
                      {{ formatRent(apartmentForm.get('monthlyRent')?.value) }}
                      <span class="text-xs text-slate-500 font-normal">/ month</span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                      Deposit: <strong>{{ formatRent(apartmentForm.get('securityDeposit')?.value) }}</strong>
                    </div>
                  </div>
                  <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                    Direct inquiries & bookings from tenants will be received on your Landlord Dashboard.
                  </div>
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Save changes to listing?</h3>
              <p class="text-xs text-slate-500">Updates will be published immediately to all prospective tenants.</p>
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
              <span>Availability:</span>
              <strong class="text-slate-900">{{ formatAvailability(apartmentForm.get('availability')?.value) }}</strong>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Photos:</span>
              <strong class="text-slate-900">{{ (apartment?.images?.length || 0) + selectedFiles.length }} Total</strong>
            </div>
          </div>

          <div class="flex justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              (click)="cancelSubmit()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary px-5 py-2 rounded-xl text-sm font-bold shadow-sm cursor-pointer"
              (click)="performSubmit()"
            >
              Save Changes
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
      cursor: pointer;
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
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.75rem;
      background-color: #ffffff;
      color: #0f172a;
      transition: all 0.15s ease;
      outline: none;
    }
    .field-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    .field-input-error {
      border-color: #ef4444;
      background-color: #fffafb;
    }

    .field-error {
      margin-top: 0.3rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #ef4444;
    }

    .radio-pill-card {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.75rem;
      border: 1.5px solid #e2e8f0;
      background-color: #ffffff;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
      user-select: none;
    }
    .radio-pill-card:hover {
      border-color: #cbd5e1;
      background-color: #f8fafc;
    }
    .radio-pill-card.active {
      border-color: #4f46e5;
      background-color: #eef2ff;
      color: #4338ca;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(79, 70, 229, 0.1);
    }

    .amenity-chip-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .amenity-chip-btn:hover {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .amenity-chip-btn.active {
      background-color: #eef2ff;
      border-color: #818cf8;
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
    .dropzone-box:hover,
    .dropzone-box-active {
      border-color: #4f46e5;
      background-color: #eef2ff;
    }
  `]
})
export class EditApartmentComponent implements OnInit, OnDestroy {
  apartmentId!: string;
  apartmentForm!: FormGroup;
  apartment: Apartment = {
    id: '',
    title: '',
    description: null,
    address: '',
    city: '',
    state: null,
    pincode: null,
    monthlyRent: 0,
    securityDeposit: null,
    bedrooms: 1,
    bathrooms: 1,
    area: null,
    furnished: 'UNFURNISHED',
    vegetarian: 'ALLOWED',
    availability: 'AVAILABLE',
    images: [],
    landlord: { id: '', fullName: '', companyName: null },
    createdAt: '',
    updatedAt: '',
  };

  isLoadingData = true;
  isSubmitting = false;
  submitted = false;
  isPreviewMode = false;
  showConfirm = false;
  isDragging = false;
  isDeletingImage: string | null = null;

  customAmenityInput = '';
  amenities: string[] = [];
  selectedFiles: Array<{ file: File; preview: string }> = [];

  readonly popularAmenities: PopularAmenity[] = [
    { name: 'WiFi', category: 'Connectivity' },
    { name: 'Air Conditioning', category: 'Climate' },
    { name: 'Power Backup', category: 'Utilities' },
    { name: 'Gym', category: 'Fitness' },
    { name: 'Elevator', category: 'Building' },
    { name: 'Covered Parking', category: 'Vehicles' },
    { name: 'Swimming Pool', category: 'Leisure' },
    { name: '24/7 Security', category: 'Safety' },
    { name: 'Modular Kitchen', category: 'Interior' },
    { name: 'Balcony', category: 'View' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apartmentService: ApartmentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  get f(): any {
    return { ...this.apartmentForm?.controls, submitted: this.submitted };
  }

  get currentPreviewImage(): string | null {
    if (this.selectedFiles.length > 0) {
      return this.selectedFiles[0].preview;
    }
    if (this.apartment?.images && this.apartment.images.length > 0) {
      return this.apartment.images[0].url;
    }
    return null;
  }

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apartmentId = id;
      this.loadApartmentData();
    } else {
      this.toast.error('No apartment ID provided.');
      this.router.navigate(['/dashboard']);
    }
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
      bedrooms: [1, [Validators.required, Validators.min(1)]],
      bathrooms: [1, [Validators.required, Validators.min(1)]],
      area: [null, [Validators.min(0)]],
      furnished: ['UNFURNISHED', [Validators.required]],
      vegetarian: ['NOT_ALLOWED', [Validators.required]],
      availability: ['AVAILABLE', [Validators.required]],
    });
  }

  loadApartmentData(): void {
    this.isLoadingData = true;
    this.cdr.detectChanges();

    this.apartmentService.getApartmentById(this.apartmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apt) => {
          if (!apt) {
            this.toast.error('Apartment listing not found.');
            this.router.navigate(['/dashboard']);
            return;
          }

          this.apartment = apt;
          this.apartmentForm.patchValue({
            title: apt.title,
            description: apt.description ?? '',
            address: apt.address,
            city: apt.city,
            state: apt.state ?? '',
            pincode: apt.pincode ?? '',
            monthlyRent: apt.monthlyRent,
            securityDeposit: apt.securityDeposit ?? 0,
            bedrooms: apt.bedrooms,
            bathrooms: apt.bathrooms,
            area: apt.area ?? null,
            furnished: apt.furnished || 'UNFURNISHED',
            vegetarian: apt.vegetarian || 'NOT_ALLOWED',
            availability: apt.availability || 'AVAILABLE',
          });

          // Populate amenities if available
          if (Array.isArray(apt.amenities)) {
            this.amenities = apt.amenities
              .map((a: any) => a?.amenity?.name || a?.name || a)
              .filter(Boolean);
          }

          this.isLoadingData = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoadingData = false;
          this.toast.error('Failed to load apartment details.');
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  setAvailability(status: 'AVAILABLE' | 'PENDING' | 'RENTED'): void {
    this.apartmentForm.patchValue({ availability: status });
    this.cdr.detectChanges();
  }

  setFurnished(status: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'): void {
    this.apartmentForm.patchValue({ furnished: status });
    this.cdr.detectChanges();
  }

  setVegetarian(status: 'ALLOWED' | 'NOT_ALLOWED'): void {
    this.apartmentForm.patchValue({ vegetarian: status });
    this.cdr.detectChanges();
  }

  toggleAmenity(name: string): void {
    const idx = this.amenities.indexOf(name);
    if (idx >= 0) {
      this.amenities.splice(idx, 1);
    } else {
      this.amenities.push(name);
    }
    this.cdr.detectChanges();
  }

  addCustomAmenity(): void {
    const val = this.customAmenityInput.trim();
    if (val && !this.amenities.includes(val)) {
      this.amenities.push(val);
      this.customAmenityInput = '';
      this.cdr.detectChanges();
    }
  }

  removeAmenity(name: string): void {
    this.amenities = this.amenities.filter(a => a !== name);
    this.cdr.detectChanges();
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer?.files) {
      this.processFiles(e.dataTransfer.files);
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      this.processFiles(files);
    }
    event.target.value = '';
  }

  private processFiles(files: FileList): void {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validTypes.includes(file.type)) {
        this.toast.error(`"${file.name}" is an invalid format. Use JPEG, PNG, or WebP.`);
        continue;
      }
      if (file.size > maxSize) {
        this.toast.error(`"${file.name}" exceeds 5MB size limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file,
          preview: e.target.result
        });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removePreview(index: number, event: Event): void {
    event.stopPropagation();
    this.selectedFiles.splice(index, 1);
    this.cdr.detectChanges();
  }

  deleteExistingImage(imageId: string, index: number): void {
    this.isDeletingImage = imageId;
    this.cdr.detectChanges();

    this.apartmentService.deleteApartmentImage(this.apartmentId, index).subscribe({
      next: () => {
        this.isDeletingImage = null;
        this.apartment.images = this.apartment.images.filter((_, idx) => idx !== index);
        this.toast.success('Photo removed from listing.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDeletingImage = null;
        this.toast.error('Failed to remove photo.');
        this.cdr.detectChanges();
      }
    });
  }

  editMode(): void {
    this.isPreviewMode = false;
    this.cdr.detectChanges();
  }

  showPreview(): void {
    this.isPreviewMode = true;
    this.cdr.detectChanges();
  }

  goBack(): void {
    if (this.apartmentId) {
      this.router.navigate(['/apartments', this.apartmentId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.apartmentForm.invalid) {
      this.toast.error('Please fill in all required fields marked with an asterisk (*).');
      return;
    }
    this.showConfirm = true;
    this.cdr.detectChanges();
  }

  cancelSubmit(): void {
    this.showConfirm = false;
    this.cdr.detectChanges();
  }

  performSubmit(): void {
    this.showConfirm = false;
    this.isSubmitting = true;
    this.cdr.detectChanges();

    const v = this.apartmentForm.value;
    const formValues: ApartmentFormValues = {
      title: v.title.trim(),
      description: v.description ? v.description.trim() : '',
      address: v.address.trim(),
      city: v.city.trim(),
      state: v.state ? v.state.trim() : '',
      pincode: v.pincode ? v.pincode.trim() : '',
      monthlyRent: Number(v.monthlyRent),
      securityDeposit: v.securityDeposit ? Number(v.securityDeposit) : 0,
      bedrooms: Number(v.bedrooms),
      bathrooms: Number(v.bathrooms),
      area: v.area ? Number(v.area) : 0,
      furnished: v.furnished,
      vegetarian: v.vegetarian,
      availability: v.availability,
      amenities: this.amenities,
    };

    const newImageFiles = this.selectedFiles.map(f => f.file);

    this.apartmentService.updateApartment(this.apartmentId, formValues, newImageFiles).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        this.toast.success('Apartment listing updated successfully!');
        this.router.navigate(['/apartments', this.apartmentId]);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || err?.message || 'Failed to update apartment. Please check your inputs.';
        this.toast.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  formatRent(amount: any): string {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amount));
  }

  formatAvailability(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'Available Now';
      case 'PENDING': return 'Pending';
      case 'RENTED': return 'Rented';
      default: return 'Available';
    }
  }

  formatFurnished(status: string): string {
    switch (status) {
      case 'FURNISHED': return 'Furnished';
      case 'SEMI_FURNISHED': return 'Semi-Furnished';
      case 'UNFURNISHED': return 'Unfurnished';
      default: return 'Unfurnished';
    }
  }
}
