import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { Order, Favorite } from '../../../core/models/index';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  orders: any[] = [];
  favorites: Favorite[] = [];
  isLoading = false;
  totalOrders = 0;
  userId: number = 1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Get userId from auth service
    const id = this.authService.getUserId();
    if (id) {
      this.userId = id;
    }
    
    // Load orders from localStorage
    this.loadOrdersFromLocalStorage();

    // Load favorites for this user
    this.loadFavorites();
  }

  loadOrdersFromLocalStorage(): void {
    this.isLoading = true;
    // Simulate async operation
    setTimeout(() => {
      const storedOrders = localStorage.getItem('user_orders');
      if (storedOrders) {
        this.orders = JSON.parse(storedOrders);
        // Filter orders for this user
        this.orders = this.orders.filter(order => order.userId === this.userId);
      } else {
        this.orders = [];
      }
      this.totalOrders = this.orders.length;
      this.isLoading = false;
      console.log('Orders loaded from localStorage:', this.orders);
    }, 300);
  }

  loadFavorites(): void {
    this.favoriteService.getFavorites(this.userId).subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        console.log('Favorites loaded:', this.favorites);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        // Fallback to local favorites
        this.favorites = this.favoriteService.getCurrentFavorites();
      }
    });
  }

  removeFavorite(favorite: Favorite): void {
    this.favoriteService.removeFavorite(this.userId, favorite.productId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.productId !== favorite.productId);
        console.log('Favorite removed:', favorite.productId);
      },
      error: (error) => {
        console.error('Error removing favorite:', error);
      }
    });
  }

  getOrderTotal(order: any): number {
    if (order.total !== undefined) {
      return order.total;
    }
    return order.items?.reduce((total: number, item: any) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0) || 0;
  }

  getOrderDate(order: any): string {
    if (order.orderDate) {
      return new Date(order.orderDate).toLocaleDateString();
    }
    if (order.createdDate) {
      return new Date(order.createdDate).toLocaleDateString();
    }
    return 'N/A';
  }

  moveFavoriteToCart(favorite: Favorite): void {
    const quantity = 1;
    this.cartService.addToCart(this.userId, favorite.productId, quantity).subscribe({
      next: () => {
        this.favoriteService.removeFavorite(this.userId, favorite.productId).subscribe({
          next: () => {
            this.favorites = this.favorites.filter(f => f.productId !== favorite.productId);
            console.log('Moved favorite to cart and removed from favorites:', favorite.productId);
          },
          error: (error) => {
            console.error('Error removing favorite after add to cart:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error adding favorite to cart:', error);
      }
    });
  }
}
