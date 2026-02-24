import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SellerService } from '../services/seller.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderResolver implements Resolve<any[]> {
  constructor(
    private sellerService: SellerService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any[]> {
    // Get the current admin's ID
    const adminId = this.authService.getUserId();
    
    console.log('OrderResolver - Current admin ID:', adminId);
    
    // If admin is logged in, fetch only their orders
    if (adminId) {
      return this.sellerService.getSellerOrders(adminId).pipe(
        catchError((error) => {
          console.log('Seller orders endpoint failed, trying alternate endpoint:', error);
          // Fallback to alternate endpoint
          return this.orderService.getOrdersByAdmin(adminId).pipe(
            catchError((fallbackError) => {
              console.error('Both admin order endpoints failed:', fallbackError);
              return of([]);
            })
          );
        })
      );
    }
    
    // Fallback: try to get orders by sellerId from localStorage
    const sellerId = this.getSellerId();
    return this.sellerService.getSellerOrders(sellerId).pipe(
      catchError((error) => {
        console.log('Seller endpoint failed:', error);
        return of([]);
      })
    );
  }

  private getSellerId(): number {
    // In a real app, get this from auth service or route params
    return parseInt(localStorage.getItem('sellerId') || '1', 10);
  }
}
