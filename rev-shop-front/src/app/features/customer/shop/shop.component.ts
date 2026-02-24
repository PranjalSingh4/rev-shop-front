import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { Product } from '../../../core/models';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private searchService: SearchService,
  ) {}

  ngOnInit(): void {
    // Get userId from auth service
    const id = this.authService.getUserId();
    if (id) {
      this.userId = id;
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

}
