import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern(/^[\d+\-\s()]*$/), Validators.maxLength(20)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: ['TENANT', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(fg: FormGroup) {
    const pw = fg.get('password')?.value;
    const cpw = fg.get('confirmPassword')?.value;
    if (pw && cpw && pw !== cpw) {
      fg.get('confirmPassword')?.setErrors({ mismatch: true });
    } else if (fg.get('confirmPassword')?.errors?.['mismatch']) {
      fg.get('confirmPassword')?.setErrors(null);
    }
  }

  setRole(role: 'TENANT' | 'LANDLORD'): void {
    this.registerForm.get('role')?.setValue(role);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const { fullName, email, phone, password, role } = this.registerForm.value;

    this.authService.register({ fullName, email, phone: phone || '', password, role }).subscribe({
      next: (user) => {
        this.toast.success(`Account created! Welcome to RentHub, ${user.fullName || 'User'}!`);
        if (user.role === 'LANDLORD') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/apartments']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
