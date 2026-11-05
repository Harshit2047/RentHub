import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Apartment } from '../models/apartment.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavouriteService {
  private apiUrl = `${environment.apiUrl}/favourites`;

  /** Local set of favourited apartment IDs for instant UI feedback */
  private favouriteIds = new BehaviorSubject<Set<string>>(new Set());
  favouriteIds$ = this.favouriteIds.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Automatically load favourites on any active session, or clear when logged out
    this.authService.authState$.subscribe(user => {
      if (user) {
        this.loadFavourites().subscribe();
      } else {
        this.favouriteIds.next(new Set());
      }
    });
  }

  /** Current snapshot of favourite IDs */
  getFavouriteIds(): Set<string> {
    return this.favouriteIds.value;
  }

  /** Unwrap the standard API envelope { success, data } */
  private unwrap<T>(raw: any): T {
    return (raw?.data !== undefined ? raw.data : raw) as T;
  }

  /** Load all user favourites and seed the local ID set */
  loadFavourites(): Observable<Apartment[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(raw => {
        const list: any[] = this.unwrap<any[]>(raw) ?? [];
        // Each item is a Favourite row with an `apartment` relation
        const apartments: Apartment[] = list.map((f: any) => f.apartment ?? f);
        this.favouriteIds.next(new Set(apartments.map(a => a.id)));
        return apartments;
      }),
      catchError(err => {
        console.error('Error fetching favourites:', err);
        return of([]);
      })
    );
  }

  /** Returns whether the given apartment is currently favourited (from local state) */
  isIdFavourited(apartmentId: string): boolean {
    return this.favouriteIds.value.has(apartmentId);
  }

  /** Toggle favourite — optimistic UI + sync with server */
  toggleFavourite(apartmentId: string): Observable<boolean> {
    // Optimistic update
    const current = new Set(this.favouriteIds.value);
    const wasLiked = current.has(apartmentId);
    if (wasLiked) current.delete(apartmentId); else current.add(apartmentId);
    this.favouriteIds.next(current);

    return this.http.post<any>(`${this.apiUrl}/${apartmentId}`, {}).pipe(
      map(raw => {
        const data = this.unwrap<{ isFavourite: boolean }>(raw);
        // Sync server truth back into local set
        const synced = new Set(this.favouriteIds.value);
        if (data.isFavourite) synced.add(apartmentId);
        else synced.delete(apartmentId);
        this.favouriteIds.next(synced);
        return data.isFavourite;
      }),
      catchError(err => {
        // Revert optimistic update on error
        const reverted = new Set(this.favouriteIds.value);
        if (wasLiked) reverted.add(apartmentId); else reverted.delete(apartmentId);
        this.favouriteIds.next(reverted);
        console.error('Error toggling favourite:', err);
        return throwError(() => err);
      })
    );
  }
}
