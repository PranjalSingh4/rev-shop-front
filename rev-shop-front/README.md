# RevShop - Angular E-Commerce Platform

A modern, feature-rich e-commerce application built with Angular featuring separate admin and customer panels.

## Features

### Authentication & Authorization
- **User Registration**: Separate registration for Admin and Customer roles
- **User Login**: Role-based authentication with Bearer token
- **JWT Token Management**: Automatic token storage and management
- **Role-Based Access Control**: Restricted access based on user roles

### Admin Panel Features
- **Dashboard**: View order statistics and sales metrics
  - Total number of orders
  - Total revenue
  - Recent orders overview
- **Product Management**:
  - Add new products with photo upload
  - Edit existing products
  - Delete products
  - View all products
- **Order Management**: View and track orders for seller's products
- **Multi-Seller Support**: Multiple admins can manage their own products

### Customer Panel Features
- **Product Browsing**: View all available products with descriptions and prices
- **Shopping Cart**:
  - Add products to cart with quantity selection
  - View cart items
  - Remove items from cart
  - Cart item count display in navbar
- **Order Management**:
  - Place orders from cart
  - View complete order history
  - See items in each order with quantities and prices
- **Order Summary**: Dashboard showing all placed orders

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Route protection & role-based guards
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Bearer token injection
│   │   ├── models/
│   │   │   └── index.ts               # All TypeScript interfaces
│   │   └── services/
│   │       ├── auth.service.ts        # Authentication service
│   │       ├── product.service.ts     # Product management
│   │       ├── cart.service.ts        # Shopping cart
│   │       ├── order.service.ts       # Order management
│   │       └── seller.service.ts      # Admin/seller operations
│   ├── shared/
│   │   └── components/
│   │       ├── navbar/                # Navigation bar
│   │       └── forbidden/             # 403 Access denied page
│   └── features/
│       ├── auth/
│       │   ├── login/                 # Login component
│       │   └── register/              # Register component
│       ├── admin/
│       │   ├── admin-dashboard/       # Admin statistics dashboard
│       │   └── product-management/    # Product CRUD operations
│       └── customer/
│           ├── customer-dashboard/    # Order history
│           ├── shop/                  # Product listing
│           └── cart/                  # Shopping cart
├── styles.css                         # Global styles
└── main.ts                           # Application bootstrap

```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm 10+
- Angular CLI 21+

### Steps

1. **Navigate to project directory**:
   ```bash
   cd rev-shop-front
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

4. **Build for production**:
   ```bash
   npm run build
   ```

## Configuration

### API Endpoint
The application is configured to connect to the backend API at:
```
http://localhost:8080/api
```

To change this, update the API URLs in the services:
- `src/app/core/services/auth.service.ts`
- `src/app/core/services/product.service.ts`
- `src/app/core/services/cart.service.ts`
- `src/app/core/services/order.service.ts`
- `src/app/core/services/seller.service.ts`

## Usage Guide

### For New Users

1. **Access the Application**:
   - Navigate to `http://localhost:4200`
   - You will be redirected to the login page

2. **Register a New Account**:
   - Click "Register here" link on login page
   - Choose "Register as Customer" for customer account
   - Choose "Register as Admin" for admin account
   - Fill in the registration form
   - Submit to create account

3. **Login**:
   - Enter your email and password
   - You will be automatically redirected based on your role

### For Customers

1. **Browse Products**:
   - Navigate to "Shop" in the navbar
   - View all available products
   - Select quantity for each product

2. **Add to Cart**:
   - Click "Add to Cart" button
   - Product will be added with your selected quantity
   - Cart item count updates in navbar

3. **Manage Cart**:
   - Click cart icon in navbar (🛒)
   - View all items in cart
   - Remove unwanted items
   - See cart summary and total

4. **Place Order**:
   - Click "Place Order" button
   - Order is created from cart items
   - Redirected to order history

5. **View Orders**:
   - Click "My Orders" in navbar
   - See all your orders
   - View items in each order
   - See order status and total

### For Admins

1. **View Dashboard**:
   - Navigate to "Dashboard" in navbar
   - See total number of orders
   - View total revenue
   - See recent orders with details

2. **Manage Products**:
   - Navigate to "Products" in navbar
   - Click "+ Add New Product" to add product
   - Fill in product details (name, description, price)
   - Upload product photo
   - Click "Add Product"

3. **Edit Products**:
   - On Products page, find the product
   - Click "Edit" button
   - Modify product details
   - Click "Update Product"

4. **Delete Products**:
   - Click "Delete" button on product card
   - Confirm deletion

5. **View Orders**:
   - Orders dashboard shows orders for your products
   - See customer information
   - Monitor order status

## API Integration

The application integrates with a Spring Boot backend. Expected API endpoints:

### Authentication APIs
```
POST /api/auth/register              # Customer registration
POST /api/auth/admin/register        # Admin registration
POST /api/auth/login                 # Login (returns token, role, email)
POST /api/auth/logout                # Logout
```

### Product APIs
```
POST /api/product/add                # Add product (multipart with image)
GET /api/product/all                 # Get all products
PUT /api/product/update/{id}         # Update product
DELETE /api/product/delete/{id}      # Delete product
```

### Cart APIs
```
POST /api/cart/add                   # Add to cart
GET /api/cart/{userId}               # View cart
DELETE /api/cart/remove              # Remove item from cart
```

### Order APIs
```
POST /api/order/place/{userId}       # Place order
GET /api/order/history/{userId}      # Get order history
```

### Seller APIs
```
GET /api/seller/orders/{sellerId}    # Get seller's orders
```

## Authentication Flow

1. **Login Request**:
   - User enters email and password
   - AuthService sends credentials to `/api/auth/login`

2. **Response**:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "role": "CUSTOMER",
     "email": "user@example.com"
   }
   ```

3. **Token Storage**:
   - Token, role, and email stored in localStorage
   - User redirected based on role:
     - ADMIN → `/admin/dashboard`
     - CUSTOMER → `/customer/dashboard`

4. **Interceptor**:
   - All subsequent HTTP requests include Bearer token
   - Format: `Authorization: Bearer <token>`

5. **Auto-logout**:
   - 401 Unauthorized responses trigger logout
   - User redirected to login page

## Styling & Design

- **Color Scheme**: Purple gradient (#667eea to #764ba2)
- **Font**: Poppins (from Google Fonts)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **CSS Grid/Flexbox**: Modern layout techniques
- **Smooth Animations**: Hover effects and transitions

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```
Output will be in `dist/rev-shop-front/`

### Key Dependencies
- @angular/core: ^21.1.0
- @angular/forms: ^21.1.0
- @angular/common: ^21.1.0
- rxjs: ^7.8 (for reactive programming)
- typescript: ^5.6

## Error Handling

- **401 Unauthorized**: Automatic logout and redirect to login
- **403 Forbidden**: Restricted access message shown
- **404 Not Found**: Redirected to forbidden page
- **Network Errors**: User-friendly error messages displayed
- **Form Validation**: Real-time validation with error messages

## LocalStorage Keys

- `token`: JWT authentication token
- `role`: User role (ADMIN/CUSTOMER)
- `email`: User email address

## Future Enhancements

- Payment gateway integration
- Product reviews and ratings
- Order tracking/shipping updates
- User profile management
- Search and filtering
- Wishlist functionality
- Email notifications
- Admin analytics dashboard

## Security Notes

- Never commit tokens or sensitive data
- Always use HTTPS in production
- Validate all inputs on backend
- Implement CSRF protection
- Use secure headers
- Rate limiting on auth endpoints

## Support

For issues or questions about the application, please check:
1. Browser console for error messages
2. Network tab for API failures
3. LocalStorage for token/role issues
4. Ensure backend server is running

## License

This project is part of the RevShop e-commerce platform.
