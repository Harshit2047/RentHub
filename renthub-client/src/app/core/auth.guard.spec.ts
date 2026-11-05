import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Router, provideRouter } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: { isAuthenticated: ReturnType<typeof vi.fn>; hasRole: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      hasRole: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([{ path: 'login', component: class DummyComponent {} }]),
      ],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  describe('canActivate', () => {
    it('should return false and navigate to login when user is not authenticated', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      const route = { data: { role: 'TENANT' } } as any;

      const canActivate = guard.canActivate(route);

      expect(canActivate).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should return false and navigate when user has wrong role', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.hasRole.mockReturnValue(false);
      const route = { data: { role: 'LANDLORD' } } as any;

      const canActivate = guard.canActivate(route);

      expect(canActivate).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should return true when user has correct role', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.hasRole.mockReturnValue(true);
      const route = { data: { role: 'LANDLORD' } } as any;

      const canActivate = guard.canActivate(route);

      expect(canActivate).toBe(true);
    });

    it('should return true when no role is specified and user is authenticated', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      const route = { data: {} } as any;

      const canActivate = guard.canActivate(route);

      expect(canActivate).toBe(true);
    });
  });
});
