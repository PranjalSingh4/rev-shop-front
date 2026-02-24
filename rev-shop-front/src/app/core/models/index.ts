export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  email: string;
  userId?: number;
  id?: number;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  photo?: string;
  sellerId?: number;
}

export interface Cart {
  id?: number;
  userId: number;
  items: CartItem[];
}

export interface CartItem {
  id?: number;
  cartId?: number;
  product: Product;
  quantity: number;
}

export interface Order {
  id?: number;
  userId: number;
  status: string;
  items: OrderItem[];
  createdDate?: Date;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderDTO {
  orderId: number;
  status: string;
  userId: number;
}

export interface Review {
  id?: number;
  rating: number;
  comment: string;
  userId: number;
  productId: number;
}

export interface Dashboard {
  totalOrders: number;
  totalRevenue?: number;
  totalProducts?: number;
  orderDetails?: any[];
}
export interface Address {
  id?: number;
  userId: number;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface Favorite {
  id?: number;
  userId: number;
  productId: number;
  product?: Product;
  createdDate?: Date;
}