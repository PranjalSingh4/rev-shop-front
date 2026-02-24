import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SellerService } from '../../../core/services/seller.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { SearchService } from '../../../core/services/search.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  totalOrders = 0;
  totalProducts = 0;
  totalRevenue = 0;
  orders: any[] = [];
  products: any[] = [];
  isLoading = false;
  sellerId: number = 1; // In real app, get from service
  refreshMessage = '';
  searchTerm = '';
  private refreshSubscription: Subscription | null = null;
  private productRefreshSubscription: Subscription | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private sellerService: SellerService,
    private orderService: OrderService,
    private productService: ProductService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    
    // Get the current admin's ID
    const adminId = this.authService.getUserId();
    if (adminId) {
      this.sellerId = adminId;
      console.log('Admin Dashboard - Current admin ID:', adminId);
    }
    
    // Load products first
    this.loadProducts();

    // Get resolved data from route
    this.activatedRoute.data.subscribe((data: any) => {
      this.orders = data['orders'] || [];
      this.totalOrders = this.orders.length;
      this.calculateTotals();
      this.isLoading = false;
    });

    // Auto-refresh orders every 5 seconds
    this.startAutoRefresh();

    // Auto-refresh products every 5 seconds
    this.startProductAutoRefresh();
  }

  ngOnDestroy(): void {
    // Stop auto-refresh when component is destroyed
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.productRefreshSubscription) {
      this.productRefreshSubscription.unsubscribe();
    }
  }

  startAutoRefresh(): void {
    // Get current admin ID
    const adminId = this.authService.getUserId();
    
    // Refresh orders every 5 seconds automatically - only for this admin
    this.refreshSubscription = interval(5000)
      .pipe(
        switchMap(() => {
          if (adminId) {
            // Fetch only this admin's orders
            return this.sellerService.getSellerOrders(adminId);
          } else {
            // Fallback to general endpoint
            return this.sellerService.getAllOrders();
          }
        })
      )
      .subscribe(
        (orders) => {
          this.orders = orders || [];
          this.totalOrders = this.orders.length;
          this.calculateTotals();
        },
        (error) => {
          console.log('Auto-refresh failed, trying alternate endpoint:', error);
          // Try the order service endpoint
          if (adminId) {
            this.orderService.getOrdersByAdmin(adminId).subscribe(
              (orders) => {
                this.orders = orders || [];
                this.totalOrders = this.orders.length;
                this.calculateTotals();
              },
              (fallbackError) => {
                console.error('All auto-refresh endpoints failed:', fallbackError);
              }
            );
          }
        }
      );
  }

  refreshOrders(): void {
    this.isLoading = true;
    this.refreshMessage = 'Refreshing...';
    
    const adminId = this.authService.getUserId();

    // Fetch only this admin's orders
    const refreshCall = adminId 
      ? this.sellerService.getSellerOrders(adminId)
      : this.sellerService.getAllOrders();

    refreshCall.subscribe(
      (orders) => {
        this.orders = orders || [];
        this.totalOrders = this.orders.length;
        this.calculateTotals();
        this.isLoading = false;
        this.refreshMessage = '✓ Refreshed! ' + this.totalOrders + ' orders found';
        setTimeout(() => {
          this.refreshMessage = '';
        }, 3000);
      },
      (error) => {
        console.log('Seller endpoint failed, trying Order endpoint:', error);
        // Try the order service endpoint
        const fallbackCall = adminId
          ? this.orderService.getOrdersByAdmin(adminId)
          : this.orderService.getAllOrders();

        fallbackCall.subscribe(
          (orders) => {
            this.orders = orders || [];
            this.totalOrders = this.orders.length;
            this.calculateTotals();
            this.isLoading = false;
            this.refreshMessage = '✓ Refreshed! ' + this.totalOrders + ' orders found';
            setTimeout(() => {
              this.refreshMessage = '';
            }, 3000);
          },
          (fallbackError) => {
            console.error('All refresh endpoints failed:', fallbackError);
            this.isLoading = false;
            this.refreshMessage = '✗ Failed to refresh orders';
            setTimeout(() => {
              this.refreshMessage = '';
            }, 3000);
          }
        );
      }
    );
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (products) => {
        this.products = products || [];
        this.totalProducts = this.products.length;
        console.log('Products loaded:', this.totalProducts);
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  startProductAutoRefresh(): void {
    // Refresh products every 5 seconds automatically
    this.productRefreshSubscription = interval(5000)
      .pipe(
        switchMap(() => this.productService.getAllProducts())
      )
      .subscribe(
        (products) => {
          this.products = products || [];
          this.totalProducts = this.products.length;
          console.log('Products auto-refreshed:', this.totalProducts);
        },
        (error) => {
          console.error('Error auto-refreshing products:', error);
        }
      );
  }

  calculateTotals(): void {
    this.totalRevenue = this.orders.reduce((sum, order) => {
      if (order.items) {
        const orderTotal = order.items.reduce((total: number, item: any) => {
          return total + (item.price * item.quantity);
        }, 0);
        return sum + orderTotal;
      }
      return sum;
    }, 0);
  }

  getOrderTotal(order: any): number {
    if (!order.items) return 0;
    return order.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  onSearchChange(): void {
    this.searchService.setSearchTerm(this.searchTerm);
  }
}
