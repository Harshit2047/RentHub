import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommentItem } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  constructor(private http: HttpClient) {}

  private unwrap<T>(raw: any): T {
    return (raw?.data !== undefined ? raw.data : raw) as T;
  }

  getApartmentComments(apartmentId: string): Observable<CommentItem[]> {
    return this.http.get<any>(`${this.apiUrl}/${apartmentId}`).pipe(
      map(raw => this.unwrap<CommentItem[]>(raw) ?? []),
      catchError(err => {
        console.error('Error fetching comments:', err);
        return of([]);
      })
    );
  }

  postComment(apartmentId: string, content: string): Observable<CommentItem> {
    return this.http.post<any>(`${this.apiUrl}/${apartmentId}`, { content }).pipe(
      map(raw => this.unwrap<CommentItem>(raw)),
      catchError(err => throwError(() => err))
    );
  }

  postReply(commentId: string, content: string): Observable<CommentItem> {
    return this.http.post<any>(`${this.apiUrl}/${commentId}/replies`, { content }).pipe(
      map(raw => this.unwrap<CommentItem>(raw)),
      catchError(err => throwError(() => err))
    );
  }

  editComment(commentId: string, content: string): Observable<CommentItem> {
    return this.http.put<any>(`${this.apiUrl}/${commentId}`, { content }).pipe(
      map(raw => this.unwrap<CommentItem>(raw)),
      catchError(err => throwError(() => err))
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${commentId}`).pipe(
      map(() => void 0),
      catchError(err => throwError(() => err))
    );
  }
}

