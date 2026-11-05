import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Role-based guard: send users who lack the required role to their dashboard
    // instead of back to the login page (they are already authenticated).
    if (expectedRole && !this.authService.hasRole(expectedRole)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
