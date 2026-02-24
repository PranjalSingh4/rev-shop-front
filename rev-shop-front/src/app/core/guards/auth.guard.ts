import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      const requiredRoles = route.data['roles'] as Role[];
      
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      if (this.authService.getRole() && requiredRoles.includes(this.authService.getRole()!)) {
        return true;
      } else {
        this.router.navigate(['/forbidden']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Role[];
    const userRole = this.authService.getRole();

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (requiredRoles && requiredRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/forbidden']);
    return false;
  }
}
