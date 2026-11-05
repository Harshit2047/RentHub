import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthResponse, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private tokenKey = 'renthub_token';
  private userKey = 'renthub_user';

  // BehaviorSubject for authentication state
  private authState = new BehaviorSubject<User | null>(this.getStoredUser());
  private isLoading = new BehaviorSubject<boolean>(false);

  // Observables for external subscription
  public authState$ = this.authState.asObservable();
  public isLoading$ = this.isLoading.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for persisted token on service initialization
    this.checkStoredToken();
  }

  /** Get current user */
  private getStoredUser(): User | null {
    try {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /** Check for stored token */
  private checkStoredToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Verify token is still valid by checking user info
      this.getMe().subscribe({
        next: () => {
          // Token is valid, user is authenticated
        },
        error: () => {
          // Token is invalid, clear it
          this.logout();
        }
      });
    }
  }

  /** Get current authentication state */
  public getAuthState(): Observable<User | null> {
    return this.authState$;
  }

  /** Get isLoading state */
  public getIsLoading(): Observable<boolean> {
    return this.isLoading$;
  }

  /** Unwrap the API's `{ success, message, data }` envelope */
  private unwrap<T>(payload: any): T {
    return (payload && payload.data !== undefined ? payload.data : payload) as T;
  }

  /** Login user */
  public login(credentials: { email: string; password: string }): Observable<User> {
    this.isLoading.next(true);
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((raw) => {
        const response = this.unwrap<AuthResponse>(raw);
        this.setSession(response);
        return response.user;
      }),
      tap((user) => {
        this.authState.next(user);
      }),
      catchError((error) => {
        this.isLoading.next(false);
        throw error;
      })
    );
  }

  /** Register new user */
  public register(userData: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: 'TENANT' | 'LANDLORD';
  }): Observable<User> {
    this.isLoading.next(true);
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData).pipe(
      map((raw) => {
        const response = this.unwrap<AuthResponse>(raw);
        this.setSession(response);
        return response.user;
      }),
      tap((user) => {
        this.authState.next(user);
      }),
      catchError((error) => {
        this.isLoading.next(false);
        throw error;
      })
    );
  }

  /** Get current user profile */
  public getMe(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`).pipe(
      map((raw) => this.unwrap<{ user: User }>(raw).user),
      tap((user) => {
        this.authState.next(user);
      }),
      catchError((error) => {
        this.logout();
        throw error;
      })
    );
  }

  /** Logout user */
  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.next(null);
    this.router.navigate(['/login']);
  }

  /** Check if user is authenticated */
  public isAuthenticated(): boolean {
    return this.authState.value !== null;
  }

  /** Get current logged-in user synchronously */
  public get currentUser(): User | null {
    return this.authState.value;
  }

  /** Check if user has specific role */
  public hasRole(role: 'TENANT' | 'LANDLORD'): boolean {
    return this.authState.value?.role === role;
  }

  /** Get stored authentication token */
  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Set authentication session */
  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }
}