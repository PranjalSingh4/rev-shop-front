import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="forbidden-container">
      <div class="forbidden-card">
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <div class="button-group">
          <button (click)="goBack()" class="btn-secondary">Go Back</button>
          <a routerLink="/" class="btn-primary">Home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forbidden-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forbidden-card {
      background: white;
      padding: 60px 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      text-align: center;
    }

    h1 {
      color: #dc3545;
      font-size: 72px;
      margin: 0;
    }

    h2 {
      color: #333;
      margin: 10px 0 20px 0;
    }

    p {
      color: #666;
      font-size: 16px;
      margin-bottom: 30px;
    }

    .button-group {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    button, a {
      padding: 12px 30px;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover {
      background: #ddd;
    }
  `]
})
export class ForbiddenComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
