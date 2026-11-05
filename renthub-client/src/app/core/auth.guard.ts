import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];

    if (!this.authService.isAuthenticated()) {
      this.toast.info('Please log in to continue.');
      this.router.navigate(['/login']);
      return false;
    }

    // Role-based guard: only users with the required role may enter
    if (expectedRole && !this.authService.hasRole(expectedRole)) {
      this.toast.warning('Access denied: Landlord privileges are required to access this page.');
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
