import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { LoginDTO } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isAdmin = false;
  errorMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleRole(): void {
    this.isAdmin = !this.isAdmin;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const loginDTO: LoginDTO = this.loginForm.value;
    console.log('Attempting login for:', this.isAdmin ? 'ADMIN' : 'CUSTOMER', 'Email:', loginDTO.email);

    this.authService.login(loginDTO).subscribe(
      (response) => {
        this.isLoading = false;
        console.log('Login successful with role:', response.role);
        
        // Route based on the actual role returned from server
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (response.role === 'CUSTOMER') {
          this.router.navigate(['/customer/dashboard']);
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid credentials';
        console.error('Login error:', error);
      }
    );
  }
}
