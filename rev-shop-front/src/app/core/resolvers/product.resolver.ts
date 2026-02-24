import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<Product[]> {
  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Product[]> {
    // Get the current user role
    const role = this.authService.getRole();
    const userId = this.authService.getUserId();

    // If admin, fetch only their products
    if (role === 'ADMIN' && userId) {
      return this.productService.getProductsByAdmin(userId).pipe(
        catchError((error) => {
          console.log('Admin products endpoint failed, trying all products:', error);
          return this.productService.getAllProducts().pipe(
            catchError((fallbackError) => {
              console.error('Both product endpoints failed:', fallbackError);
              return of([]);
            })
          );
        })
      );
    }

    // Fallback: get all products (for customers)
    return this.productService.getAllProducts().pipe(
      catchError((error) => {
        console.error('Error loading products:', error);
        return of([]);
      })
    );
  }
}
