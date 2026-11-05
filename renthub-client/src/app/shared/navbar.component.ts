import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FavouriteService } from '../core/favourite.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
<nav class="navbar">
  <div class="navbar-container">

    <!-- Logo -->
    <a routerLink="/home" class="navbar-logo">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      RentHub
    </a>

    <!-- Nav links -->
    <ul class="navbar-links">
      <li>
        <a routerLink="/home" routerLinkActive="active" class="nav-link">Home</a>
      </li>
      <li>
        <a routerLink="/apartments" routerLinkActive="active" class="nav-link">Apartments</a>
      </li>
      <li *ngIf="currentUser">
        <a routerLink="/favourites" routerLinkActive="active" class="nav-link">Favourites</a>
      </li>
      <li *ngIf="currentUser?.role === 'LANDLORD'">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
      </li>
      <li *ngIf="currentUser?.role === 'LANDLORD'">
        <a routerLink="/create" routerLinkActive="active" class="nav-link">+ Create</a>
      </li>
    </ul>

    <!-- Actions -->
    <div class="navbar-actions">
      <ng-container *ngIf="currentUser; else guestMenu">
        <span class="text-sm text-text-secondary hidden md:block">{{ currentUser.fullName }}</span>
        <button
          class="btn-ghost rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-primary/10 transition-colors"
          (click)="logout()"
        >
          Logout
        </button>
      </ng-container>

      <ng-template #guestMenu>
        <a routerLink="/login"
           class="btn-ghost rounded-md px-4 py-2 text-sm text-text-secondary hover:bg-primary/10 transition-colors">
          Login
        </a>
        <a routerLink="/register"
           class="btn-primary rounded-md px-4 py-2 text-sm font-medium transition-colors">
          Register
        </a>
      </ng-template>
    </div>
  </div>
</nav>
`,
  styles: [],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private favService: FavouriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        // Seed favourites BehaviorSubject whenever a user session is active
        if (user) {
          this.favService.loadFavourites().subscribe();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }
}