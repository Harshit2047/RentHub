import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterState {
  search: string;
  city: string;
  bedrooms: string;
  furnished: string;
  availability: string;
  budgetRange: string;
  sortBy: string;
}

@Component({
  selector: 'app-apartment-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8">

      <!-- Top Search & Quick City Row -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <!-- Search Keyword Input -->
        <div class="sm:col-span-7 relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="state.search"
            (ngModelChange)="onFilterChanged()"
            placeholder="Search by apartment title, locality, address..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
          <button
            *ngIf="state.search"
            type="button"
            (click)="state.search = ''; onFilterChanged()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            title="Clear search"
          >
            ✕
          </button>
        </div>

        <!-- City Filter -->
        <div class="sm:col-span-5 relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="state.city"
            (ngModelChange)="onFilterChanged()"
            placeholder="Filter by City (e.g. Jabalpur, Mumbai...)"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
          <button
            *ngIf="state.city"
            type="button"
            (click)="state.city = ''; onFilterChanged()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            title="Clear city"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Secondary Filter Dropdowns Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-3 pt-3 border-t border-slate-100 text-xs">

        <!-- Bedrooms (BHK) -->
        <div>
          <label class="block font-semibold text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Bedrooms</label>
          <select
            [(ngModel)]="state.bedrooms"
            (ngModelChange)="onFilterChanged()"
            class="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <!-- Budget / Price Range -->
        <div>
          <label class="block font-semibold text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Budget Range</label>
          <select
            [(ngModel)]="state.budgetRange"
            (ngModelChange)="onFilterChanged()"
            class="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="">Any Budget</option>
            <option value="under-15k">Under ₹15,000</option>
            <option value="15k-30k">₹15,000 - ₹30,000</option>
            <option value="30k-50k">₹30,000 - ₹50,000</option>
            <option value="above-50k">Above ₹50,000</option>
          </select>
        </div>

        <!-- Furnishing Status -->
        <div>
          <label class="block font-semibold text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Furnishing</label>
          <select
            [(ngModel)]="state.furnished"
            (ngModelChange)="onFilterChanged()"
            class="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="">All Furnishing</option>
            <option value="FURNISHED">Furnished</option>
            <option value="SEMI_FURNISHED">Semi-Furnished</option>
            <option value="UNFURNISHED">Unfurnished</option>
          </select>
        </div>

        <!-- Availability Status -->
        <div>
          <label class="block font-semibold text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Availability</label>
          <select
            [(ngModel)]="state.availability"
            (ngModelChange)="onFilterChanged()"
            class="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="">All Units</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="RENTED">Rented</option>
          </select>
        </div>

        <!-- Sort By -->
        <div class="col-span-2 sm:col-span-1">
          <label class="block font-semibold text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Sort By</label>
          <select
            [(ngModel)]="state.sortBy"
            (ngModelChange)="onFilterChanged()"
            class="w-full py-2 px-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Rent: Low to High</option>
            <option value="price-desc">Rent: High to Low</option>
          </select>
        </div>

      </div>

      <!-- Active Filters Summary & Clear Controls -->
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 flex-wrap gap-2 text-xs" *ngIf="hasActiveFilters">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-slate-400 font-semibold mr-1">Active Filters:</span>

          <span *ngIf="state.search" class="filter-pill">
            Keyword: "{{ state.search }}"
            <button type="button" (click)="state.search = ''; onFilterChanged()">×</button>
          </span>

          <span *ngIf="state.city" class="filter-pill">
            City: {{ state.city }}
            <button type="button" (click)="state.city = ''; onFilterChanged()">×</button>
          </span>

          <span *ngIf="state.bedrooms" class="filter-pill">
            {{ state.bedrooms }} BHK
            <button type="button" (click)="state.bedrooms = ''; onFilterChanged()">×</button>
          </span>

          <span *ngIf="state.budgetRange" class="filter-pill">
            Budget: {{ formatBudgetLabel(state.budgetRange) }}
            <button type="button" (click)="state.budgetRange = ''; onFilterChanged()">×</button>
          </span>

          <span *ngIf="state.furnished" class="filter-pill">
            {{ formatFurnishedLabel(state.furnished) }}
            <button type="button" (click)="state.furnished = ''; onFilterChanged()">×</button>
          </span>

          <span *ngIf="state.availability" class="filter-pill">
            {{ state.availability === 'AVAILABLE' ? 'Available' : 'Rented' }}
            <button type="button" (click)="state.availability = ''; onFilterChanged()">×</button>
          </span>
        </div>

        <button
          type="button"
          (click)="onResetFilters()"
          class="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors ml-auto cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>

    </div>
  `,
  styles: [`
    .filter-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      background-color: #eef2ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .filter-pill button {
      font-size: 0.85rem;
      line-height: 1;
      font-weight: 700;
      color: #4338ca;
      cursor: pointer;
    }
    .filter-pill button:hover {
      color: #dc2626;
    }
  `]
})
export class ApartmentFiltersComponent implements OnInit, OnChanges {
  @Input() initialValues?: Partial<FilterState>;
  @Output() filterChange = new EventEmitter<FilterState>();

  state: FilterState = {
    search: '',
    city: '',
    bedrooms: '',
    furnished: '',
    availability: '',
    budgetRange: '',
    sortBy: 'newest'
  };

  ngOnInit(): void {
    if (this.initialValues) {
      this.state = { ...this.state, ...this.initialValues };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues'] && this.initialValues) {
      this.state = { ...this.state, ...this.initialValues };
    }
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.state.search ||
      this.state.city ||
      this.state.bedrooms ||
      this.state.furnished ||
      this.state.availability ||
      this.state.budgetRange ||
      this.state.sortBy !== 'newest'
    );
  }

  onFilterChanged(): void {
    this.filterChange.emit({ ...this.state });
  }

  onResetFilters(): void {
    this.state = {
      search: '',
      city: '',
      bedrooms: '',
      furnished: '',
      availability: '',
      budgetRange: '',
      sortBy: 'newest'
    };
    this.filterChange.emit({ ...this.state });
  }

  formatBudgetLabel(range: string): string {
    switch (range) {
      case 'under-15k': return '< ₹15K';
      case '15k-30k': return '₹15K - ₹30K';
      case '30k-50k': return '₹30K - ₹50K';
      case 'above-50k': return '> ₹50K';
      default: return range;
    }
  }

  formatFurnishedLabel(status: string): string {
    switch (status) {
      case 'FURNISHED': return 'Furnished';
      case 'SEMI_FURNISHED': return 'Semi-Furnished';
      case 'UNFURNISHED': return 'Unfurnished';
      default: return status;
    }
  }
}

