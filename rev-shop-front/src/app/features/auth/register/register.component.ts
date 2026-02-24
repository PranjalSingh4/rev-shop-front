import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RegisterDTO, Role } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  role: Role = Role.CUSTOMER;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  setRole(role: string): void {
    if (role === 'ADMIN') {
      this.role = Role.ADMIN;
    } else if (role === 'CUSTOMER') {
      this.role = Role.CUSTOMER;
    }
    console.log('Role set to:', this.role);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const dto: RegisterDTO = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      role: this.role
    };

    const isAdmin = this.role === Role.ADMIN;
    console.log('Registering with role:', this.role, 'isAdmin:', isAdmin, 'DTO:', dto);
    
    this.authService.register(dto, isAdmin).subscribe(
      (response) => {
        this.isLoading = false;
        const roleLabel = isAdmin ? 'Seller' : 'Buyer';
        this.successMessage = response.message || `${roleLabel} registration successful! Please login.`;
        console.log('Registration successful for:', this.role);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      (error) => {
        this.isLoading = false;
        const roleLabel = isAdmin ? 'Seller' : 'Buyer';
        this.errorMessage = error.error?.message || `${roleLabel} registration failed. Please try again.`;
        console.error('Registration error:', error);
      }
    );
  }
}
