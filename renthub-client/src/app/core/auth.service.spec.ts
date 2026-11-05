import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class DummyComponent {} }]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and update auth state', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        role: 'TENANT',
        createdAt: '',
        updatedAt: '',
      };

      service.login(credentials).subscribe({
        next: (user) => {
          expect(user.email).toBe('test@example.com');
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'mock-jwt-token', user: mockUser });

      expect(service.isAuthenticated()).toBe(true);
      expect(service.hasRole('TENANT')).toBe(true);
    });

    it('should handle login error', () => {
      const credentials = { email: 'invalid@example.com', password: 'wrong' };

      service.login(credentials).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('register', () => {
    it('should register successfully and update auth state', () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'TENANT' as const,
      };

      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'TENANT',
        createdAt: '',
        updatedAt: '',
      };

      service.register(userData).subscribe({
        next: (user) => {
          expect(user.email).toBe('test@example.com');
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'mock-jwt-token', user: mockUser });

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should logout and clear auth state', () => {
      localStorage.setItem('renthub_user', JSON.stringify({ id: '1', fullName: 'Test', email: 'test@test.com', role: 'TENANT' }));
      localStorage.setItem('renthub_token', 'test-token');

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('renthub_token')).toBeNull();
      expect(localStorage.getItem('renthub_user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true after successful login', () => {
      const mockUser: User = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'TENANT',
        createdAt: '',
        updatedAt: '',
      };
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush({ token: 'mock-jwt-token', user: mockUser });

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role and false for mismatch', () => {
      const mockLandlord: User = {
        id: '2',
        fullName: 'Landlord User',
        email: 'landlord@example.com',
        phone: '1234567890',
        role: 'LANDLORD',
        createdAt: '',
        updatedAt: '',
      };
      service.login({ email: 'landlord@example.com', password: 'password123' }).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush({ token: 'mock-jwt-token', user: mockLandlord });

      expect(service.hasRole('LANDLORD')).toBe(true);
      expect(service.hasRole('TENANT')).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      expect(service.hasRole('TENANT')).toBe(false);
    });
  });
});
