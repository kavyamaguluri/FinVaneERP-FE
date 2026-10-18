import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, RegisterPayload, LoginPayload } from '../../service/authentication.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrapper min-h-screen flex align-items-center justify-content-center p-4">
      <div class="login-card p-card p-5 border-round-2xl shadow-8 w-full surface-card">
        <!-- Brand Header -->
        <div class="text-center mb-4">
          <div class="inline-flex align-items-center justify-content-center bg-blue-50 border-circle w-3rem h-3rem mb-2 shadow-1">
            <i class="pi pi-chart-line text-2xl text-primary"></i>
          </div>
          <h1 class="text-2xl font-bold text-900 m-0 flex align-items-center justify-content-center gap-2">
            FinVane <span class="text-primary font-semibold">ERP</span>
          </h1>
          <span class="p-badge p-badge-info mt-1 text-xs font-medium">Enterprise v27.20</span>
        </div>

        <!-- Mode Switcher Tabs (Sign In vs Register) -->
        <div class="flex border-round-lg surface-100 p-1 mb-4">
          <button type="button"
                  class="flex-1 py-2 text-sm font-semibold border-none border-round-md transition-all cursor-pointer"
                  [ngClass]="{'surface-card text-primary shadow-1': mode === 'LOGIN', 'surface-transparent text-600': mode !== 'LOGIN'}"
                  (click)="switchMode('LOGIN')">
            <i class="pi pi-sign-in mr-1"></i> Sign In
          </button>
          <button type="button"
                  class="flex-1 py-2 text-sm font-semibold border-none border-round-md transition-all cursor-pointer"
                  [ngClass]="{'surface-card text-primary shadow-1': mode === 'REGISTER', 'surface-transparent text-600': mode !== 'REGISTER'}"
                  (click)="switchMode('REGISTER')">
            <i class="pi pi-user-plus mr-1"></i> Register New User
          </button>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="bg-red-50 border-1 border-red-200 border-round p-3 mb-3 flex align-items-center gap-2 text-red-700 text-sm">
          <i class="pi pi-exclamation-circle text-base flex-shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Success Alert -->
        <div *ngIf="successMessage" class="bg-green-50 border-1 border-green-200 border-round p-3 mb-3 flex align-items-center gap-2 text-green-700 text-sm">
          <i class="pi pi-check-circle text-base flex-shrink-0"></i>
          <span>{{ successMessage }}</span>
        </div>

        <!-- ================= LOGIN FORM ================= -->
        <form *ngIf="mode === 'LOGIN'" (ngSubmit)="onLogin()" class="flex flex-column gap-3">
          <div>
            <label class="block font-semibold text-xs text-700 uppercase mb-1">Username or Email</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-user text-500"></i>
              <input type="text" pInputText [(ngModel)]="loginUsername" name="loginUsername" class="w-full text-sm" placeholder="Enter username or email" required autofocus />
            </span>
          </div>

          <div>
            <label class="block font-semibold text-xs text-700 uppercase mb-1">Password</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock text-500"></i>
              <input type="password" pInputText [(ngModel)]="loginPassword" name="loginPassword" class="w-full text-sm" placeholder="Enter password" required />
            </span>
          </div>

          <button pButton type="submit" label="Sign In" icon="pi pi-sign-in" class="w-full p-button-primary mt-2" [loading]="loading"></button>

          <div class="text-center mt-2">
            <span class="text-xs text-500">New user? </span>
            <a class="text-xs text-primary font-semibold cursor-pointer hover:underline" (click)="switchMode('REGISTER')">Register here</a>
          </div>
        </form>

        <!-- ================= REGISTER FORM ================= -->
        <form *ngIf="mode === 'REGISTER'" (ngSubmit)="onRegister()" class="flex flex-column gap-3">
          <div>
            <label class="block font-semibold text-xs text-700 uppercase mb-1">Full Legal Name *</label>
            <input type="text" pInputText [(ngModel)]="regFullName" name="regFullName" class="w-full text-sm" placeholder="e.g. Jane Doe" required />
          </div>

          <div class="grid p-0 m-0">
            <div class="col-6 pl-0 pr-1 py-0">
              <label class="block font-semibold text-xs text-700 uppercase mb-1">Username *</label>
              <input type="text" pInputText [(ngModel)]="regUsername" name="regUsername" class="w-full text-sm" placeholder="e.g. janedoe" required />
            </div>
            <div class="col-6 pr-0 pl-1 py-0">
              <label class="block font-semibold text-xs text-700 uppercase mb-1">Email *</label>
              <input type="email" pInputText [(ngModel)]="regEmail" name="regEmail" class="w-full text-sm" placeholder="jane@example.com" required />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-xs text-700 uppercase mb-1">Password *</label>
            <input type="password" pInputText [(ngModel)]="regPassword" name="regPassword" class="w-full text-sm" placeholder="Create secure password (min 6 chars)" required />
          </div>

          <!-- Role Selection (CLIENT_ADMIN vs CLIENT_USER) -->
          <div>
            <label class="block font-semibold text-xs text-700 uppercase mb-1">Select Role *</label>
            <div class="grid p-0 m-0 gap-2">
              <div class="col border-1 border-round p-2 cursor-pointer transition-all flex align-items-center gap-2"
                   [ngClass]="{'border-primary bg-blue-50': regRole === 'CLIENT_ADMIN', 'surface-border surface-50': regRole !== 'CLIENT_ADMIN'}"
                   (click)="regRole = 'CLIENT_ADMIN'">
                <i class="pi pi-briefcase text-blue-600"></i>
                <div>
                  <div class="text-xs font-bold text-900">Client Admin</div>
                  <div class="text-xxs text-600">Company Administrator</div>
                </div>
              </div>

              <div class="col border-1 border-round p-2 cursor-pointer transition-all flex align-items-center gap-2"
                   [ngClass]="{'border-primary bg-blue-50': regRole === 'CLIENT_USER', 'surface-border surface-50': regRole !== 'CLIENT_USER'}"
                   (click)="regRole = 'CLIENT_USER'">
                <i class="pi pi-user text-green-600"></i>
                <div>
                  <div class="text-xs font-bold text-900">Client User</div>
                  <div class="text-xxs text-600">Operator / Transactions</div>
                </div>
              </div>
            </div>
            <span class="text-xxs text-500 block mt-1">
              * System Admin access is reserved for platform administrator and granted via User Management.
            </span>
          </div>

          <button pButton type="submit" label="Register & Sign In" icon="pi pi-user-plus" class="w-full p-button-success mt-1" [loading]="loading"></button>

          <div class="text-center mt-2">
            <span class="text-xs text-500">Already registered? </span>
            <a class="text-xs text-primary font-semibold cursor-pointer hover:underline" (click)="switchMode('LOGIN')">Sign In</a>
          </div>
        </form>

        <div class="text-center mt-4 pt-3 border-top-1 surface-border">
          <span class="text-xs text-400">Enterprise Accounting Engine &copy; 2026 FinVane Inc.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%);
    }
    .login-card {
      max-width: 440px;
    }
    .text-xxs {
      font-size: 0.65rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  mode: 'LOGIN' | 'REGISTER' = 'LOGIN';

  // Login inputs
  loginUsername = '';
  loginPassword = '';

  // Register inputs
  regFullName = '';
  regUsername = '';
  regEmail = '';
  regPassword = '';
  regRole: 'CLIENT_ADMIN' | 'CLIENT_USER' = 'CLIENT_ADMIN';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  switchMode(newMode: 'LOGIN' | 'REGISTER') {
    this.mode = newMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginUsername.trim() || !this.loginPassword.trim()) {
      this.errorMessage = 'Please enter both username/email and password';
      return;
    }

    this.loading = true;
    const payload: LoginPayload = {
      username: this.loginUsername.trim(),
      password: this.loginPassword
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid username or password';
      }
    });
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.regFullName.trim() || !this.regUsername.trim() || !this.regEmail.trim() || !this.regPassword.trim()) {
      this.errorMessage = 'All fields are required to register';
      return;
    }

    if (this.regPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    const payload: RegisterPayload = {
      fullName: this.regFullName.trim(),
      username: this.regUsername.trim(),
      email: this.regEmail.trim(),
      password: this.regPassword,
      role: this.regRole,
      tenantId: '1'
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = 'Registration successful! Redirecting to workspace...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 600);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Registration failed. Please check your details.';
      }
    });
  }
}
