import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userEmail: string | null = null;
  userRole: string | null = null;
  cartItemCount = 0;
  isLoggedIn = false;
  searchInput: string = '';
  showingFavorites = false;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getEmail();
    this.userRole = this.authService.getRole();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.updateCartCount();
  }

  updateCartCount(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    );
  }

  isSeller(): boolean {
    return this.authService.isAdmin();
  }

  isBuyer(): boolean {
    return this.authService.isCustomer();
  }

  onSearch(): void {
    // As requested, clicking the search button shows favorites
    this.searchService.clearSearchTerm();
    this.searchInput = '';
    this.searchService.setShowFavorites(true);
    // If not on shop page, navigate to it
    if (!this.router.url.includes('/customer/shop')) {
      this.router.navigate(['/customer/shop']);
    }
  }

  onSearchInputChange(value: string): void {
    this.searchService.setSearchTerm(value);
  }

  showFavorites(): void {
    this.searchInput = '';
    this.searchService.clearSearchTerm();
    this.searchService.setShowFavorites(true);
    if (!this.router.url.includes('/customer/shop')) {
      this.router.navigate(['/customer/shop']);
    }
  }
}
