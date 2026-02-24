import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Favorite } from '../models/index';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'http://localhost:8080/api/favorite';
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavoritesFromLocalStorage();
  }

  // Load favorites from localStorage
  private loadFavoritesFromLocalStorage(): void {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try {
        const favorites = JSON.parse(stored);
        this.favoritesSubject.next(favorites);
      } catch (e) {
        console.error('Error loading favorites from localStorage:', e);
      }
    }
  }

  // Get all favorites for a user
  getFavorites(userId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(favorites => {
        this.favoritesSubject.next(favorites);
        localStorage.setItem('favorites', JSON.stringify(favorites));
      })
    );
  }

  // Add product to favorites
  addFavorite(userId: number, productId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/add`, {
      userId,
      productId
    }).pipe(
      tap(favorite => {
        const current = this.favoritesSubject.value;
        const updated = [...current, favorite];
        this.favoritesSubject.next(updated);
        localStorage.setItem('favorites', JSON.stringify(updated));
      })
    );
  }

  // Remove product from favorites
  removeFavorite(userId: number, productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${userId}/${productId}`).pipe(
      tap(() => {
        const current = this.favoritesSubject.value;
        const updated = current.filter(fav => fav.productId !== productId);
        this.favoritesSubject.next(updated);
        localStorage.setItem('favorites', JSON.stringify(updated));
      })
    );
  }

  // Check if product is favorite
  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.some(fav => fav.productId === productId);
  }

  // Get current favorites
  getCurrentFavorites(): Favorite[] {
    return this.favoritesSubject.value;
  }

  // Clear all favorites
  clearFavorites(): void {
    this.favoritesSubject.next([]);
    localStorage.removeItem('favorites');
  }
}
