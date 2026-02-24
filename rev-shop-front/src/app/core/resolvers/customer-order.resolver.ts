import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../services/order.service';
import { Order } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CustomerOrderResolver implements Resolve<Order[]> {
  constructor(private orderService: OrderService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Order[]> {
    const userId = this.getUserId();
    return this.orderService.getOrderHistory(userId).pipe(
      catchError((error) => {
        console.error('Error loading customer orders:', error);
        return of([]);
      })
    );
  }

  private getUserId(): number {
    // In a real app, get this from auth service
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }
}
