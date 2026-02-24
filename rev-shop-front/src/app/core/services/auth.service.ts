import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginDTO, RegisterDTO, LoginResponse, RegisterResponse, User, Role } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private roleSubject = new BehaviorSubject<Role | null>(this.getRoleFromStorage());
  public role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(dto: RegisterDTO, isAdmin: boolean = false): Observable<RegisterResponse> {
    // Determine the role - either from the DTO or the isAdmin flag
    let role: Role;
    if (dto.role) {
      role = dto.role;
    } else {
      role = isAdmin ? Role.ADMIN : Role.CUSTOMER;
    }

    const registrationData = {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: role
    };
    
    console.log('Auth Service - Registering with role:', role, 'DTO:', registrationData);
    
    // Use a single endpoint for both customer and admin registration
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, registrationData).pipe(
      tap(response => {
        console.log('Registration successful for role:', role);
      })
    );
  }

  login(dto: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setRole(response.role);
        this.setEmail(response.email);
        if (response.userId) {
          this.setUserId(response.userId);
        } else if (response.id) {
          this.setUserId(response.id);
        } else {
          // Extract userId from JWT token if not provided in response
          const userIdFromToken = this.extractUserIdFromToken(response.token);
          if (userIdFromToken) {
            this.setUserId(userIdFromToken);
          }
        }
        const user: User = {
          email: response.email,
          role: response.role,
          name: '',
        };
        this.currentUserSubject.next(user);
        this.roleSubject.next(response.role);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearStorage();
        this.currentUserSubject.next(null);
        this.roleSubject.next(null);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setRole(role: Role): void {
    localStorage.setItem('role', role);
  }

  getRole(): Role | null {
    const role = localStorage.getItem('role');
    return role as Role | null;
  }

  setEmail(email: string): void {
    localStorage.setItem('email', email);
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  setUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  getUserId(): number | null {
    let userId = localStorage.getItem('userId');
    console.log('Retrieved userId from storage:', userId);
    
    // If userId not in localStorage, try to extract from token
    if (!userId && this.getToken()) {
      const userIdFromToken = this.extractUserIdFromToken(this.getToken()!);
      if (userIdFromToken) {
        this.setUserId(userIdFromToken);
        return userIdFromToken;
      }
    }
    
    return userId ? parseInt(userId, 10) : null;
  }

  private extractUserIdFromToken(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('Decoded JWT payload:', decoded);
      
      // Try common field names for user ID in JWT
      const userId = decoded.userId || decoded.id || decoded.sub || decoded.user_id;
      if (userId) {
        const parsedId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        console.log('Extracted userId from token:', parsedId);
        return parsedId;
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === Role.ADMIN;
  }

  isCustomer(): boolean {
    return this.getRole() === Role.CUSTOMER;
  }

  private getUserFromStorage(): User | null {
    const role = this.getRoleFromStorage();
    const email = localStorage.getItem('email');
    if (role && email) {
      return {
        email,
        role,
        name: ''
      };
    }
    return null;
  }

  private getRoleFromStorage(): Role | null {
    const role = localStorage.getItem('role');
    return role as Role | null;
  }

  clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
