import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockToastService: any;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([
          { path: 'login', component: class DummyLogin {} },
          { path: 'home', component: class DummyHome {} },
          { path: 'apartments', component: class DummyApt {} },
          { path: 'dashboard', component: class DummyDash {} },
        ]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with default role TENANT and invalid form', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm.get('role')?.value).toBe('TENANT');
    expect(component.registerForm.valid).toBe(false);
  });

  it('should validate email format and required fields', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('not-an-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('tenant@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should invalidate when passwords do not match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'differentpassword',
    });
    expect(component.registerForm.get('confirmPassword')?.hasError('mismatch')).toBe(true);
  });

  it('should allow changing role with setRole()', () => {
    component.setRole('LANDLORD');
    expect(component.registerForm.get('role')?.value).toBe('LANDLORD');

    component.setRole('TENANT');
    expect(component.registerForm.get('role')?.value).toBe('TENANT');
  });

  it('should toggle password visibility flags', () => {
    expect(component.showPassword).toBe(false);
    component.togglePassword();
    expect(component.showPassword).toBe(true);

    expect(component.showConfirmPassword).toBe(false);
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBe(true);
  });

  it('should call authService.register and navigate to /apartments on successful tenant registration', () => {
    const mockUser: any = {
      id: 'tenant-1',
      fullName: 'John Tenant',
      email: 'john@example.com',
      role: 'TENANT',
      token: 'jwt-token-123',
    };
    mockAuthService.register.mockReturnValue(of(mockUser));

    component.registerForm.setValue({
      fullName: 'John Tenant',
      email: 'john@example.com',
      phone: '1234567890',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'TENANT',
    });

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      fullName: 'John Tenant',
      email: 'john@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'TENANT',
    });
    expect(mockToastService.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/apartments']);
  });

  it('should navigate to /dashboard on successful landlord registration', () => {
    const mockUser: any = {
      id: 'landlord-1',
      fullName: 'Jane Landlord',
      email: 'jane@example.com',
      role: 'LANDLORD',
      token: 'jwt-token-456',
    };
    mockAuthService.register.mockReturnValue(of(mockUser));

    component.registerForm.setValue({
      fullName: 'Jane Landlord',
      email: 'jane@example.com',
      phone: '9876543210',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'LANDLORD',
    });

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error toast on registration failure', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Email already registered' } }))
    );

    component.registerForm.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'TENANT',
    });

    component.onSubmit();

    expect(component.isSubmitting).toBe(false);
    expect(mockToastService.error).toHaveBeenCalledWith('Email already registered');
  });
});
