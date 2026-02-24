import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { ProductManagementComponent } from './features/admin/product-management/product-management.component';
import { CustomerDashboardComponent } from './features/customer/customer-dashboard/customer-dashboard.component';
import { ShopComponent } from './features/customer/shop/shop.component';
import { CartComponent } from './features/customer/cart/cart.component';
import { ForbiddenComponent } from './shared/components/forbidden/forbidden.component';
import { Role } from './core/models';
import { ProductResolver } from './core/resolvers/product.resolver';
import { OrderResolver } from './core/resolvers/order.resolver';
import { CustomerOrderResolver } from './core/resolvers/customer-order.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forbidden', component: ForbiddenComponent },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: [Role.ADMIN] },
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        resolve: { orders: OrderResolver }
      },
      {
        path: 'products',
        component: ProductManagementComponent,
        resolve: { products: ProductResolver }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Customer Routes
  {
    path: 'customer',
    canActivate: [RoleGuard],
    data: { roles: [Role.CUSTOMER] },
    children: [
      {
        path: 'dashboard',
        component: CustomerDashboardComponent,
        resolve: { orders: CustomerOrderResolver }
      },
      {
        path: 'shop',
        component: ShopComponent,
        resolve: { products: ProductResolver }
      },
      { path: 'cart', component: CartComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Wildcard route
  { path: '**', redirectTo: 'forbidden' }
];
