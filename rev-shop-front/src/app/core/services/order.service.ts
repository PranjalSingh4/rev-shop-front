import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/order';

  constructor(private http: HttpClient) {}

  placeOrder(userId: number, addressId?: number): Observable<OrderDTO> {
    const payload = addressId ? { addressId } : {};
    return this.http.post<OrderDTO>(`${this.apiUrl}/place/${userId}`, payload);
  }

  getOrderHistory(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/history/${userId}`);
  }

  getOrderDetails(userId: number): Observable<Order[]> {
    return this.getOrderHistory(userId);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/all`);
  }

  getOrdersByAdmin(adminId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/${adminId}`);
  }
}
