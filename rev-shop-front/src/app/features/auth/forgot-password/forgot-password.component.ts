import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  step: 'email' | 'reset' = 'email'; // Track which step user is on
  resetEmail = '';
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  requestPasswordReset(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotForm.get('email')?.value;
    this.resetEmail = email;

    // Send request to backend to initiate password reset
    this.http.post(`${this.apiUrl}/forgot-password`, { email }).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset instructions have been sent to your email!';
        console.log('Password reset initiated:', response);
        
        // Show message and redirect after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to initiate password reset. Please try again.';
        console.error('Error requesting password reset:', error);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
