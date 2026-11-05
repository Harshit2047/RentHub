import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';
import { Router, provideRouter } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: { isAuthenticated: ReturnType<typeof vi.fn>; hasRole: ReturnType<typeof vi.fn> };
  let mockToastService: { warning: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      hasRole: vi.fn(),
    };
    mockToastService = {
      warning: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        provideRouter([
          { path: 'login', component: class DummyComponent {} },
          { path: 'home', component: class DummyHomeComponent {} },
        ]),
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
      expect(mockToastService.info).toHaveBeenCalledWith('Please log in to continue.');
    });

    it('should return false and navigate to home when user has wrong role', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.hasRole.mockReturnValue(false);
      const route = { data: { role: 'LANDLORD' } } as any;

      const canActivate = guard.canActivate(route);

      expect(canActivate).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(mockToastService.warning).toHaveBeenCalledWith('Access denied: Landlord privileges are required to access this page.');
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
