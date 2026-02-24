import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AddressService } from '../../../core/services/address.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartItem, Address } from '../../../core/models';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AddressFormComponent } from '../../../shared/components/address-form/address-form.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent, AddressFormComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;
  userId: number = 0;
  message = '';
  isPlacingOrder = false;
  loadingProductId: number | null = null;
  
  // Address management properties
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  isLoadingAddresses = false;
  showAddressForm = false;
  isCreatingAddress = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get userId from auth service
    const id = this.authService.getUserId();
    console.log('User ID:', id);
    if (id) {
      this.userId = id;
      this.loadCart();
      this.loadAddresses();
    } else {
      this.message = 'Please login first';
      this.isLoading = false;
    }
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.viewCart(this.userId).subscribe(
      (items) => {
        console.log('Cart loaded successfully:', items);
        this.cartItems = items && Array.isArray(items) ? items : [];
        console.log('CartItems assigned:', this.cartItems);
        console.log('CartItems length:', this.cartItems.length);
        this.isLoading = false;
        
        // Also log individual items for debugging
        if (this.cartItems.length > 0) {
          this.cartItems.forEach((item, index) => {
            console.log(`Item ${index}:`, item, 'Product:', item.product);
          });
        } else {
          console.log('Cart is empty');
        }
      },
      (error) => {
        console.error('Error loading cart:', error);
        const errorMsg = error?.message || 'Failed to load cart';
        this.message = errorMsg;
        this.cartItems = [];
        this.isLoading = false;
        setTimeout(() => this.message = '', 4000);
      }
    );
  }

  removeItem(productId: number): void {
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }

    this.loadingProductId = productId;
    
    this.cartService.removeFromCart(this.userId, productId).subscribe(
      () => {
        // Update UI immediately (Optimistic Update)
        this.cartItems = this.cartItems.filter(
          item => item.product.id !== productId
        );
        
        this.message = '✓ Item removed successfully!';
        this.loadingProductId = null;
        setTimeout(() => this.message = '', 3000);
      },
      (error) => {
        console.error('Error removing item:', error);
        this.loadingProductId = null;
        const errorMsg = error?.message || 'Failed to remove item';
        this.message = `✗ ${errorMsg}`;
        // Reload cart to ensure sync with backend
        setTimeout(() => this.loadCart(), 2000);
        setTimeout(() => this.message = '', 4000);
      }
    );
  }

  getCartTotal(): number {
    if (!this.cartItems || !Array.isArray(this.cartItems)) {
      return 0;
    }
    return this.cartItems.reduce((total, item) => {
      const price = item?.product?.price || 0;
      const quantity = item?.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.message = 'Your cart is empty';
      return;
    }

    if (!this.selectedAddressId) {
      this.message = 'Please select or create a delivery address';
      return;
    }

    this.isPlacingOrder = true;
    
    // Get the selected address
    const selectedAddress = this.addresses.find(addr => addr.id === this.selectedAddressId);
    
    this.orderService.placeOrder(this.userId, this.selectedAddressId).subscribe(
      (response) => {
        this.isPlacingOrder = false;
        
        // Store order details in localStorage with address information
        const orders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        const newOrder = {
          id: response.orderId || Date.now(),
          userId: this.userId,
          items: this.cartItems,
          total: this.getCartTotal(),
          address: selectedAddress, // Include the address details
          orderDate: new Date().toISOString(),
          status: response.status || 'Placed'
        };
        orders.push(newOrder);
        localStorage.setItem('user_orders', JSON.stringify(orders));
        
        this.message = '✓ Order placed successfully!';
        console.log('Order saved with address:', newOrder);
        setTimeout(() => {
          this.router.navigate(['/customer/dashboard']);
        }, 2000);
      },
      (error) => {
        this.isPlacingOrder = false;
        console.error('Error placing order:', error);
        this.message = error.error?.message || 'Failed to place order: ' + error.message;
        setTimeout(() => this.message = '', 5000);
      }
    );
  }

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.addressService.getAddresses(this.userId).subscribe(
      (addresses) => {
        this.addresses = addresses || [];
        // Auto-select the default address if available
        const defaultAddress = this.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id || null;
        }
        this.isLoadingAddresses = false;
      },
      (error) => {
        console.error('Error loading addresses:', error);
        this.isLoadingAddresses = false;
      }
    );
  }

  onAddressSubmit(address: Omit<Address, 'id'>): void {
    this.isCreatingAddress = true;
    const addressWithUserId = { ...address, userId: this.userId };
    
    // Save to local storage via service (no API call)
    this.addressService.createAddress(addressWithUserId).subscribe(
      (newAddress) => {
        this.isCreatingAddress = false;
        this.addresses.push(newAddress);
        this.selectedAddressId = newAddress.id || null;
        this.showAddressForm = false;
        this.message = '✓ Address saved successfully! (Stored locally)';
        console.log('Address saved to UI:', newAddress);
        setTimeout(() => this.message = '', 3000);
      },
      (error) => {
        this.isCreatingAddress = false;
        console.error('Error creating address:', error);
        this.message = '✗ Failed to save address';
        setTimeout(() => this.message = '', 5000);
      }
    );
  }

  onAddressCancel(): void {
    this.showAddressForm = false;
  }

  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe(
        () => {
          this.addresses = this.addresses.filter(addr => addr.id !== addressId);
          if (this.selectedAddressId === addressId) {
            this.selectedAddressId = null;
          }
          this.message = '✓ Address deleted successfully! (Removed from local storage)';
          console.log('Address deleted from UI:', addressId);
          setTimeout(() => this.message = '', 3000);
        },
        (error) => {
          console.error('Error deleting address:', error);
          this.message = '✗ Failed to delete address';
          setTimeout(() => this.message = '', 5000);
        }
      );
    }
  }
}
