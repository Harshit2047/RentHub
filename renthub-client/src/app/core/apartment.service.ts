import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Apartment, ApartmentFormValues, ApartmentFilters, ApartmentImage } from '../models/apartment.model';
import { environment } from '../../environments/environment';

export type { Apartment, ApartmentFormValues, ApartmentFilters, ApartmentImage };

@Injectable({ providedIn: 'root' })
export class ApartmentService {
  private apiUrl = `${environment.apiUrl}/apartments`;

  constructor(private http: HttpClient) {}

  /** Unwrap the API's `{ success, message, data }` envelope */
  private unwrap<T>(payload: any): T {
    return (payload && payload.data !== undefined ? payload.data : payload) as T;
  }

  /** Map a raw API apartment into the client model */
  private normalizeApartment(apt: any): Apartment {
    if (!apt) {
      return null as unknown as Apartment;
    }

    return {
      id: apt.id,
      title: apt.title,
      description: apt.description ?? null,
      address: apt.address,
      city: apt.city,
      state: apt.state ?? null,
      pincode: apt.pincode ?? null,
      monthlyRent: apt.monthlyRent !== null && apt.monthlyRent !== undefined ? Number(apt.monthlyRent) : 0,
      securityDeposit:
        apt.securityDeposit !== null && apt.securityDeposit !== undefined
          ? Number(apt.securityDeposit)
          : null,
      bedrooms: apt.bedrooms,
      bathrooms: apt.bathrooms,
      area: apt.area !== null && apt.area !== undefined ? Number(apt.area) : null,
      furnished: apt.furnished,
      vegetarian: apt.vegetarian,
      availability: apt.availability,
      images:
        apt.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          publicId: img.publicId ?? null,
          orderIndex: img.orderIndex,
        })) || [],
      amenities: apt.amenities || [],
      landlord: apt.landlord
        ? {
            id: apt.landlord.id,
            fullName: apt.landlord.fullName ?? apt.landlord.user?.fullName ?? '',
            companyName: apt.landlord.companyName ?? null,
          }
        : { id: '', fullName: '', companyName: null },
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
    };
  }

  /** Get all apartments with pagination and filtering */
  getApartments(filters: ApartmentFilters = {}, page: number = 1, limit: number = 10): Observable<{
    apartments: Apartment[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const query: string[] = [];

    if (filters.city) query.push(`city=${encodeURIComponent(filters.city)}`);
    if (filters.state) query.push(`state=${encodeURIComponent(filters.state)}`);
    if (filters.availability) query.push(`availability=${filters.availability}`);
    if (filters.minRent !== undefined) query.push(`minRent=${filters.minRent}`);
    if (filters.maxRent !== undefined) query.push(`maxRent=${filters.maxRent}`);
    if (filters.bedrooms !== undefined) query.push(`bedrooms=${filters.bedrooms}`);
    if (filters.furnished) query.push(`furnished=${filters.furnished}`);
    if (filters.search) query.push(`search=${encodeURIComponent(filters.search)}`);
    if (filters.sortBy) query.push(`sortBy=${encodeURIComponent(filters.sortBy)}`);
    if (filters.sortOrder) query.push(`sortOrder=${encodeURIComponent(filters.sortOrder)}`);

    query.push(`page=${page}`);
    query.push(`limit=${limit}`);

    const paramsString = query.join('&');
    return this.http.get<any>(`${this.apiUrl}/?${paramsString}`).pipe(
      map((raw) => {
        const data = this.unwrap<any>(raw) ?? {};
        const apartments: Apartment[] = (data.apartments ?? []).map((apt: any) =>
          this.normalizeApartment(apt)
        );

        return {
          apartments,
          total: data.totalItems ?? data.total ?? apartments.length,
          currentPage: data.currentPage ?? page,
          totalPages: data.totalPages ?? 0,
        };
      }),
      catchError(() => {
        return of({
          apartments: [],
          total: 0,
          currentPage: page,
          totalPages: 0,
        });
      })
    );
  }

  /** Get single apartment by ID */
  getApartmentById(id: string): Observable<Apartment | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((raw) => {
        const apt = this.unwrap<any>(raw);
        if (!apt) return null;
        return this.normalizeApartment(apt);
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /** Build the multipart payload expected by the API */
  private buildFormData(apartment: ApartmentFormValues, images: File[] = []): FormData {
    const formData = new FormData();
    formData.append('title', apartment.title);
    formData.append('description', apartment.description ?? '');
    formData.append('address', apartment.address);
    formData.append('city', apartment.city);
    formData.append('state', apartment.state ?? '');
    formData.append('pincode', apartment.pincode ?? '');
    formData.append('monthlyRent', String(apartment.monthlyRent));
    formData.append('securityDeposit', String(apartment.securityDeposit ?? 0));
    formData.append('bedrooms', String(apartment.bedrooms));
    formData.append('bathrooms', String(apartment.bathrooms));
    // Omit optional numeric fields entirely when empty — an empty string
    // would otherwise coerce to 0 and fail the API's positive-number check.
    if (apartment.area) {
      formData.append('area', String(apartment.area));
    }
    formData.append('furnished', apartment.furnished);
    formData.append('vegetarian', apartment.vegetarian);
    formData.append('availability', apartment.availability);
    formData.append('amenities', (apartment.amenities ?? []).join(','));

    for (const image of images) {
      formData.append('images', image);
    }

    return formData;
  }

  /** Create a new apartment (landlord only) */
  createApartment(apartment: ApartmentFormValues, images: File[] = []): Observable<Apartment> {
    return this.http.post<any>(`${this.apiUrl}/`, this.buildFormData(apartment, images)).pipe(
      map((raw) => this.normalizeApartment(this.unwrap<any>(raw))),
      catchError((error) => {
        return throwError(() => error.message || error);
      })
    );
  }

  /** Update an existing apartment (owner only) */
  updateApartment(id: string, apartment: ApartmentFormValues, images: File[] = []): Observable<Apartment> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, this.buildFormData(apartment, images)).pipe(
      map((raw) => this.normalizeApartment(this.unwrap<any>(raw))),
      catchError((error) => {
        return throwError(() => error.message || error);
      })
    );
  }

  /** Delete an apartment (owner only) */
  deleteApartment(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }

  /** Delete an individual image of an apartment by index (owner only) */
  deleteApartmentImage(apartmentId: string, imageIndex: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${apartmentId}/images/${imageIndex}`).pipe(
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }

  /** Get landlord's apartments */
  getMyListings(): Observable<Apartment[]> {
    return this.http.get<any>(`${this.apiUrl}/my-listings`).pipe(
      map((raw) => {
        const data = this.unwrap<any>(raw);
        return Array.isArray(data) ? data.map((apt) => this.normalizeApartment(apt)) : [];
      }),
      catchError(() => {
        return of([]);
      })
    );
  }
}
