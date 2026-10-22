import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../service/authentication.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="d-flex align-items-center"
         style="min-height: 100vh; background: linear-gradient(160deg, #042f2e 0%, #0d9488 55%, #2dd4bf 100%);">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-4">
            <div class="card p-4 border-0" style="border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.25); background: #ffffff;">
              <div class="text-center mb-3">
                <div style="font-size: 2rem; color: #0d9488; line-height: 1;">◆</div>
                <h3 class="mb-0" style="font-weight: 800; letter-spacing: -.02em;">Fin Vane ERP</h3>
                <p class="text-muted small mb-0">Accounting ERP for Indian SMEs</p>
              </div>

              <!-- Error Alert -->
              <div *ngIf="errorMessage" class="alert alert-danger py-2">
                {{ errorMessage }}
              </div>

              <!-- Login Form matching Express login.ejs exactly -->
              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email"
                         name="email"
                         [(ngModel)]="email"
                         class="form-control"
                         placeholder="admin@bharaterp.local"
                         required
                         autofocus />
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password"
                         name="password"
                         [(ngModel)]="password"
                         class="form-control"
                         placeholder="••••••••"
                         required />
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.loading = true;
    this.authService.login({ username: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Invalid username or password. Please verify your credentials.';
      }
    });
  }
}
