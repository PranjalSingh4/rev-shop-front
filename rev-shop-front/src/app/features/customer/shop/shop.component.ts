import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { Product } from '../../../core/models';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { FavoriteService } from '../../../core/services/favorite.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  userId: number|null = 0;
  selectedProductQuantities: { [key: number]: number } = {};
  cartMessage = '';
  searchTerm: string = '';
  showFavoritesOnly = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private searchService: SearchService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    // Get userId from auth service
    const id = this.authService.getUserId();
    if (id) {
      this.userId = id;
      // Preload favorites so heart states are accurate
      this.favoriteService.getFavorites(id).subscribe({
        next: () => {},
        error: (err) => console.error('Error loading favorites in shop:', err)
      });
    }

    // Get resolved data from route
    this.activatedRoute.data.subscribe((data: any) => {
      this.products = data['products'] || [];
      this.filteredProducts = this.products;
      this.initializeQuantities();
      this.isLoading = false;
    });

    // Subscribe to navbar search
    this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term;
      this.filterProducts();
    });

    // Subscribe to "show favorites" toggle from navbar
    this.searchService.showFavorites$.subscribe((flag) => {
      this.showFavoritesOnly = flag;
      this.filterProducts();
    });

    // Re-filter whenever favorites list changes (so removing a favorite updates the view)
    this.favoriteService.favorites$.subscribe(() => {
      this.filterProducts();
    });
  }

  initializeQuantities(): void {
    this.products.forEach(product => {
      this.selectedProductQuantities[product.id || 0] = 1;
    });
  }

  addToCart(product: Product): void {
    const id = this.authService.getUserId();
    console.log('Adding to cart:', product);
    console.log('Current userId:', id);
    
    if (!id) {
      this.cartMessage = 'Please login first';
      setTimeout(() => this.cartMessage = '', 3000);
      return;
    }

    const quantity = this.selectedProductQuantities[product.id || 0] || 1;
    this.cartService.addToCart(id, product.id || 0, quantity).subscribe(
      (response) => {
        console.log('Add to cart response:', response);
        this.cartMessage = `✓ ${product.name} added to cart!`;
        // Reset quantity after successful add
        this.selectedProductQuantities[product.id || 0] = 1;
        setTimeout(() => this.cartMessage = '', 3000);
      },
      (error) => {
        console.error('Error adding to cart:', error);
        this.cartMessage = error?.message || 'Failed to add item to cart';
        setTimeout(() => this.cartMessage = '', 4000);
      }
    );
  }

  getQuantity(productId: number): number {
    return this.selectedProductQuantities[productId] || 1;
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity > 0) {
      this.selectedProductQuantities[productId] = quantity;
    }
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  filterProducts(): void {
    const searchLower = this.searchTerm.toLowerCase().trim();

    // Base list
    let base = this.products;

    // If showing favorites, reduce the set to favorites only
    if (this.showFavoritesOnly) {
      const favs = this.favoriteService.getCurrentFavorites();
      const favIds = new Set(favs.map(f => f.productId));
      base = base.filter(p => favIds.has(p.id || -1));
    }

    if (!searchLower) {
      this.filteredProducts = base;
    } else {
      this.filteredProducts = base.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description.toLowerCase().includes(searchLower);
        return nameMatch || descriptionMatch;
      });
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoriteService.isFavorite(productId);
  }

  toggleFavorite(product: Product): void {
    const id = this.authService.getUserId();
    if (!id) {
      this.cartMessage = 'Please login first';
      setTimeout(() => (this.cartMessage = ''), 3000);
      return;
    }

    if (this.isFavorite(product.id || 0)) {
      this.favoriteService.removeFavorite(id, product.id || 0).subscribe({
        next: () => {
          this.cartMessage = `Removed from favorites: ${product.name}`;
          setTimeout(() => (this.cartMessage = ''), 2000);
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          this.cartMessage = 'Failed to remove from favorites';
          setTimeout(() => (this.cartMessage = ''), 3000);
        }
      });
    } else {
      this.favoriteService.addFavorite(id, product.id || 0).subscribe({
        next: () => {
          this.cartMessage = `♥ Added to favorites: ${product.name}`;
          setTimeout(() => (this.cartMessage = ''), 2000);
        },
        error: (error) => {
          console.error('Error adding favorite:', error);
          this.cartMessage = 'Failed to add to favorites';
          setTimeout(() => (this.cartMessage = ''), 3000);
        }
      });
    }
  }
}
