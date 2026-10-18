import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../service/authentication.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrapper min-h-screen flex align-items-center justify-content-center p-4">
      <div class="login-card p-card p-5 border-round-2xl shadow-6 w-full max-w-28rem surface-card">
        <!-- Brand Header -->
        <div class="text-center mb-5">
          <div class="inline-flex align-items-center justify-content-center bg-blue-50 border-circle w-4rem h-4rem mb-3 shadow-1">
            <i class="pi pi-chart-line text-3xl text-primary"></i>
          </div>
          <h1 class="text-2xl font-bold text-900 m-0 flex align-items-center justify-content-center gap-2">
            FinVane <span class="text-primary font-semibold">ERP</span>
          </h1>
          <span class="p-badge p-badge-info mt-2 text-xs font-medium">v27.20 Enterprise</span>
          <p class="text-500 text-sm mt-2 mb-0">Sign in to your commercial workspace</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="bg-red-50 border-1 border-red-200 border-round p-3 mb-4 flex align-items-center gap-2 text-red-700 text-sm">
          <i class="pi pi-exclamation-circle text-base"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" class="flex flex-column gap-3">
          <div>
            <label class="block font-semibold text-sm text-700 mb-1">Username / Email</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-user text-500"></i>
              <input type="text" pInputText [(ngModel)]="username" name="username" class="w-full" placeholder="admin" required />
            </span>
          </div>

          <div>
            <label class="block font-semibold text-sm text-700 mb-1">Password</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock text-500"></i>
              <input type="password" pInputText [(ngModel)]="password" name="password" class="w-full" placeholder="••••••••" required />
            </span>
          </div>

          <div>
            <label class="block font-semibold text-sm text-700 mb-1">Commercial Entity</label>
            <select [(ngModel)]="selectedTenant" name="tenant" class="w-full p-2 border-1 surface-border border-round text-sm font-medium">
              <option value="1">Company 1: Pune Manufacturing Ltd (GST 27AABCP1234F1Z5)</option>
              <option value="2">Company 2: FinVane Software & Services</option>
            </select>
          </div>

          <div class="flex align-items-center justify-content-between my-1">
            <div class="flex align-items-center gap-2">
              <input type="checkbox" id="remember" [(ngModel)]="rememberMe" name="remember" />
              <label for="remember" class="text-xs text-600 cursor-pointer">Remember me</label>
            </div>
            <a class="text-xs text-primary font-medium hover:underline cursor-pointer">Forgot password?</a>
          </div>

          <button pButton type="submit" label="Sign In to ERP" icon="pi pi-sign-in" class="w-full p-button-primary mt-2" [loading]="loading"></button>

          <!-- Quick Fill Demo -->
          <button pButton type="button" label="Fill Demo Credentials (admin / admin)" icon="pi pi-bolt" class="w-full p-button-outlined p-button-secondary p-button-sm text-xs" (click)="fillDemo()"></button>
        </form>

        <div class="text-center mt-4 pt-3 border-top-1 surface-border">
          <span class="text-xs text-400">ARCSET-U Architecture &copy; 2026 FinVane Inc.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%);
    }
    .login-card {
      max-width: 420px;
    }
  `]
})
export class LoginComponent implements OnInit {
  username = 'admin';
  password = 'admin';
  selectedTenant = '1';
  rememberMe = true;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedTenant = this.authService.getActiveTenant();
  }

  fillDemo() {
    this.username = 'admin';
    this.password = 'admin';
    this.errorMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.authService.setActiveTenant(this.selectedTenant);
      const success = this.authService.login(this.username, this.password);
      this.loading = false;
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Invalid credentials';
      }
    }, 400);
  }
}
