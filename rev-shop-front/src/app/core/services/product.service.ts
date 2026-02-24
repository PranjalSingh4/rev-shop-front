 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Product } from '../models';
import { timeout, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/product';

  constructor(private http: HttpClient) {}

  addProduct(product: Product, sellerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add/${sellerId}`, product).pipe(timeout(10000));
  }


 // For customers: fetch all products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/all`).pipe(timeout(10000));
  }

  // Use this method to fetch all products for a seller (admin)
  getAllProductsBySeller(sellerId: number | null): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin/${sellerId}`).pipe(timeout(10000));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(timeout(10000));
  }

  getProductsByAdmin(adminId: number | null): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin/${adminId}`).pipe(timeout(10000));
  }

  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, product).pipe(timeout(10000));
  }

  deleteProduct(id: number): Observable<any> {
    console.log('Starting delete product:', id);
    const fullUrl = `${this.apiUrl}/delete/${id}`;
    console.log('Full URL being called:', fullUrl);
    
    // Try the primary endpoint first
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      timeout(10000),
      tap((response) => {
        console.log('Product deleted successfully:', response);
      }),
      catchError((error) => {
        console.error('Primary delete endpoint failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Try alternate endpoint: DELETE /api/product/{id}
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
          timeout(10000),
          tap((response) => {
            console.log('Product deleted using alternate endpoint:', response);
          }),
          catchError((altError) => {
            console.error('Alternate delete endpoint also failed:', altError);
            
            // Try POST method as fallback
            return this.http.post(`${this.apiUrl}/delete/${id}`, null).pipe(
              timeout(10000),
              tap((response) => {
                console.log('Product deleted using POST method:', response);
              }),
              catchError((postError) => {
                console.error('POST delete endpoint also failed:', postError);
                // Return a proper error that the component can handle
                return throwError(() => ({
                  error: {
                    message: 'Failed to delete product. Please check console for details.'
                  },
                  originalError: postError
                }));
              })
            );
          })
        );
      })
    );
  }
}
