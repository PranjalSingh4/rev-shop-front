import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { CartItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(userId: number, productId: number, quantity: number): Observable<any> {
    console.log('Adding to cart:', { userId, productId, quantity });
    
    return this.http.post(`${this.apiUrl}/add`, null, {
      params: { 
        userId: userId.toString(), 
        productId: productId.toString(), 
        qty: quantity.toString() 
      }
    }).pipe(
      tap((response) => {
        console.log('Item added to cart successfully:', response);
        // Reload cart data after adding
        setTimeout(() => this.loadCart(userId), 300);
      }),
      catchError((error) => {
        console.error('Error adding to cart:', error);
        return throwError(() => ({
          message: error.error?.message || 'Failed to add item to cart',
          status: error.status
        }));
      })
    );
  }

  viewCart(userId: number): Observable<CartItem[]> {
    const url = `${this.apiUrl}/${userId}`;
    console.log('Fetching cart for userId:', userId);
    
    return this.http.get<any>(url).pipe(
      tap((response) => {
        console.log('Raw cart response:', response);
      }),
      // Transform the response to normalized items
      tap((response) => {
        let items: CartItem[] = [];
        if (Array.isArray(response)) {
          items = response.map((item: any) => this.normalizeCartItem(item));
        } else if (response?.items && Array.isArray(response.items)) {
          items = response.items.map((item: any) => this.normalizeCartItem(item));
        } else if (response?.cartItems && Array.isArray(response.cartItems)) {
          items = response.cartItems.map((item: any) => this.normalizeCartItem(item));
        } else if (response?.data && Array.isArray(response.data)) {
          items = response.data.map((item: any) => this.normalizeCartItem(item));
        }
        console.log('Processed cart items from response:', items);
        this.cartItemsSubject.next(items || []);
        // Store items for return in map operator below
        (response as any).__normalizedItems = items;
      }),
      // Use map to return normalized items instead of raw response
      map((response: any) => {
        const items = (response as any).__normalizedItems || [];
        console.log('Returning normalized items to subscriber:', items);
        return items;
      }),
      catchError((error) => {
        console.error('Error fetching cart:', error);
        this.cartItemsSubject.next([]);
        return throwError(() => ({
          message: error.error?.message || 'Failed to load cart',
          status: error.status
        }));
      })
    );
  }

  private normalizeCartItem(item: any): CartItem {
    console.log('Normalizing cart item:', item);
    
    // Case 1: Already has product object
    if (item.product && typeof item.product === 'object') {
      return {
        id: item.id || item.cartItemId,
        cartId: item.cartId,
        product: {
          id: item.product.id,
          name: item.product.name || item.product.productName || 'Unknown',
          description: item.product.description || '',
          price: Number(item.product.price) || 0,
          photo: item.product.photo,
          sellerId: item.product.sellerId
        },
        quantity: Number(item.quantity) || 1
      };
    }
    
    // Case 2: Product data at root level (flattened structure)
    if (item.name || item.productName) {
      return {
        id: item.id || item.cartItemId,
        cartId: item.cartId,
        product: {
          id: item.productId || item.id,
          name: item.name || item.productName || 'Unknown',
          description: item.description || item.productDescription || '',
          price: Number(item.price) || 0,
          photo: item.photo || item.productPhoto,
          sellerId: item.sellerId
        },
        quantity: Number(item.quantity) || 1
      };
    }
    
    // Case 3: Fallback - return item as-is but ensure it has minimum structure
    console.warn('Unknown cart item format:', item);
    return {
      id: item.id || item.cartItemId,
      cartId: item.cartId,
      product: {
        id: item.productId || item.id,
        name: item.name || 'Unknown Product',
        description: item.description || '',
        price: 0,
        photo: undefined
      },
      quantity: Number(item.quantity) || 1
    };
  }

  removeFromCart(userId: number, productId: number): Observable<any> {
    console.log('Removing from cart:', { userId, productId });
    
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId.toString());

    return this.http.delete(`${this.apiUrl}/remove`, { params }).pipe(
      tap((response) => {
        console.log('Item removed successfully:', response);
        // Reload cart after removal
        setTimeout(() => this.loadCart(userId), 300);
      }),
      catchError((error) => {
        console.error('Error removing from cart:', error);
        return throwError(() => ({
          message: error.error?.message || 'Failed to remove item from cart',
          status: error.status
        }));
      })
    );
  }

  loadCart(userId: number): void {
    this.viewCart(userId).subscribe({
      next: (items) => {
        console.log('Cart reloaded successfully with items:', items);
      },
      error: (error) => {
        console.error('Error reloading cart:', error);
      }
    });
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCurrentCartItemCount(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.quantity, 0);
  }
}


