import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.toast.success(`Welcome back, ${user.fullName || 'User'}! Logged in successfully.`);
        if (user.role === 'LANDLORD') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/apartments']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.message || 'Login failed. Please check your credentials.');
      },
    });
  }
}
