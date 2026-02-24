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
    // Get the current admin's ID
    const adminId = this.authService.getUserId();
    
    console.log('ProductResolver - Current admin ID:', adminId);
    
    // If admin is logged in, fetch only their products
    if (adminId) {
      return this.productService.getProductsByAdmin(adminId).pipe(
        catchError((error) => {
          console.log('Admin products endpoint failed, trying all products:', error);
          // Fallback to all products if admin-specific endpoint fails
          return this.productService.getAllProducts().pipe(
            catchError((fallbackError) => {
              console.error('Both product endpoints failed:', fallbackError);
              return of([]);
            })
          );
        })
      );
    }
    
    // Fallback: get all products
    return this.productService.getAllProducts().pipe(
      catchError((error) => {
        console.error('Error loading products:', error);
        return of([]);
      })
    );
  }
}
