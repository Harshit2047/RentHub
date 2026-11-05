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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.maxLength(100)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           ['', [Validators.pattern(/^[\d+\- ]+$/), Validators.maxLength(20)]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role:            ['TENANT', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(fg: FormGroup) {
    const pw  = fg.get('password')?.value;
    const cpw = fg.get('confirmPassword')?.value;
    if (pw && cpw && pw !== cpw) {
      fg.get('confirmPassword')?.setErrors({ mismatch: true });
    } else if (fg.get('confirmPassword')?.errors?.['mismatch']) {
      fg.get('confirmPassword')?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const { fullName, email, phone, password, role } = this.registerForm.value;

    this.authService.register({ fullName, email, phone: phone || '', password, role }).subscribe({
      next: () => {
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
