import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { SearchService } from '../../../core/services/search.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FooterComponent],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  @ViewChild('productsSection') productsSection!: ElementRef;
  
  productForm: FormGroup;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  isFormVisible = false;
  editingProductId: number | null = null;
  deletingProductId: number | null = null;
  searchTerm: string = '';
  successMessage = '';
  errorMessage = '';
  adminId: number | null = null;
  private searchSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private searchService: SearchService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]]
    //   photo: ['']
    });
  }

  ngOnInit(): void {
    // Get current admin ID
    const adminId = this.authService.getUserId();
    if (adminId) {
      this.adminId = adminId;
      console.log('Admin ID:', this.adminId);
    }
    
    // Get resolved data from route
    this.activatedRoute.data.subscribe((data: any) => {
      this.products = data['products'] || [];
      this.filteredProducts = this.products;
      this.isLoading = false;
    });

    // Subscribe to search service
    this.searchSubscription = this.searchService.searchTerm$.subscribe((searchTerm) => {
      this.searchTerm = searchTerm;
      this.filterProducts();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from search service
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    // Clear search term when leaving this component
    this.searchService.clearSearchTerm();
  }

  loadProducts(): void {
    this.isLoading = true;
    
    const loadCall = this.adminId 
      ? this.productService.getProductsByAdmin(this.adminId)
      : this.productService.getAllProducts();
    
    loadCall.subscribe({
      next: (data) => {
        console.log('Products loaded:', data);
        this.products = data;
        this.filteredProducts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading admin products, trying getAllProducts:', error);
        // Fallback to getAllProducts if admin-specific endpoint fails
        this.productService.getAllProducts().subscribe({
          next: (data) => {
            console.log('Products loaded via fallback:', data);
            this.products = data;
            this.filteredProducts = data;
            this.isLoading = false;
          },
          error: (fallbackError) => {
            console.error('Error loading products:', fallbackError);
            this.errorMessage = 'Failed to load products: ' + (fallbackError.error?.message || fallbackError.message || 'Unknown error');
            this.isLoading = false;
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    });
  }

  toggleForm(): void {
    this.isFormVisible = !this.isFormVisible;
    if (!this.isFormVisible) {
      this.resetForm();
    }
  }

//   onFileSelected(event: any): void {
//     const files = event.target.files;
//     if (files && files.length > 0) {
//       this.selectedFile = files[0];
//     }
//   }

  addProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    const product: Product = {
      ...this.productForm.value
    };

    this.productService.addProduct(product).subscribe(
      () => {
        this.successMessage = 'Product added successfully!';
        this.resetForm();
        this.loadProducts();
        
        // Hide form and scroll to products section
        this.isFormVisible = false;
        setTimeout(() => {
          this.scrollToProducts();
        }, 500);
        
        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage = '', 3000);
      },
      (error) => {
        this.errorMessage = 'Failed to add product: ' + (error.error?.message || error.message || 'Unknown error');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    );
  }

  updateProduct(): void {
    if (this.productForm.invalid || !this.editingProductId) {
      return;
    }

    const product: Product = this.productForm.value;
    this.productService.updateProduct(this.editingProductId, product).subscribe(
      () => {
        this.successMessage = 'Product updated successfully!';
        this.resetForm();
        this.loadProducts();
        this.isFormVisible = false;
        
        setTimeout(() => {
          this.scrollToProducts();
        }, 500);
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      (error) => {
        this.errorMessage = 'Failed to update product: ' + (error.error?.message || error.message || 'Unknown error');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    );
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id || null;
    this.productForm.patchValue(product);
    this.isFormVisible = true;
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.deletingProductId = id;
      console.log('Attempting to delete product:', id);
      
      this.productService.deleteProduct(id).subscribe(
        () => {
          console.log('Product deleted successfully');
          this.successMessage = '✓ Product deleted successfully!';
          this.deletingProductId = null;
          this.loadProducts();
          setTimeout(() => this.successMessage = '', 3000);
        },
        (error) => {
          console.error('Error deleting product:', error);
          this.deletingProductId = null;
          
          // Check if it's a timeout error
          if (error.name === 'TimeoutError') {
            this.errorMessage = '⚠ Request timeout. Retrying...';
            // Retry once
            setTimeout(() => {
              this.productService.deleteProduct(id).subscribe(
                () => {
                  this.successMessage = '✓ Product deleted successfully (on retry)!';
                  this.loadProducts();
                  setTimeout(() => this.successMessage = '', 3000);
                },
                (retryError) => {
                  this.errorMessage = '✗ Failed to delete product: ' + (retryError.error?.message || retryError.message || 'Network error');
                  setTimeout(() => this.errorMessage = '', 5000);
                }
              );
            }, 1000);
          } else {
            // Show the actual error message
            const errorMsg = error.error?.message || error.message || 'Unknown error';
            this.errorMessage = '✗ Failed to delete product: ' + errorMsg;
            // Try to reload products to see current state
            setTimeout(() => this.loadProducts(), 2000);
            setTimeout(() => this.errorMessage = '', 5000);
          }
        }
      );
    }
  }

  saveProduct(): void {
    if (this.editingProductId) {
      this.updateProduct();
    } else {
      this.addProduct();
    }
  }

  scrollToProducts(): void {
    if (this.productsSection) {
      this.productsSection.nativeElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.editingProductId = null;
    this.isFormVisible = false;
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  filterProducts(): void {
    const searchLower = this.searchTerm.toLowerCase().trim();
    
    if (!searchLower) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description.toLowerCase().includes(searchLower);
        return nameMatch || descriptionMatch;
      });
    }
  }
}
