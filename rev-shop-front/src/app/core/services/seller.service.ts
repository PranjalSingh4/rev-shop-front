import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = 'http://localhost:8080/api/seller';

  constructor(private http: HttpClient) {}

  getSellerOrders(sellerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/${sellerId}`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all-orders`);
  }

  getDashboardData(sellerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${sellerId}`);
  }
}
