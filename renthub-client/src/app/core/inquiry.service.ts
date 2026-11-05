import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Inquiry {
  id: string;
  apartmentId: string;
  tenantId: string;
  landlordId: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  apartment?: {
    id: string;
    title: string;
    city: string;
    state?: string;
    monthlyRent?: any;
    images?: Array<{ url: string }>;
  };
  tenant?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  landlord?: {
    id: string;
    companyName?: string;
    user?: {
      fullName: string;
      email: string;
      phone?: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private apiUrl = 'http://localhost:3000/api/inquiries';

  constructor(private http: HttpClient) {}

  private unwrap<T>(raw: any): T {
    return (raw?.data !== undefined ? raw.data : raw) as T;
  }

  sendInquiry(apartmentId: string, message: string): Observable<Inquiry> {
    return this.http.post<any>(`${this.apiUrl}/${apartmentId}`, { message }).pipe(
      map(raw => this.unwrap<Inquiry>(raw)),
      catchError(err => throwError(() => err))
    );
  }

  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(raw => this.unwrap<Inquiry[]>(raw) ?? []),
      catchError(err => {
        console.error('Error fetching inquiries:', err);
        return of([]);
      })
    );
  }

  getInquiryById(id: string): Observable<Inquiry | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(raw => this.unwrap<Inquiry>(raw)),
      catchError(err => {
        console.error('Error fetching inquiry by id:', err);
        return of(null);
      })
    );
  }

  updateStatus(id: string, status: string): Observable<Inquiry> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map(raw => this.unwrap<Inquiry>(raw)),
      catchError(err => throwError(() => err))
    );
  }
}

